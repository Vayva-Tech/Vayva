import { Delivery } from "../types/menu";

export const DEMO_DELIVERIES: Delivery[] = [
  {
    id: "d-1",
    date: "2025-11-28",
    mealIds: ["m1", "m3", "m9", "m12"], // Meatball Pasta, Lentil Soup, Burger, Brownie
    isDelivered: true,
  },
  {
    id: "d-2",
    date: "2025-11-21",
    mealIds: ["m2", "m5", "m6", "m11"], // Chicken Skewers, Wok, Karniyarik, Falafel
    isDelivered: true,
  },
  {
    id: "d-3",
    date: "2025-11-14",
    mealIds: ["m4", "m8", "m10", "m9"], // Salmon, Risotto, Whole Chicken, Burger
    isDelivered: true,
  },
];
