"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart } from "@phosphor-icons/react/ssr";
import { LOCALES, LocaleKey } from "@/data/locales";
import { useUserInteractions } from "@/hooks/useUserInteractions";
import { DeliveryCard } from "@/components/history/DeliveryCard";
import { useStore } from "@/context/StoreContext";
import { Meal } from "@/types/menu";

// Simple Toast Component (Internal) - Copied for simplicity/isolation
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function FavoritesPage({
  params: _params,
}: any): React.JSX.Element {
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
      .then((res: any) => res.json())
      .then((data: any) => {
        if (data.meals) setMeals(data.meals);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [store]);

  // Filter favorited meals
  const favoritedMeals = meals.filter((m) => favorites.includes(m.id));

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

  if (!isLoaded) return <></>;

  return (
    <div className="min-h-screen bg-background/40 backdrop-blur-sm pb-20 font-sans bg-noise">
      <Toast message={toast} show={!!toast} />

      {/* Header */}
      <div className="glass-panel sticky top-0 z-30 border-b border-white/20 pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${lang}/menu`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            {t.favorites.backToMenu}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {t.favorites.title}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favoritedMeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoritedMeals.map((meal: any) => (
              <DeliveryCard
                key={meal.id}
                meal={meal}
                lang={lang}
                rating={ratings[meal.id] || 0}
                isFavorite={true}
                onRate={(r: any) => handleRate(meal.id, r)}
                onToggleFavorite={() => handleFav(meal.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-background/70 backdrop-blur-xl rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-background/40 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Heart size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {t.favorites.empty}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Go back to your menu or history to find meals you love.
            </p>
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
