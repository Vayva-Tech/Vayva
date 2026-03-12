import React from "react";
import { Button } from "@vayva/ui";
import { ArrowRight, BadgeCheck, Star } from "lucide-react";

export const MarketHero = (): React.JSX.Element => {
  return (
    <section className="bg-background/50 backdrop-blur-sm py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 h-[400px] md:h-[350px]">
        {/* Main Carousel / Featured */}
        <div className="md:col-span-8 bg-[#111827] rounded-2xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-center text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981] rounded-full blur-[80px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>

          <div className="relative z-10 max-w-lg">
            <span className="inline-block bg-[#10B981] text-white text-xs font-bold px-2 py-1 rounded mb-4">
              FLASH SALE
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
              Discover Local <br />
              <span className="text-[#10B981]">Hidden Gems.</span>
            </h2>
            <p className="text-gray-400 mb-8 font-medium">
              Up to 50% off handmade crafts and vintage fashion from verified
              independent sellers.
            </p>
            <Button className="bg-transparent text-[#111827] hover:bg-white/60 font-bold px-8 py-3 rounded-lg inline-flex items-center gap-2 transition-colors">
              Shop Now <ArrowRight size={18} />
            </Button>

            {/* Floating Glassmorphism Stats */}
            <div className="mt-12 flex flex-wrap gap-4">
              <div className="bg-transparent/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center shadow-lg shadow-[#10B981]/20">
                  <Star className="text-white" size={20} fill="currentColor" />
                </div>
                <div>
                  <div className="text-2xl font-black">4.9/5</div>
                  <div className="text-[10px] uppercase tracking-widest text-[#10B981] font-bold">Market Rating</div>
                </div>
              </div>

              <div className="bg-transparent/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-transparent/20 rounded-xl flex items-center justify-center">
                  <BadgeCheck className="text-white" size={20} />
                </div>
                <div>
                  <div className="text-2xl font-black">1.2k+</div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Verified Partners</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Banners */}
        <div className="hidden md:flex md:col-span-4 flex-col gap-6">
          <div className="flex-1 bg-transparent rounded-2xl p-6 border border-gray-200 flex flex-col justify-center relative overflow-hidden group cursor-pointer">
            <div className="relative z-10">
              <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-[#10B981] transition-colors">
                Top Rated Audio
              </h3>
              <p className="text-sm text-gray-500">Premium sound gear</p>
            </div>
            <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all">
              <Star size={80} fill="currentColor" />
            </div>
          </div>

          <div className="flex-1 bg-[#10B981] rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden group cursor-pointer text-white">
            <div className="relative z-10">
              <h3 className="font-bold text-xl mb-1">New Vendors</h3>
              <p className="text-sm opacity-90">Fresh arrivals this week</p>
            </div>
            <div className="absolute right-4 bottom-4 opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all">
              <BadgeCheck size={80} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
