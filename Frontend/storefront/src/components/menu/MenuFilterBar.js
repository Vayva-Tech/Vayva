"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@vayva/ui";
import { LOCALES } from "@/data/locales";
export function MenuFilterBar({ lang, searchQuery, onSearchChange, activeFilters, onToggleFilter, }) {
    const t = LOCALES[lang].filters;
    const FILTERS = [
        { key: "under20", label: t.under20min },
        { key: "vegetarian", label: t.vegetarian },
        { key: "family", label: t.family },
        { key: "fit", label: t.fit },
    ];
    return (_jsx("div", { className: "sticky top-[105px] z-10 bg-white/95 backdrop-blur-sm py-4 border-b border-gray-100", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4 items-center justify-between", children: [_jsxs("div", { className: "relative w-full md:w-64", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Search, { className: "h-4 w-4 text-gray-400" }) }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => onSearchChange(e.target.value), className: "block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm transition-colors", placeholder: t.searchPlaceholder })] }), _jsxs("div", { className: "flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar", children: [_jsxs(Button, { variant: "outline", className: "flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 h-auto", "aria-label": "Filter preferences", children: [_jsx(SlidersHorizontal, { className: "w-4 h-4" }), t.preferences] }), _jsx("div", { className: "h-6 w-px bg-gray-200 mx-2" }), FILTERS.map((f) => (_jsx(Button, { variant: "ghost", onClick: () => onToggleFilter(f.key), className: `
                                    whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border h-auto
                                    ${activeFilters.includes(f.key)
                                    ? "bg-[#22C55E] text-white border-[#22C55E] hover:bg-[#16A34A]"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-[#22C55E]/50"}
                                `, "aria-label": `Toggle ${f.label} filter`, children: f.label }, f.key)))] })] }) }) }));
}
