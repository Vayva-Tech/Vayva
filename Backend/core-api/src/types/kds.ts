export type OrderStatus = "pending" | "preparing" | "ready" | "served";
export interface KitchenOrder {
  id: string;
  status: OrderStatus;
  items: unknown[];
  [key: string]: unknown;
}
export interface KitchenMetrics {
  ordersToday: number;
  ordersInQueue: number;
  avgPrepTime: number;
  throughput: number;
}
