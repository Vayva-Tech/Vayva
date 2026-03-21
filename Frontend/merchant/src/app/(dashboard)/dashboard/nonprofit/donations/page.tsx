import { Metadata } from "next";
import { DonationsList } from "@/components/nonprofit/DonationsList";

export const metadata: Metadata = {
  title: "Donations | Vayva",
  description: "Track and manage nonprofit donations",
};

export default function DonationsPage() {
  return (
    <div className="container mx-auto py-6">
      <DonationsList />
    </div>
  );
}
