import React, { useState } from "react";
import { Button } from "@vayva/ui";
import { PublicStore, PublicProduct } from "@/types/storefront";
import { GiveHeader } from "./components/GiveHeader";
import { CampaignHero } from "./components/CampaignHero";
import { DonationOptions } from "./components/DonationOptions";
import { RecentDonations } from "./components/RecentDonations";

interface GiveFlowLayoutProps {
  store: PublicStore;
  products: PublicProduct[];
}

export const GiveFlowLayout = ({
  store,
  products,
}: GiveFlowLayoutProps): React.JSX.Element => {
  // Determine active campaign (for demo, just pick first or by slug if we had routing props)
  // Here we'll just show the first one as "featured"
  const featuredCampaign = products[0];
  const otherCampaigns = products.slice(1);

  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [activeCampaignForDonation, setActiveCampaignForDonation] =
    useState<PublicProduct | null>(null);

  const openDonation = (campaign: PublicProduct) => {
    setActiveCampaignForDonation(campaign);
    setIsDonationOpen(true);
  };

  const handleDonationComplete = (_amount: number, _isRecurring: boolean) => {
    setIsDonationOpen(false);
    // Alert handled inside DonationOptions component for cleaner UX
  };

  if (!featuredCampaign) return <div>No campaigns found.</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900">
      <GiveHeader storeName={store.name} />

      <main>
        <CampaignHero
          campaign={featuredCampaign}
          onDonateClick={() => openDonation(featuredCampaign)}
        />

        <RecentDonations />

        {/* More Campaigns Grid */}
        <section className="py-16 bg-background/40 backdrop-blur-sm border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              More causes to support
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {otherCampaigns.map((campaign: any) => {
                const details = campaign.donationDetails;
                if (!details) return null;
                const percentage = Math.min(
                  100,
                  Math.round((details.raisedAmount / details.goalAmount) * 100),
                );

                return (
                  <div
                    key={campaign.id}
                    className="bg-transparent rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div className="h-48 relative">
                      <img
                        src={campaign.images?.[0]}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-transparent/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-gray-700">
                        {campaign.category}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 leading-tight">
                        {campaign.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {campaign.description}
                      </p>

                      <div className="mt-auto">
                        <div className="w-full bg-background/50 backdrop-blur-sm rounded-full h-2 mb-2">
                          <div
                            className="bg-[#16A34A] h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-gray-600 mb-4">
                          <span>
                            ₦{details.raisedAmount.toLocaleString()} raised
                          </span>
                          <span>{percentage}%</span>
                        </div>

                        <Button
                          onClick={() => openDonation(campaign)}
                          className="w-full border border-[#16A34A] text-[#16A34A] hover:bg-green-50 font-bold py-2.5 rounded-lg transition-colors"
                        >
                          Donate
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-transparent py-12 border-t border-gray-200 text-center">
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} {store.name}. Giving makes the world
          better.
        </p>
      </footer>

      {activeCampaignForDonation && (
        <DonationOptions
          isOpen={isDonationOpen}
          onClose={() => setIsDonationOpen(false)}
          campaignTitle={activeCampaignForDonation.name || "Campaign"}
          onDonate={handleDonationComplete}
          isRecurringAvailable={
            activeCampaignForDonation.donationDetails?.isRecurringAvailable
          }
        />
      )}
    </div>
  );
};
