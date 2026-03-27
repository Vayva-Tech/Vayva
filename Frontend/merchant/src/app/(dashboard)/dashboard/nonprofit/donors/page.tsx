import { Metadata } from "next";
import { DonorsList } from "@/components/nonprofit/DonorsList";

export const metadata: Metadata = {
  title: "Donors | Vayva",
  description: "Manage nonprofit donors and contributions",
};

export default function DonorsPage() {
  return (
    <div className="container mx-auto py-6">
      <DonorsList />
    </div>
  );
}
