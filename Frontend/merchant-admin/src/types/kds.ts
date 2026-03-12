export type OrderStatus = "pending" | "preparing" | "ready" | "served";
export interface KitchenOrder {
  id: string;
  status: OrderStatus;
    items: any[];
    [key: string]: any;
}
export interface KitchenMetrics {
  ordersToday: number;
  ordersInQueue: number;
  avgPrepTime: number;
  throughput: number;
}
