import { useRouter } from "next/navigation";
import { DashboardPageHeader } from "../DashboardPageHeader";

export const OrdersHeader = () => {
  const router = useRouter();

  return (
    <DashboardPageHeader
      title="Orders"
      description="Track, fulfill, and manage your store sales."
      icon="ShoppingBag"
      primaryAction={{
        label: "New Order",
        icon: "Plus",
        onClick: () => router.push("/dashboard/orders/new"),
      }}
    />
  );
};
