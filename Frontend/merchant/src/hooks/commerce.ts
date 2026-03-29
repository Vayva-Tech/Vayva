"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types for our commerce APIs
interface InventoryAdjustment {
  id: string;
  productId?: string;
  variantId?: string;
  locationId?: string;
  delta: number;
  reason: string;
  reference?: string;
  note?: string;
  createdBy: string;
  createdAt: string;
}

interface StockLevel {
  id: string;
  productId: string;
  variantId?: string;
  locationId?: string;
  quantity: number;
  reserved: number;
  available: number;
  reorderPoint?: number;
  maxStock?: number;
  lastCountedAt?: string;
}

interface MultiLocationStock {
  productId: string;
  productName: string;
  locations: Array<{
    locationId: string;
    locationName: string;
    quantity: number;
    reserved: number;
    available: number;
  }>;
  totalAvailable: number;
}

interface PosDevice {
  id: string;
  name: string;
  locationId: string;
  status: "online" | "offline" | "maintenance";
  lastSeenAt?: string;
  registeredAt: string;
}

interface CashSession {
  id: string;
  deviceId: string;
  openedBy: string;
  closedBy?: string;
  openingAmount: number;
  closingAmount?: number;
  cashSales: number;
  cashReturns: number;
  payouts: number;
  deposits: number;
  status: "open" | "closed" | "reconciled";
  openedAt: string;
  closedAt?: string;
}

interface SubscriptionBox {
  id: string;
  name: string;
  description?: string;
  frequency: string;
  pricing: {
    monthly: number;
    quarterly: number;
    annual: number;
  };
  status: "active" | "inactive" | "draft";
  stats: {
    totalSubscribers: number;
    activeSubscribers: number;
    pausedSubscribers: number;
    cancelledSubscribers: number;
  };
  createdAt: string;
}

interface BoxSubscription {
  id: string;
  boxId: string;
  boxName: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  status: "active" | "paused" | "cancelled" | "expired";
  startDate: string;
  endDate?: string;
  nextBillingDate?: string;
  frequency: string;
  currentPricing: number;
  preferences: Record<string, unknown>;
  createdAt: string;
}

interface RentalBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  startsAt: string;
  endsAt: string;
  durationDays: number;
  notes?: string;
  createdAt: string;
}

// Generic API fetch helper
async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  
  return res.json();
}

// === INVENTORY HOOKS ===

export function useInventoryAdjustments(productId?: string, locationId?: string) {
  return useQuery({
    queryKey: ["inventory-adjustments", productId, locationId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (productId) params.append("productId", productId);
      if (locationId) params.append("locationId", locationId);
      
      return apiFetch<{ adjustments: InventoryAdjustment[] }>(
        `/api/inventory/adjustments?${params}`
      );
    },
  });
}

export function useCreateInventoryAdjustment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<InventoryAdjustment, "id" | "createdAt" | "createdBy">) => {
      return apiFetch<{ adjustment: InventoryAdjustment }>("/inventory/adjustments", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["stock-levels"] });
      toast.success("Inventory adjustment recorded");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record adjustment");
    },
  });
}

export function useStockLevels(productId?: string, locationId?: string) {
  return useQuery({
    queryKey: ["stock-levels", productId, locationId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (productId) params.append("productId", productId);
      if (locationId) params.append("locationId", locationId);
      
      return apiFetch<{ stockLevels: StockLevel[] }>(
        `/api/inventory/stock?${params}`
      );
    },
  });
}

