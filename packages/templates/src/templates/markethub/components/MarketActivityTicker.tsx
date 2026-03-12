
/* eslint-disable */
// @ts-nocheck
"use client";

import React from "react";
import { Zap, Bell, ShoppingCart, UserPlus } from "lucide-react";

const activities = [
    { icon: <UserPlus size={14} />, text: "Kolawole just started selling on MarketHub!" },
    { icon: <Zap size={14} />, text: "Flash Sale: Up to 40% off in Tech Category" },
    { icon: <Bell size={14} />, text: "Vendor 'Gizmo Hub' just restocked their bestsellers" },
    { icon: <ShoppingCart size={14} />, text: "New order placed for Vintage Leather Bag" },
    { icon: <Zap size={14} />, text: "Trending: Handmade Pottery is taking off today" },
];

export const MarketActivityTicker = () => {
    return (
        <div className="bg-black/80 backdrop-blur-md border-y border-white/10 py-2.5 overflow-hidden flex items-center">
            <div className="flex animate-marquee whitespace-nowrap items-center">
                {[...activities, ...activities].map((activity, i) => (
                    <div key={i} className="flex items-center gap-2 mx-8 text-white/80 text-[11px] font-bold uppercase tracking-widest">
                        <span className="text-[#10B981]">{activity.icon}</span>
                        <span>{activity.text}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-transparent/20 ml-4 hidden md:block"></span>
                    </div>
                ))}
            </div>

            {/* @ts-expect-error */}
            <style jsx global>{`
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
