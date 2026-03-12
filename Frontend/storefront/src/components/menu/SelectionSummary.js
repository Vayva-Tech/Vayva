"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { LOCALES } from "@/data/locales";
import { ShoppingBag, Info } from "lucide-react";
import { Button } from "@vayva/ui";
export function SelectionSummary({ selectedMeals, mealsPerWeek, totalCost, lang, isLocked, onSave, }) {
    const t = LOCALES[lang];
    const remaining = mealsPerWeek - selectedMeals.length;
    const progress = (selectedMeals.length / mealsPerWeek) * 100;
    const progressBarRef = React.useRef(null);
    React.useEffect(() => {
        if (progressBarRef.current) {
            progressBarRef.current.style.width = `${Math.min(progress, 100)}%`;
        }
    }, [progress]);
    return (_jsxs("div", { className: "bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24", children: [_jsxs("h2", { className: "font-bold text-lg mb-4 flex items-center gap-2", children: [_jsx(ShoppingBag, { className: "w-5 h-5 text-[#22C55E]" }), t.summary.title] }), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex justify-between text-sm font-medium mb-2", children: [_jsxs("span", { className: remaining === 0 ? "text-[#22C55E]" : "text-gray-600", children: [selectedMeals.length, " / ", mealsPerWeek, " ", t.selected] }), remaining > 0 && (_jsxs("span", { className: "text-orange-500 text-xs", children: [remaining, " more needed"] }))] }), _jsx("div", { className: "h-2 bg-gray-100 rounded-full overflow-hidden", children: _jsx("div", { ref: progressBarRef, className: `h-full transition-all duration-500 ease-out ${remaining === 0 ? "bg-[#22C55E]" : "bg-orange-400"}` }) })] }), _jsxs("div", { className: "space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar", children: [selectedMeals.map((meal) => (_jsxs("div", { className: "flex gap-3 items-start", children: [_jsx("img", { src: meal.image, alt: meal.title[lang], className: "w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 line-clamp-1", children: meal.title[lang] }), _jsxs("p", { className: "text-xs text-gray-500", children: [meal.tags.kcal, " kcal"] })] })] }, meal.id))), selectedMeals.length === 0 && (_jsx("div", { className: "text-center py-8 text-gray-400 text-sm italic bg-gray-50 rounded-xl border border-dashed border-gray-200", children: "No meals selected yet" }))] }), _jsxs("div", { className: "border-t border-gray-100 pt-4 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsxs("span", { className: "text-gray-600", children: [t.summary.total, " ", t.summary.servings] }), _jsx("span", { className: "font-medium", children: (selectedMeals.length || 0) * 2 })] }), _jsxs("div", { className: "flex justify-between items-center text-base font-bold", children: [_jsx("span", { className: "text-gray-900", children: t.summary.cost }), _jsxs("span", { className: "text-gray-900", children: ["\u20BA", totalCost] })] }), _jsxs("div", { className: "bg-blue-50 text-blue-700 p-3 rounded-xl text-xs flex gap-2", children: [_jsx(Info, { className: "w-4 h-4 flex-shrink-0" }), t.planSummary] }), _jsx(Button, { onClick: onSave, disabled: isLocked || selectedMeals.length !== mealsPerWeek, className: `
                        w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#22C55E]/10 h-auto
                        ${isLocked || selectedMeals.length !== mealsPerWeek
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-[#0B1220] text-white hover:bg-black hover:shadow-xl"}
                    `, "aria-label": isLocked ? "Selection locked" : t.saveSelection, children: isLocked ? "Locked" : t.saveSelection })] })] }));
}
