import React from "react";
import { TemplateProps } from "../registry";
import { Button } from "@vayva/ui";
import { formatCurrency } from "@vayva/shared";

export const FurnitureHomeTemplate: React.FC<TemplateProps> = ({
  businessName,
}) => {
  return (
    <div className="font-sans min-h-screen bg-stone-100 text-stone-800 pb-24">
      {/* Elegant Header */}
      <header className="bg-stone-200 px-6 py-8 flex justify-between items-center relative overflow-hidden">
        <div className="z-10">
          <h1 className="font-light text-3xl tracking-wide uppercase mb-2">
            {businessName || "NORDIC HOME"}
          </h1>
          <p className="text-xs font-bold tracking-[0.2em] opacity-60 uppercase">
            Crafted for living
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-stone-300 transform skew-x-12 translate-x-4 opacity-50"></div>
      </header>

      {/* Room Categories */}
      <div className="p-6 grid grid-cols-2 gap-4 -mt-6 relative z-10">
        {["Living Room", "Bedroom", "Dining", "Office"].map((room, i) => (
          <div
            key={room}
            className="aspect-square bg-white shadow-lg p-4 flex flex-col justify-between hover:bg-stone-50 cursor-pointer transition-colors group"
          >
            <span className="text-3xl text-stone-300 font-light group-hover:text-stone-400">
              0{i + 1}
            </span>
            <span className="font-bold text-sm uppercase tracking-wider">
              {room}
            </span>
          </div>
        ))}
      </div>

      {/* Featured Piece */}
      <section className="px-6 py-8">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-4">
          <span className="w-8 h-px bg-stone-400"></span>
          Signature Piece
        </h2>
        <div className="bg-white p-6 shadow-xl relative mt-12">
          <img
            src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80"
            alt="Chair"
            className="w-full h-64 object-cover -mt-12 shadow-lg mb-6"
          />
          <h3 className="text-2xl font-light mb-2">The Oslo Accent Chair</h3>
          <p className="text-sm text-stone-500 leading-relaxed mb-6">
            Designed with ergonomic curves and premium velvet upholstery.
            Available in 4 custom colors.
          </p>

          <div className="flex justify-between items-end border-t border-stone-100 pt-6">
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400 mb-1">
                Starting at
              </div>
              <div className="text-xl font-bold">{formatCurrency(285000)}</div>
            </div>
            <Button className="bg-stone-800 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-black h-auto">
              Request Quote
            </Button>
          </div>
        </div>
      </section>

      {/* Process Strip */}
      <section className="bg-stone-200 py-12 px-6">
        <div className="flex justify-between text-center gap-4">
          <div>
            <div className="font-bold text-lg mb-1">01</div>
            <div className="text-[10px] uppercase tracking-wider opacity-60">
              Select
            </div>
          </div>
          <div className="h-px bg-stone-400 w-full mt-3"></div>
          <div>
            <div className="font-bold text-lg mb-1">02</div>
            <div className="text-[10px] uppercase tracking-wider opacity-60">
              Customize
            </div>
          </div>
          <div className="h-px bg-stone-400 w-full mt-3"></div>
          <div>
            <div className="font-bold text-lg mb-1">03</div>
            <div className="text-[10px] uppercase tracking-wider opacity-60">
              Deliver
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
