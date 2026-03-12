import { Metadata } from "next";
import { CustomerSegmentationDashboard } from "@/components/analytics/CustomerSegmentationDashboard";

export const metadata: Metadata = {
  title: "Customer Segmentation | Vayva",
  description: "AI-powered RFM analysis and customer segmentation",
};

export default function SegmentsPage() {
  return <CustomerSegmentationDashboard />;
}
