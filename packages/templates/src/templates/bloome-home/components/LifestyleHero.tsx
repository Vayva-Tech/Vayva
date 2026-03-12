import React from "react";
import Image from "next/image";
import { Button } from "@vayva/ui";

interface LifestyleHeroProps {
  imageUrl?: string;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
}

export const LifestyleHero = ({
  imageUrl = "https://placehold.co/800x1000/EAE0D5/222?text=Lifestyle",
  headline = "Slow down your routine.",
  subheadline = "New Collection",
  ctaText = "Shop Essentials",
}: LifestyleHeroProps) => {
  return (
    <section className="relative w-full aspect-[3/4] md:aspect-[21/9] bg-[#FAFAF9] overflow-hidden flex flex-col justify-center items-center text-center p-8">
      <Image
        src={imageUrl}
        alt="Hero"
        fill
        className="object-cover opacity-80"
        priority
      />

      <div className="relative z-10 max-w-xl mx-auto bg-transparent/80 backdrop-blur-sm p-8 md:p-12 rounded-sm shadow-sm md:shadow-md">
        <span className="block text-[#C9B7A2] text-xs font-bold uppercase tracking-[0.2em] mb-4">
          {subheadline}
        </span>
        <h2 className="font-serif text-3xl md:text-5xl text-[#2E2E2E] mb-6 leading-tight">
          {headline}
        </h2>
        <Button variant="link" className="border-b border-[#2E2E2E] pb-1 text-[#2E2E2E] text-sm uppercase tracking-widest hover:text-[#C9B7A2] hover:border-[#C9B7A2] transition-all duration-300 h-auto p-0 rounded-none" aria-label={ctaText}>
          {ctaText}
        </Button>
      </div>
    </section>
  );
};
