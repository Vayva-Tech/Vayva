"use client";

import { useState, use } from "react";
import { LocaleKey, LOCALES } from "@/data/locales";
import { GiftCardBuyForm } from "@/components/gift/GiftCardBuyForm";
import { GiftCardRedeemForm } from "@/components/gift/GiftCardRedeemForm";
import { useUserInteractions } from "@/hooks/useUserInteractions";
import Image from "next/image";
import { Button } from "@vayva/ui";

export default function GiftCardsPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const params = use(props.params);
  const lang = (params.lang === "tr" ? "tr" : "en") as LocaleKey;
  const t = LOCALES[lang].giftCards;
  const { balance, isLoaded } = useUserInteractions();

  const [activeTab, setActiveTab] = useState<"buy" | "redeem">("buy");

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-background/40 backdrop-blur-sm font-sans pb-20">
      {/* Hero Section */}
      <div className="bg-[#0B1220] text-white pt-12 pb-24 md:pt-20 md:pb-32 px-4 relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {t.heroTitle}
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            {t.heroSubtitle}
          </p>

          <div className="inline-flex bg-background/70 backdrop-blur-xl p-1 rounded-full border border-white/5">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("buy")}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all h-auto ${
                activeTab === "buy"
                  ? "bg-background/70 backdrop-blur-xl text-black shadow-lg hover:bg-white/80"
                  : "text-gray-300 hover:text-white"
              }`}
              aria-label="Buy gift card"
            >
              {t.buyTab}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("redeem")}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all h-auto ${
                activeTab === "redeem"
                  ? "bg-background/70 backdrop-blur-xl text-black shadow-lg hover:bg-white/80"
                  : "text-gray-300 hover:text-white"
              }`}
              aria-label="Redeem gift card"
            >
              {t.redeemTab}
            </Button>
          </div>
        </div>

        {/* Background Decor */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#22C55E] rounded-full blur-[128px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[128px] translate-y-1/2 -translate-x-1/2" />
        </div>
      </div>

      {/* Content Section - Overlapping Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Interface */}
          <div className="lg:col-span-8">
            {activeTab === "buy" ? (
              <GiftCardBuyForm lang={lang} />
            ) : (
              <GiftCardRedeemForm lang={lang} />
            )}
          </div>

          {/* Sidebar / Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Balance Card */}
            <div className="bg-background/70 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                {t.currentBalance}
              </h3>
              <div className="text-4xl font-bold text-black tracking-tight flex items-baseline gap-1">
                {balance.toLocaleString("tr-TR")}{" "}
                <span className="text-lg">₺</span>
              </div>
            </div>

            {/* Gift Card Visual */}
            <div className="relative aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl shadow-green-900/20 group">
              <Image
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800"
                alt="Gift Card"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                <div className="text-white font-bold text-xl">
                  Vayva Gift Card
                </div>
                <div className="text-white/60 text-sm font-mono mt-1">
                  **** **** **** ****
                </div>
              </div>
            </div>

            <div className="text-xs text-center text-gray-400">
              <p>
                By using this service you agree to our{" "}
                <a href={`/${lang}/terms`} className="underline">
                  Terms
                </a>{" "}
                and{" "}
                <a href={`/${lang}/privacy`} className="underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
