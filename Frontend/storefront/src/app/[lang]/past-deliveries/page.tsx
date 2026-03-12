"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Heart } from "@phosphor-icons/react/ssr";
import { DEMO_DELIVERIES } from "@/data/test-history";
import { LOCALES, LocaleKey } from "@/data/locales";
import { useUserInteractions } from "@/hooks/useUserInteractions";
import { HistoryGrid } from "@/components/history/HistoryGrid";
import { useStore } from "@/context/StoreContext";
import { Meal } from "@/types/menu";

// Simple Toast Component (Internal)
function Toast({
  message,
  show,
}: {
  message: string;
  show: boolean;
}): React.JSX.Element {
  if (!show) return <></>;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50 animate-fade-in-up">
      {message}
    </div>
  );
}

export default function PastDeliveriesPage({
  params: _params,
}: {
  params: Promise<{ lang: string }>;
}): React.JSX.Element {
  const { lang: rawLang } = useParams() as { lang: string };
  const lang = (rawLang === "tr" ? "tr" : "en") as LocaleKey;
  const { store } = useStore();
  const t = LOCALES[lang];
  const { ratings, favorites, rateMeal, toggleFavorite, isLoaded } =
    useUserInteractions();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store) return;
    fetch(`/api/menu?slug=${store.slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.meals) setMeals(data.meals);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [store]);

  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const handleRate = (id: string, r: number) => {
    rateMeal(id, r);
    showToast(t.ratings.saved);
  };

  const handleFav = (id: string) => {
    const result = toggleFavorite(id);
    showToast(result.isFavorite ? t.favorites.added : t.favorites.removed);
  };

  if (!isLoaded) return <></>; // Hydration safe

  return (
    <div className="min-h-screen bg-background/40 backdrop-blur-sm pb-20 font-sans bg-noise">
      <Toast message={toast} show={!!toast} />

      {/* Header */}
      <div className="glass-panel sticky top-0 z-30 border-b border-white/20 pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t.history.title}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{t.history.subtitle}</p>
          </div>
          <Link
            href={`/${lang}/favorites`}
            className="flex items-center gap-2 text-sm font-bold text-[#22C55E] hover:text-[#16A34A] transition-colors bg-[#22C55E]/5 px-4 py-2 rounded-full"
          >
            <Heart size={16} />
            {t.history.goToFavorites}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {DEMO_DELIVERIES.length > 0 ? (
          <HistoryGrid
            deliveries={DEMO_DELIVERIES}
            meals={meals}
            ratings={ratings}
            favorites={favorites}
            lang={lang}
            onRate={handleRate}
            onToggleFavorite={handleFav}
          />
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-gray-500 mb-6">{t.history.empty}</p>
            <Link
              href={`/${lang}/menu`}
              className="inline-flex items-center font-bold text-white bg-[#0B1220] px-6 py-3 rounded-xl hover:shadow-lg transition-all"
            >
              {t.favorites.backToMenu}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
