import React from "react";
import { TemplateProps } from "../registry";
import { Button } from "@vayva/ui";
import { formatCurrency } from "@vayva/shared";

export const CosmeticsBeautyTemplate: React.FC<TemplateProps> = ({
  businessName,
  demoMode,
}) => {
  return (
    <div className="font-serif min-h-screen bg-[#FFF0F5] text-[#4A4A4A]">
      {/* Aesthetic Header */}
      <header className="py-6 px-4 text-center sticky top-0 bg-[#FFF0F5] z-50">
        <div className="font-bold text-2xl tracking-widest uppercase text-[#D88CA3]">
          {businessName || "Glow by Ada"}
        </div>
        <nav className="flex justify-center gap-6 mt-3 text-xs font-bold uppercase tracking-wider text-[#9E6B7A]">
          <span>Skin</span>
          <span>Hair</span>
          <span>Body</span>
          <span>Kits</span>
        </nav>
      </header>

      {/* Video/Image Hero */}
      <section className="px-4 mb-10">
        <div className="aspect-[4/5] rounded-[2rem] overflow-hidden relative shadow-xl shadow-[#D88CA3]/20">
          <img
            src="https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80"
            alt="Glow"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4A0E1F]/60 to-transparent flex flex-col justify-end p-8 text-white">
            <h2 className="text-3xl font-light italic mb-2">Radiance Kit</h2>
            <p className="text-sm opacity-90 mb-6 font-sans">
              Restore your natural barrier with our 3-step routine.
            </p>
            <Button className="bg-white text-[#4A0E1F] w-max px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#FFE4E1] h-auto">
              Shop Routine
            </Button>
          </div>
        </div>
      </section>

      {/* Scrolling Products */}
      <section className="pl-4 pb-10 overflow-x-hidden">
        <div className="flex justify-between items-end pr-4 mb-4">
          <h3 className="font-bold text-lg text-[#8B4C5F]">Top Rated</h3>
          <a
            href="#products"
            className="text-xs border-b border-[#D88CA3] pb-0.5"
          >
            View All
          </a>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 pr-4">
          {[
            {
              name: "Vitamin C Serum",
              price: "₦12,500",
              reviews: "4.9",
              img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
            },
            {
              name: "Hydrating Cleanser",
              price: "₦8,000",
              reviews: "4.8",
              img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80",
            },
            {
              name: "Rose Water Toner",
              price: "₦6,500",
              reviews: "5.0",
              img: "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=400&q=80",
            },
          ].map((item: any, i: number) => (
            <div key={i} className="min-w-[160px] group">
              <div className="aspect-[3/4] bg-white rounded-2xl overflow-hidden mb-3 p-4 relative shadow-sm">
                <img
                  src={item.img}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  alt={item.name}
                />
                <div className="absolute top-2 right-2 bg-[#FFF0F5] text-[#D88CA3] text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  ★ {item.reviews}
                </div>
              </div>
              <h4 className="font-bold text-sm text-[#4A4A4A] mb-1">
                {item.name}
              </h4>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#D88CA3] bg-white px-2 py-1 rounded-md">
                  {item.price}
                </span>
                <Button className="w-6 h-6 bg-[#4A0E1F] text-white rounded-full flex items-center justify-center text-xs h-auto p-0 min-w-[1.5rem]">
                  +
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Consultation CTA */}
      <div className="mx-4 bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-[#FFE4E1]">
        <div className="w-12 h-12 rounded-full bg-[#FFE4E1] flex items-center justify-center text-xl">
          👩🏽‍⚕️
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm text-[#8B4C5F] mb-1">
            Confused about your skin?
          </h4>
          <p className="text-[10px] text-gray-500 mb-2">
            Chat with our aesthetician for a personalized routine.
          </p>
        </div>
        <Button className="bg-[#D88CA3] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase hover:bg-[#C06C84] h-auto">
          Chat
        </Button>
      </div>
    </div>
  );
};
