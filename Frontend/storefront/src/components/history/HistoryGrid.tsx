"use client";

import { Delivery, Meal } from "@/types/menu";
import { LocaleKey, LOCALES } from "@/data/locales";
import { DeliveryCard } from "./DeliveryCard";

interface HistoryGridProps {
  deliveries: Delivery[];
  meals: Meal[];
  ratings: Record<string, number>;
  favorites: string[];
  lang: LocaleKey;
  onRate: (mealId: string, rating: number) => void;
  onToggleFavorite: (mealId: string) => void;
}

export function HistoryGrid({
  deliveries,
  meals,
  ratings,
  favorites,
  lang,
  onRate,
  onToggleFavorite,
}: HistoryGridProps) {
  const t = LOCALES[lang];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mealMap = new Map(meals.map((m: any) => [m.id, m]));

  return (
    <div className="space-y-12">
      {deliveries.map((delivery: any) => {
        const deliveryDate = new Date(delivery.date);
        const dateStr = deliveryDate.toLocaleDateString(
          lang === "tr" ? "tr-TR" : "en-US",
          {
            weekday: "short",
            day: "numeric",
            month: "short",
          },
        );

        return (
          <div key={delivery.id}>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
              {t.history.deliveredOn} {dateStr}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {delivery.mealIds.map((mealId: any) => {
                const meal = mealMap.get(mealId);
                if (!meal) return null;

                return (
                  <DeliveryCard
                    key={mealId}
                    meal={meal}
                    lang={lang}
                    rating={ratings[mealId] || 0}
                    isFavorite={favorites.includes(mealId)}
                    onRate={(r) => onRate(mealId, r)}
                    onToggleFavorite={() => onToggleFavorite(mealId)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
