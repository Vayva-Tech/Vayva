import React from "react";
import { PublicProduct } from "@vayva/templates/types/storefront";
import { Users, Clock } from "lucide-react";
import { Button } from "@vayva/ui";

interface CampaignHeroProps {
  campaign: PublicProduct;
  onDonateClick: () => void;
}

export const CampaignHero = ({
  campaign,
  onDonateClick,
}: CampaignHeroProps) => {
  const details = campaign.donationDetails;
  const progressBarRef = React.useRef<HTMLDivElement>(null);

  const percentage = details
    ? Math.min(
      100,
      Math.round((details.raisedAmount / details.goalAmount) * 100),
    )
    : 0;

  React.useEffect(() => {
    if (progressBarRef.current && details) {
      progressBarRef.current.style.width = `${percentage}%`;
    }
  }, [percentage, details]);

  if (!details) return null;

  return (
    <section className="bg-transparent pb-12">
      {/* Image Banner */}
      <div className="h-[300px] md:h-[400px] relative w-full bg-background/50 backdrop-blur-sm">
        <img
          src={campaign.images?.[0]}
          alt={campaign.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
          <div className="max-w-6xl mx-auto">
            <span className="bg-[#16A34A] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block shadow-sm">
              {campaign.category || "Fundraiser"}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-2 text-shadow-lg">
              {campaign.name}
            </h1>
            <p className="opacity-90 flex items-center gap-2 text-sm md:text-base">
              Organized by{" "}
              <span className="font-bold underline">{details.orgName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Stats Bar / Content */}
      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10 grid md:grid-cols-12 gap-12">
        {/* Left: Progress Card */}
        <div className="md:col-span-8 bg-transparent rounded-xl shadow-xl border border-gray-100 p-6 md:p-8">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-4xl font-black text-gray-900">
                ₦{details.raisedAmount.toLocaleString()}
              </span>
              <span className="text-gray-500 ml-2">
                raised of ₦{details.goalAmount.toLocaleString()} goal
              </span>
            </div>
            <div className="text-right hidden sm:block">
              <span className="block text-2xl font-bold text-gray-900">
                {details.donorCount}
              </span>
              <span className="text-xs text-gray-500 uppercase font-bold">
                Donors
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-background/50 backdrop-blur-sm rounded-full h-3 mb-6 relative overflow-hidden">
            <div
              ref={progressBarRef}
              className="bg-[#16A34A] h-full rounded-full transition-all duration-1000 ease-out relative"
            >
              <div className="absolute inset-0 bg-transparent/20 animate-pulse"></div>
            </div>
          </div>

          <div className="flex gap-4 mb-8 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Users size={16} /> {details.donorCount} people donated
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} /> Campaign ending in 24 days
            </div>
          </div>

          <div className="prose prose-lg text-gray-600">
            <p>{campaign.description}</p>
            <p>
              Your contribution helps us provide immediate relief. 100% of
              donations go directly to the cause, with transparency reports
              published monthly.
            </p>
            <h3 className="text-gray-900 font-bold mt-6 mb-3">
              Why this matters
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Direct impact on local communities.</li>
              <li>Verified organization with 10+ years of service.</li>
              <li>Tax-deductible contributions.</li>
            </ul>
          </div>
        </div>

        {/* Right: Donate CTA */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-transparent border border-gray-200 rounded-xl p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">
              Support this cause
            </h3>

            <Button
              onClick={onDonateClick}
              className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-green-100 transition-all transform hover:-translate-y-1 mb-4 h-auto"
              aria-label="Donate now to this cause"
            >
              Donate Now
            </Button>

            <Button variant="outline" className="w-full bg-transparent border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-colors h-auto" aria-label="Share campaign">
              Share Campaign
            </Button>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
              <p>All donations are secure and encrypted.</p>
              <div className="flex justify-center gap-2 mt-2 opacity-60">
                <span>🔒 SSL Secure</span>
                <span>•</span>
                <span>✅ Verified Org</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
