import { Metadata } from "next";
import { CampaignsList } from "@/components/nonprofit/CampaignsList";

export const metadata: Metadata = {
  title: "Fundraising Campaigns | Vayva",
  description: "Manage nonprofit fundraising campaigns",
};

export default function CampaignsPage() {
  return (
    <div className="container mx-auto py-6">
      <CampaignsList />
    </div>
  );
}
