"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LOCALES } from "@/data/locales";
import { RatingStars } from "./RatingStars";
import { FavoriteHeart } from "./FavoriteHeart";
import Image from "next/image";
export function DeliveryCard({ meal, lang, rating, isFavorite, onRate, onToggleFavorite, }) {
    const t = LOCALES[lang];
    return (_jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "relative aspect-video", children: [_jsx(Image, { src: meal.image, alt: meal.title[lang], fill: true, className: "object-cover" }), _jsx("div", { className: "absolute top-2 right-2", children: _jsx("div", { className: "bg-white/80 backdrop-blur-sm rounded-full shadow-sm", children: _jsx(FavoriteHeart, { isFavorite: isFavorite, onToggle: onToggleFavorite }) }) })] }), _jsxs("div", { className: "p-4 flex-1 flex flex-col", children: [_jsxs("div", { className: "mb-3", children: [_jsx("h3", { className: "font-bold text-gray-900 line-clamp-1", children: meal.title[lang] }), _jsxs("div", { className: "flex flex-wrap gap-2 mt-2 text-xs text-gray-500", children: [_jsxs("span", { className: "bg-gray-50 px-2 py-1 rounded", children: [meal.tags.prepTime, " min"] }), _jsxs("span", { className: "bg-gray-50 px-2 py-1 rounded", children: [meal.tags.kcal, " kcal"] }), meal.tags.category && (_jsx("span", { className: "bg-green-50 text-green-700 px-2 py-1 rounded font-medium", children: meal.tags.category }))] })] }), _jsxs("div", { className: "mt-auto pt-3 border-t border-gray-50 flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-medium text-gray-400 uppercase tracking-wide", children: rating > 0 ? t.ratings.saved : t.history.rateThis }), _jsx(RatingStars, { rating: rating, onRate: onRate })] })] })] }));
}
