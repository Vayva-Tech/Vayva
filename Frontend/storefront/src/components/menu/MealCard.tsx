"use client";

import { Meal } from "@/types/menu";
import { LocaleKey, LOCALES } from "@/data/locales";
import { Clock, Fire as Flame, Check } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import { Button } from "@vayva/ui";

interface MealCardProps {
  meal: Meal;
  isSelected: boolean;
  isLocked: boolean;
  lang: LocaleKey;
  onToggle: (id: string) => void;
  onViewDetails: (meal: Meal) => void;
}

export function MealCard({
  meal,
  isSelected,
  isLocked,
  lang,
  onToggle,
  onViewDetails,
}: MealCardProps) {
  const t = LOCALES[lang];

  return (
    <div
      className={`group relative bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${isSelected ? "ring-2 ring-[#22C55E] border-transparent" : "border-gray-100"}`}
    >
      {/* Image */}
      <Button
        variant="ghost"
        className="w-full aspect-[4/3] relative cursor-pointer block text-left p-0 rounded-none h-auto"
        onClick={() => onViewDetails(meal)}
        aria-label={`View details for ${meal.title[lang]}`}
      >
        <Image
          src={meal.image || "/placeholder-food.png"}
          alt={meal.title?.[lang] || "Meal"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {meal.isPro && (
          <div className="absolute top-3 left-3 bg-black/80 text-[#FFD700] text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide backdrop-blur-sm">
            Pro
          </div>
        )}
        {meal.tags.category && (
          <div className="absolute top-3 right-3 bg-white/90 text-gray-800 text-xs font-bold px-2 py-1 rounded-md shadow-sm backdrop-blur-sm">
            {meal.tags.category}
          </div>
        )}
      </Button>

      {/* Content */}
      <div className="p-4">
        <div onClick={() => onViewDetails(meal)} className="cursor-pointer">
          <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
            {meal.title?.[lang] || "Meal"}
          </h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-1">
            {meal.subtitle?.[lang]}
          </p>

          {/* Tags */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
              <Clock className="w-3 h-3" /> {meal.tags.prepTime} min
            </span>
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
              <Flame className="w-3 h-3" /> {meal.tags.kcal} kcal
            </span>
          </div>
        </div>

        {/* Action */}
        <Button
          onClick={() => !isLocked && onToggle(meal.id)}
          disabled={isLocked && !isSelected}
          className={`
                        w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 h-auto
                        ${
                          isSelected
                            ? "bg-[#22C55E] text-white hover:bg-[#16A34A]"
                            : isLocked
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }
                    `}
          aria-label={
            isSelected
              ? `Remove ${meal.title?.[lang] || "Meal"} from selection`
              : `Add ${meal.title?.[lang] || "Meal"} to selection`
          }
        >
          {isSelected ? (
            <>
              <Check className="w-4 h-4" />
              {t.selected}
            </>
          ) : (
            t.add
          )}
        </Button>
      </div>
    </div>
  );
}
