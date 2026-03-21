import { Metadata } from "next";
import { RequisitionsList } from "@/components/b2b/RequisitionsList";

export const metadata: Metadata = {
  title: "Purchase Requisitions | Vayva",
  description: "Manage B2B purchase requisitions",
};

export default function RequisitionsPage() {
  return (
    <div className="container mx-auto py-6">
      <RequisitionsList />
    </div>
  );
}
