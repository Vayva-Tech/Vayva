"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { LOCALES } from "@/data/locales";
import { Clock, Flame, Check } from "lucide-react";
import Image from "next/image";
import { Button } from "@vayva/ui";
export function MealCard({ meal, isSelected, isLocked, lang, onToggle, onViewDetails, }) {
    const t = LOCALES[lang];
    return (_jsxs("div", { className: `group relative bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${isSelected ? "ring-2 ring-[#22C55E] border-transparent" : "border-gray-100"}`, children: [_jsxs(Button, { variant: "ghost", className: "w-full aspect-[4/3] relative cursor-pointer block text-left p-0 rounded-none h-auto", onClick: () => onViewDetails(meal), "aria-label": `View details for ${meal.title[lang]}`, children: [_jsx(Image, { src: meal.image, alt: meal.title[lang], fill: true, sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw", className: "object-cover group-hover:scale-105 transition-transform duration-500" }), meal.isPro && (_jsx("div", { className: "absolute top-3 left-3 bg-black/80 text-[#FFD700] text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide backdrop-blur-sm", children: "Pro" })), meal.tags.category && (_jsx("div", { className: "absolute top-3 right-3 bg-white/90 text-gray-800 text-xs font-bold px-2 py-1 rounded-md shadow-sm backdrop-blur-sm", children: meal.tags.category }))] }), _jsxs("div", { className: "p-4", children: [_jsxs("div", { onClick: () => onViewDetails(meal), className: "cursor-pointer", children: [_jsx("h3", { className: "font-bold text-gray-900 mb-1 line-clamp-1", children: meal.title[lang] }), _jsx("p", { className: "text-sm text-gray-500 mb-3 line-clamp-1", children: meal.subtitle?.[lang] }), _jsxs("div", { className: "flex items-center gap-3 text-xs text-gray-500 mb-4", children: [_jsxs("span", { className: "flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md", children: [_jsx(Clock, { className: "w-3 h-3" }), " ", meal.tags.prepTime, " min"] }), _jsxs("span", { className: "flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md", children: [_jsx(Flame, { className: "w-3 h-3" }), " ", meal.tags.kcal, " kcal"] })] })] }), _jsx(Button, { onClick: () => !isLocked && onToggle(meal.id), disabled: isLocked && !isSelected, className: `
                        w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 h-auto
                        ${isSelected
                            ? "bg-[#22C55E] text-white hover:bg-[#16A34A]"
                            : isLocked
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900"}
                    `, "aria-label": isSelected ? `Remove ${meal.title[lang]} from selection` : `Add ${meal.title[lang]} to selection`, children: isSelected ? (_jsxs(_Fragment, { children: [_jsx(Check, { className: "w-4 h-4" }), t.selected] })) : (t.add) })] })] }));
}
