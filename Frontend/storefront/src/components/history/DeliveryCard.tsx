"use client";

import { Meal } from "@/types/menu";
import { LocaleKey, LOCALES } from "@/data/locales";
import { RatingStars } from "./RatingStars";
import { FavoriteHeart } from "./FavoriteHeart";
import Image from "next/image";

interface DeliveryCardProps {
  meal: Meal;
  lang: LocaleKey;
  rating: number;
  isFavorite: boolean;
  onRate: (rating: number) => void;
  onToggleFavorite: () => void;
}

export function DeliveryCard({
  meal,
  lang,
  rating,
  isFavorite,
  onRate,
  onToggleFavorite,
}: DeliveryCardProps) {
  const t = LOCALES[lang];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      {/* Image & Favorite Overlay */}
      <div className="relative aspect-video">
        <Image
          src={meal.image || "/placeholder-food.png"}
          alt={meal.title?.[lang] || "Meal"}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
            <FavoriteHeart
              isFavorite={isFavorite}
              onToggle={onToggleFavorite}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 line-clamp-1">
            {meal.title?.[lang] || "Meal"}
          </h3>
          <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
            <span className="bg-gray-50 px-2 py-1 rounded">
              {meal.tags.prepTime} min
            </span>
            <span className="bg-gray-50 px-2 py-1 rounded">
              {meal.tags.kcal} kcal
            </span>
            {meal.tags.category && (
              <span className="bg-green-50 text-green-700 px-2 py-1 rounded font-medium">
                {meal.tags.category}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {rating > 0 ? t.ratings.saved : t.history.rateThis}
          </span>
          <RatingStars rating={rating} onRate={onRate} />
        </div>
      </div>
    </div>
  );
}