export function useUpdateStockLevel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ variantId, quantity }: { variantId: string; quantity: number }) => {
      return apiFetch<{ stockLevel: StockLevel }>(`/api/inventory/stock/${variantId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-levels"] });
      toast.success("Stock level updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update stock level");
    },
  });
}

export function useMultiLocationStock(productId: string) {
  return useQuery({
    queryKey: ["multi-location-stock", productId],
    queryFn: async () => {
      return apiFetch<{ stock: MultiLocationStock }>(
        `/api/inventory/multi-location?productId=${productId}`
      );
    },
    enabled: !!productId,
  });
}

// === POS HOOKS ===

export function usePosDevices(locationId?: string) {
  return useQuery({
    queryKey: ["pos-devices", locationId],
    queryFn: async () => {
      const params = locationId ? `?locationId=${locationId}` : "";
      return apiFetch<{ devices: PosDevice[] }>(`/api/pos/devices${params}`);
    },
  });
}

export function useCashSessions(deviceId?: string, status?: string) {
  return useQuery({
    queryKey: ["cash-sessions", deviceId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (deviceId) params.append("deviceId", deviceId);
      if (status) params.append("status", status);
      
      return apiFetch<{ sessions: CashSession[]; pagination: unknown }>(
        `/api/pos/cash/sessions?${params}`
      );
    },
  });
}

export function useCreateCashSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { deviceId: string; openingAmount: number }) => {
      return apiFetch<{ session: CashSession }>("/pos/cash/sessions", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-sessions"] });
      toast.success("Cash session started");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start cash session");
    },
  });
}

export function useCloseCashSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, closingAmount }: { sessionId: string; closingAmount: number }) => {
      return apiFetch<{ session: CashSession }>(`/api/pos/cash/sessions/${sessionId}/close`, {
        method: "POST",
        body: JSON.stringify({ closingAmount }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-sessions"] });
      toast.success("Cash session closed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to close cash session");
    },
  });
}

// === SUBSCRIPTION HOOKS ===

export function useSubscriptionBoxes(status?: string) {
  return useQuery({
    queryKey: ["subscription-boxes", status],
    queryFn: async () => {
      const params = status ? `?status=${status}` : "";
      return apiFetch<{ boxes: SubscriptionBox[]; pagination: unknown }>(
        `/api/box-subscriptions/boxes${params}`
      );
    },
  });
}

export function useBoxSubscriptions(boxId?: string, customerId?: string, status?: string) {
  return useQuery({
    queryKey: ["box-subscriptions", boxId, customerId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (boxId) params.append("boxId", boxId);
      if (customerId) params.append("customerId", customerId);
      if (status) params.append("status", status);
      
      return apiFetch<{ subscriptions: BoxSubscription[]; pagination: unknown }>(
        `/api/box-subscriptions/subscriptions?${params}`
      );
    },
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      boxId: string;
      customerId: string;
      startDate: string;
      frequency: string;
      preferences?: Record<string, unknown>;
    }) => {
      return apiFetch<{ subscription: BoxSubscription }>("/box-subscriptions/subscriptions", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["box-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-boxes"] });
      toast.success("Subscription created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create subscription");
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; frequency?: string; preferences?: Record<string, unknown> }) => {
      return apiFetch<{ subscription: BoxSubscription }>(`/api/box-subscriptions/subscriptions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["box-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-boxes"] });
      toast.success("Subscription updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update subscription");
    },
  });
}

// === RENTAL HOOKS ===

export function useRentalBookings(serviceId?: string, customerId?: string, status?: string) {
  return useQuery({
    queryKey: ["rental-bookings", serviceId, customerId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (serviceId) params.append("serviceId", serviceId);
      if (customerId) params.append("customerId", customerId);
      if (status) params.append("status", status);
      
      return apiFetch<{ bookings: RentalBooking[]; pagination: unknown }>(
        `/api/rentals/bookings?${params}`
      );
    },
  });
}

export function useCreateRentalBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      serviceId: string;
      customerId: string;
      startsAt: string;
      endsAt: string;
      notes?: string;
    }) => {
      return apiFetch<{ booking: RentalBooking }>("/rentals/bookings", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental-bookings"] });
      toast.success("Rental booking created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create rental booking");
    },
  });
}

export function useUpdateRentalBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; startsAt?: string; endsAt?: string; notes?: string }) => {
      return apiFetch<{ booking: RentalBooking }>(`/api/rentals/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental-bookings"] });
      toast.success("Rental booking updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update rental booking");
    },
  });
}