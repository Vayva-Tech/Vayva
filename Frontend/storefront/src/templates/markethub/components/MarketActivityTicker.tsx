"use client";

import React from "react";
import { Lightning as Zap, Bell, ShoppingCart, UserPlus } from "@phosphor-icons/react/ssr";

interface Activity {
  id: string;
  icon: React.ReactNode;
  text: string;
  timestamp?: string;
}

interface MarketActivityTickerProps {
  activities?: Activity[];
  isLoading?: boolean;
}

const defaultActivities: Activity[] = [
  {
    id: "1",
    icon: <UserPlus size={14} />,
    text: "Kolawole just started selling on MarketHub!",
  },
  {
    id: "2",
    icon: <Zap size={14} />,
    text: "Flash Sale: Up to 40% off in Tech Category",
  },
  {
    id: "3",
    icon: <Bell size={14} />,
    text: "Vendor 'Gizmo Hub' just restocked their bestsellers",
  },
  {
    id: "4",
    icon: <ShoppingCart size={14} />,
    text: "New order placed for Vintage Leather Bag",
  },
  {
    id: "5",
    icon: <Zap size={14} />,
    text: "Trending: Handmade Pottery is taking off today",
  },
];

export const MarketActivityTicker = ({ 
  activities = defaultActivities,
  isLoading = false,
}: MarketActivityTickerProps) => {
  if (isLoading) {
    return (
      <div className="bg-black/80 backdrop-blur-md border-y border-white/10 py-2.5 overflow-hidden flex items-center">
        <div className="text-white/60 text-[11px] font-bold uppercase tracking-widest px-8">
          Loading activity feed...
        </div>
      </div>
    );
  }

  const displayActivities = activities.length > 0 ? activities : defaultActivities;
  
  return (
    <div className="bg-black/80 backdrop-blur-md border-y border-white/10 py-2.5 overflow-hidden flex items-center">
      <div className="flex animate-marquee whitespace-nowrap items-center">
        {[...displayActivities, ...displayActivities].map((activity, i) => (
          <div
            key={`${activity.id}-${i}`}
            className="flex items-center gap-2 mx-8 text-white/80 text-[11px] font-bold uppercase tracking-widest"
          >
            <span className="text-[#10B981]">{activity.icon}</span>
            <span>{activity.text}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/20 ml-4 hidden md:block"></span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};
