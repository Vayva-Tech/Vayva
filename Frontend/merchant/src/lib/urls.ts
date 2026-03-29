/**
 * URL utilities for the application
 */

export const urls = {
  home: "/",
  dashboard: "/dashboard",
  account: "/dashboard/account",
  orders: "/dashboard/orders",
  products: "/dashboard/products",
  settings: "/dashboard/settings",
  api: {
    account: "/account",
    orders: "/orders",
    products: "/products",
  },
  marketingBase: () => {
    return process.env.NEXT_PUBLIC_MARKETING_URL || "https://vayva.ng";
  },
};
