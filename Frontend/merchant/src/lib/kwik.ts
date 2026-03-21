import { logger, urls } from "@vayva/shared";

// Kwik Logistics Service (Staging Integration)
const KWIK_BASE_URL = process.env.KWIK_BASE_URL || urls.kwikStagingBase();
const KWIK_EMAIL = process.env.KWIK_EMAIL;
const KWIK_PASSWORD = process.env.KWIK_PASSWORD;

// Token cache with TTL (30 minutes)
interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;
const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface KwikAuthResponse {
  status: number | boolean;
  message?: string;
  data?: {
    token?: string;
  };
}

interface KwikPricingResponse {
  status: number | boolean;
  message?: string;
  data?: {
    estimated_price?: number;
    estimated_eta?: number;
  };
}

interface KwikTaskResponse {
  status: number;
  message?: string;
  data?: {
    job_id?: string;
    unique_id?: string;
    tracking_url?: string;
    rider?: {
      name?: string;
      phone?: string;
      latitude?: number;
      longitude?: number;
      vehicle_type?: string;
      photo_url?: string;
    };
    pickup?: {
      latitude?: number;
      longitude?: number;
      address?: string;
    };
    delivery?: {
      latitude?: number;
      longitude?: number;
      address?: string;
    };
    status?: string;
    eta?: number;
  };
}

interface QuoteData {
  pickupAddress: string;
  deliveryAddress: string;
  vehicleType?: "bike" | "car" | "van";
  weightKg?: number;
}

interface ParcelData {
  description: string;
  weight: number;
  isFragile: boolean;
}

interface PickupData {
  address: string;
  name: string;
  phone: string;
  email?: string;
}

interface DeliveryData {
  address: string;
  name: string;
  phone: string;
  email?: string;
}

interface PickupRequestData {
  parcel: ParcelData;
  pickup: PickupData;
  delivery: DeliveryData;
}

async function getKwikToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }
  
  if (!KWIK_EMAIL || !KWIK_PASSWORD) {
    logger.error("Kwik Credentials Missing");
    throw new Error("Kwik integration is not configured (missing env variables).");
  }
  
  try {
    const res = await fetch(`${KWIK_BASE_URL}/vendor/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: KWIK_EMAIL, password: KWIK_PASSWORD })
    });
    
    if (!res.ok) {
      const err = await res.text();
      logger.error("[Kwik] Auth failed", { response: err });
      throw new Error("Kwik Auth Failed: " + res.statusText);
    }
    
    const data = await res.json() as KwikAuthResponse;
    const token = data.data?.token;
    
    if (!token) {
      throw new Error("Kwik Auth Failed: No token in response");
    }
    
    // Cache token with TTL
    tokenCache = {
      token,
      expiresAt: Date.now() + TOKEN_TTL_MS
    };
    
    return token;
  } catch (error) {
    logger.error("[Kwik] Token error", { error: (error as Error)?.message });
    throw error;
  }
}

export const KwikService = {
    async getQuote(data: QuoteData) {
        const token = await getKwikToken();
        const vehicleMap: Record<string, number> = { bike: 1, car: 2, van: 3 };
        const vehicleId = vehicleMap[data.vehicleType || "bike"] || 1;
        
        const payload = {
            pickup_address: data.pickupAddress,
            delivery_address: data.deliveryAddress,
            parcel_size: vehicleId,
            weight: data.weightKg,
            is_multiple_delivery: 0
        };
        
        const res = await fetch(`${KWIK_BASE_URL}/pricing/calculate_price`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const json = await res.json() as KwikPricingResponse;
        if (json.status !== 1 && json.status !== true) {
            logger.error("[Kwik] Pricing error", { response: json });
            throw new Error(json.message || "Pricing Failed");
        }
        const cost = json.data?.estimated_price || 0;
        return {
            provider: "kwik",
            estimatedPrice: cost,
            priceKobo: cost * 100,
            etaMinutes: json.data?.estimated_eta || 120,
            vehicle: data.vehicleType || "bike",
            debug_token_used: !!token
        };
    },
    
    async requestPickup(data: PickupRequestData) {
        const token = await getKwikToken();
        const payload = {
            domain_name: "staging-client-panel.kwik.delivery",
            pickup_delivery_relationship: 0,
            vehicle_id: 1,
            parcels: [
                {
                    description: data.parcel.description,
                    weight: data.parcel.weight,
                    is_fragile: data.parcel.isFragile ? 1 : 0
                }
            ],
            pickups: [
                {
                    address: data.pickup.address,
                    name: data.pickup.name,
                    phone: data.pickup.phone,
                    email: data.pickup.email,
                    time: new Date().toISOString()
                }
            ],
            deliveries: [
                {
                    address: data.delivery.address,
                    name: data.delivery.name,
                    phone: data.delivery.phone,
                    email: data.delivery.email,
                    has_return_task: 0
                }
            ]
        };
        
        const res = await fetch(`${KWIK_BASE_URL}/tasks/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const json = await res.json() as KwikTaskResponse;
        if (json.status !== 1) {
            throw new Error(json.message || "Booking Failed");
        }
        return {
            jobId: json.data?.job_id || json.data?.unique_id,
            trackingUrl: json.data?.tracking_url,
            status: "pending"
        };
    },
    
    async getJobDetails(jobId: string) {
        const token = await getKwikToken();
        const res = await fetch(`${KWIK_BASE_URL}/tasks/${jobId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        const json = await res.json() as KwikTaskResponse;
        if (json.status !== 1) {
            throw new Error(json.message || "Failed to fetch job details");
        }
        return {
            jobId: json.data?.job_id || jobId,
            status: json.data?.status || "unknown",
            trackingUrl: json.data?.tracking_url,
            rider: json.data?.rider ? {
                name: json.data.rider.name,
                phone: json.data.rider.phone,
                latitude: json.data.rider.latitude,
                longitude: json.data.rider.longitude,
                vehicleType: json.data.rider.vehicle_type,
                photoUrl: json.data.rider.photo_url,
            } : null,
            pickup: json.data?.pickup ? {
                latitude: json.data.pickup.latitude,
                longitude: json.data.pickup.longitude,
                address: json.data.pickup.address,
            } : null,
            delivery: json.data?.delivery ? {
                latitude: json.data.delivery.latitude,
                longitude: json.data.delivery.longitude,
                address: json.data.delivery.address,
            } : null,
            etaMinutes: json.data?.eta,
        };
    },
    
    async trackRider(jobId: string) {
        const token = await getKwikToken();
        const res = await fetch(`${KWIK_BASE_URL}/tasks/${jobId}/rider_location`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        const json = await res.json() as {
            status: number;
            message?: string;
            data?: {
                latitude: number;
                longitude: number;
                heading?: number;
                speed?: number;
                updated_at?: string;
            };
        };
        if (json.status !== 1) {
            throw new Error(json.message || "Failed to track rider");
        }
        return {
            latitude: json.data?.latitude,
            longitude: json.data?.longitude,
            heading: json.data?.heading,
            speed: json.data?.speed,
            updatedAt: json.data?.updated_at,
        };
    }
};
