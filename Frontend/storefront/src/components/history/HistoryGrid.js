"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LOCALES } from "@/data/locales";
import { DeliveryCard } from "./DeliveryCard";
export function HistoryGrid({ deliveries, meals, ratings, favorites, lang, onRate, onToggleFavorite, }) {
    const t = LOCALES[lang];
    const mealMap = new Map(meals.map((m) => [m.id, m]));
    return (_jsx("div", { className: "space-y-12", children: deliveries.map((delivery) => {
            const deliveryDate = new Date(delivery.date);
            const dateStr = deliveryDate.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
            });
            return (_jsxs("div", { children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 mb-6 flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-[#22C55E]" }), t.history.deliveredOn, " ", dateStr] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: delivery.mealIds.map((mealId) => {
                            const meal = mealMap.get(mealId);
                            if (!meal)
                                return null;
                            return (_jsx(DeliveryCard, { meal: meal, lang: lang, rating: ratings[mealId] || 0, isFavorite: favorites.includes(mealId), onRate: (r) => onRate(mealId, r), onToggleFavorite: () => onToggleFavorite(mealId) }, mealId));
                        }) })] }, delivery.id));
        }) }));
}
