import { DashboardPageHeader } from "../DashboardPageHeader";
import { useRouter } from "next/navigation";

interface ProductsHeaderProps {
  isBulkMode: boolean;
  onToggleBulkMode: () => void;
}

export function ProductsHeader({
  isBulkMode,
  onToggleBulkMode,
}: ProductsHeaderProps) {
  const router = useRouter();

  return (
    <DashboardPageHeader
      title="Products"
      description="Manage your inventory, pricing, and product variants."
      icon="Package"
      primaryAction={{
        label: "Add Product",
        icon: "Plus",
        onClick: () => router.push("/dashboard/products/new"),
      }}
      secondaryAction={{
        label: isBulkMode ? "List View" : "Bulk Edit",
        icon: isBulkMode ? "List" : "SquaresFour",
        onClick: onToggleBulkMode,
      }}
    />
  );
}
