import React from "react";
import Image from "next/image";

interface HeroBannerProps {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
}

export const HeroBanner = ({
  imageUrl = "https://placehold.co/800x600/111111/FFFFFF?text=New+Collection",
  title = "NEW COLLECTION",
  subtitle = "Shop the latest arrivals",
}: HeroBannerProps) => {
  return (
    <div className="relative w-full aspect-[4/3] md:aspect-[21/9] bg-background/50 backdrop-blur-sm overflow-hidden">
      <Image src={imageUrl} alt="Hero" fill className="object-cover" priority />
      <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-center text-white px-4">
        <h2 className="text-3xl md:text-5xl font-bold tracking-widest mb-2 drop-shadow-md">
          {title}
        </h2>
        <p className="text-sm md:text-lg font-medium opacity-90 tracking-wide drop-shadow-md">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
