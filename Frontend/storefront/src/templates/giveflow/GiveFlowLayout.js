import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@vayva/ui";
import { GiveHeader } from "./components/GiveHeader";
import { CampaignHero } from "./components/CampaignHero";
import { DonationOptions } from "./components/DonationOptions";
import { RecentDonations } from "./components/RecentDonations";
export const GiveFlowLayout = ({ store, products }) => {
    // Determine active campaign (for demo, just pick first or by slug if we had routing props)
    // Here we'll just show the first one as "featured"
    const featuredCampaign = products[0];
    const otherCampaigns = products.slice(1);
    const [isDonationOpen, setIsDonationOpen] = useState(false);
    const [activeCampaignForDonation, setActiveCampaignForDonation] = useState(null);
    const openDonation = (campaign) => {
        setActiveCampaignForDonation(campaign);
        setIsDonationOpen(true);
    };
    const handleDonationComplete = (amount, isRecurring) => {
        setIsDonationOpen(false);
        // Alert handled inside DonationOptions component for cleaner UX
    };
    if (!featuredCampaign)
        return _jsx("div", { children: "No campaigns found." });
    return (_jsxs("div", { className: "min-h-screen bg-[#F9FAFB] font-sans text-gray-900", children: [_jsx(GiveHeader, { storeName: store.name }), _jsxs("main", { children: [_jsx(CampaignHero, { campaign: featuredCampaign, onDonateClick: () => openDonation(featuredCampaign) }), _jsx(RecentDonations, {}), _jsx("section", { className: "py-16 bg-background/40 backdrop-blur-sm border-t border-gray-200", children: _jsxs("div", { className: "max-w-6xl mx-auto px-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-8", children: "More causes to support" }), _jsx("div", { className: "grid md:grid-cols-3 gap-8", children: otherCampaigns.map((campaign) => {
                                        const details = campaign.donationDetails;
                                        if (!details)
                                            return null;
                                        const percentage = Math.min(100, Math.round((details.raisedAmount / details.goalAmount) * 100));
                                        return (_jsxs("div", { className: "bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col", children: [_jsxs("div", { className: "h-48 relative", children: [_jsx("img", { src: campaign.images?.[0], className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute top-2 left-2 bg-background/70 backdrop-blur-xl px-2 py-1 rounded text-[10px] font-bold text-gray-700", children: campaign.category })] }), _jsxs("div", { className: "p-6 flex-1 flex flex-col", children: [_jsx("h3", { className: "font-bold text-lg text-gray-900 mb-2 leading-tight", children: campaign.name }), _jsx("p", { className: "text-sm text-gray-500 mb-4 line-clamp-2", children: campaign.description }), _jsxs("div", { className: "mt-auto", children: [_jsx("div", { className: "w-full bg-background/50 backdrop-blur-sm rounded-full h-2 mb-2", children: _jsx("div", { className: "bg-[#16A34A] h-2 rounded-full", style: { width: `${percentage}%` } }) }), _jsxs("div", { className: "flex justify-between text-xs font-bold text-gray-600 mb-4", children: [_jsxs("span", { children: ["\u20A6", details.raisedAmount.toLocaleString(), " raised"] }), _jsxs("span", { children: [percentage, "%"] })] }), _jsx(Button, { onClick: () => openDonation(campaign), className: "w-full border border-[#16A34A] text-[#16A34A] hover:bg-green-50 font-bold py-2.5 rounded-lg transition-colors", children: "Donate" })] })] })] }, campaign.id));
                                    }) })] }) })] }), _jsx("footer", { className: "bg-background/70 backdrop-blur-xl py-12 border-t border-gray-200 text-center", children: _jsxs("p", { className: "text-gray-400 text-sm", children: ["\u00A9 ", new Date().getFullYear(), " ", store.name, ". Giving makes the world better."] }) }), activeCampaignForDonation && (_jsx(DonationOptions, { isOpen: isDonationOpen, onClose: () => setIsDonationOpen(false), campaignTitle: activeCampaignForDonation.name, onDonate: handleDonationComplete, isRecurringAvailable: activeCampaignForDonation.donationDetails?.isRecurringAvailable }))] }));
};
