import React from "react";
import { Button } from "@vayva/ui";
import Image from "next/image";

interface HeroTechBannerProps {
  imageUrl?: string;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
}

export const HeroTechBanner = ({
  imageUrl = "https://placehold.co/800x600/111/fff?text=Headphones",
  headline = "Experience Sound Like Never Before",
  subheadline = "New Noise Cancelling Series",
  ctaText = "Shop Now",
}: HeroTechBannerProps) => {
  return (
    <div className="relative w-full aspect-[4/3] md:aspect-[21/9] bg-[#F2F4F7] overflow-hidden flex flex-col justify-end p-6">
      <Image
        src={imageUrl}
        alt="Hero"
        fill
        className="object-cover opacity-90 mix-blend-multiply"
        priority
      />
      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />

      <div className="relative z-10 text-white max-w-lg mb-2">
        <span className="inline-block px-2 py-1 bg-blue-600 text-[10px] font-bold uppercase tracking-wider mb-3 rounded-sm">
          {subheadline}
        </span>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
          {headline}
        </h2>
        <Button className="bg-transparent text-black px-6 py-3 rounded-lg font-bold text-sm hover:bg-white/60 transition-colors shadow-lg active:scale-95 transform transition-transform">
          {ctaText}
        </Button>
      </div>
    </div>
  );
};
