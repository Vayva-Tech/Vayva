import { logger } from "@vayva/shared";

export interface CreateJobParams {
    pickup: {
        name: string;
        phone: string;
        address: string;
    };
    dropoff: {
        name: string;
        phone: string;
        address: string;
    };
    items: Array<{ description: string; quantity: number }>;
    vehicleType?: string;
}

export interface JobResult {
    providerJobId: string;
    trackingUrl?: string;
    status: string;
}

const KWIK_API_BASE_URL = process.env.KWIK_API_BASE_URL || "https://api.kwik.delivery/v1";

export class KwikProvider {
    private apiKey: string;
    private isSandbox: boolean;
    private baseUrl: string;

    constructor() {
        this.apiKey = process.env.KWIK_API_KEY || "";
        this.isSandbox = process.env.NODE_ENV !== "production";
        this.baseUrl = process.env.KWIK_API_BASE_URL || "https://api.kwik.delivery/v1";
    }

    async createJob(params: CreateJobParams): Promise<JobResult> {
        if (!this.apiKey) {
            throw new Error("[KwikProvider] KWIK_API_KEY is not configured");
        }

        const payload = {
            pickup: {
                name: params.pickup.name,
                phone: params.pickup.phone,
                address: params.pickup.address,
            },
            dropoff: {
                name: params.dropoff.name,
                phone: params.dropoff.phone,
                address: params.dropoff.address,
            },
            items: params.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
            })),
            vehicle_type: params.vehicleType || "BIKE",
            sandbox: this.isSandbox,
        };

        const response = await fetch(`${this.baseUrl}/jobs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`,
                "X-Request-ID": `vayva_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error("[KwikProvider] API request failed", {
                status: response.status,
                error: errorText,
                app: "worker",
            });
            throw new Error(`Kwik API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json() as {
            job_id: string;
            status: string;
            tracking_url?: string;
        };

        logger.info("[KwikProvider] Job created successfully", {
            providerJobId: data.job_id,
            status: data.status,
            app: "worker",
        });

        return {
            providerJobId: data.job_id,
            status: data.status,
            trackingUrl: data.tracking_url,
        };
    }
}
