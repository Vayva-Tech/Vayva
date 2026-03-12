import React, { useState } from "react";
import { Button } from "@vayva/ui";
import Link from "next/link";
import Image from "next/image";
import { PublicProduct } from "@vayva/templates/types/storefront";
import {
  Star,
  Check,
  Zap,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
} from "lucide-react";

interface HeroLandingProps {
  product: PublicProduct;
  headline: string;
  subHeadline: string;
  onBuy: (qty: number) => void;
}

export const HeroLanding = ({
  product,
  headline,
  subHeadline,
  onBuy,
}: HeroLandingProps) => {
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);

  return (
    <section className="bg-transparent pt-10 pb-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Gallery */}
          <div className="order-2 md:order-1">
            <div className="aspect-square bg-background/50 backdrop-blur-sm rounded-3xl overflow-hidden mb-4 relative shadow-2xl shadow-gray-200">
              <img
                src={product.images?.[selectedImg]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                Promo Ends Soon
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {product.images?.map((img: string, idx: number) => (
                <Button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImg === idx ? "border-gray-900 opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  <Image
                    src={img}
                    alt="Product Highlight"
                    fill
                    className="object-cover"
                  />
                </Button>
              ))}
            </div>
          </div>

          {/* Right: Pitch & Buy Box */}
          <div className="order-1 md:order-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {[1, 2, 3, 4, 5].map((i: any) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-500">
                4.9/5 (1,240+ Reviews)
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
              {headline}
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {subHeadline}
            </p>

            <div className="bg-background/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
              <div className="flex items-end gap-3 mb-6">
                <span className="text-4xl font-black text-gray-900">
                  ₦{product.price.toLocaleString()}
                </span>
                <span className="text-xl text-gray-400 line-through font-medium mb-1">
                  ₦{Math.round(product.price * 1.3).toLocaleString()}
                </span>
                <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded mb-2">
                  SAVE 30%
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex items-center border border-gray-300 rounded-xl bg-transparent h-14">
                  <Button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 h-full hover:bg-white/60 rounded-l-xl"
                  >
                    <Minus size={18} />
                  </Button>
                  <span className="w-12 text-center font-bold text-lg">
                    {qty}
                  </span>
                  <Button
                    onClick={() => setQty(qty + 1)}
                    className="px-4 h-full hover:bg-white/60 rounded-r-xl"
                  >
                    <Plus size={18} />
                  </Button>
                </div>
                <Button
                  onClick={() => onBuy(qty)}
                  className="flex-1 bg-[#111827] hover:bg-black text-white h-14 rounded-xl font-bold text-lg shadow-xl shadow-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  <span>Buy Now</span>
                  <Zap
                    size={20}
                    fill="currentColor"
                    className="text-yellow-400"
                  />
                </Button>
              </div>

              <div className="flex flex-col gap-2 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-green-600" />
                  <span>Free Express Shipping available</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-green-600" />
                  <span>30-Day Money Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
