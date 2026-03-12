"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Lock } from "lucide-react";
import { LOCALES } from "@/data/locales";
import { Button } from "@vayva/ui";
export function WeekSelector({ weeks, selectedWeekId, onSelectWeek, lang, }) {
    const t = LOCALES[lang];
    return (_jsxs("div", { className: "w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20", children: [_jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsx("div", { className: "flex items-center space-x-2 py-4 overflow-x-auto no-scrollbar", children: weeks.map((week) => {
                        const isSelected = week.id === selectedWeekId;
                        const isLocked = week.isLocked;
                        return (_jsxs(Button, { variant: "ghost", onClick: () => onSelectWeek(week.id), className: `
                                    flex flex-col items-center justify-center min-w-[100px] px-4 py-2 rounded-xl transition-all border-2 h-auto
                                    ${isSelected
                                ? "border-[#22C55E] bg-[#22C55E]/5 text-[#22C55E] hover:bg-[#22C55E]/10"
                                : "border-transparent hover:bg-gray-50 text-gray-500"}
                                `, "aria-label": `Select week ${week.label[lang]}`, children: [_jsx("span", { className: "text-xs font-semibold uppercase tracking-wider mb-1", children: t.week }), _jsx("span", { className: `text-sm font-bold whitespace-nowrap ${isSelected ? "text-[#22C55E]" : "text-gray-900"}`, children: week.label[lang] }), isLocked && _jsx(Lock, { className: "w-3 h-3 mt-1 text-gray-400" })] }, week.id));
                    }) }) }), _jsx("div", { className: "bg-gray-50 border-b border-gray-100 py-2", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center text-xs text-gray-500", children: (() => {
                        const activeWeek = weeks.find((w) => w.id === selectedWeekId);
                        if (!activeWeek)
                            return null;
                        if (activeWeek.isLocked) {
                            return (_jsxs("span", { className: "flex items-center gap-1 font-medium text-amber-600", children: [_jsx(Lock, { className: "w-3 h-3" }), " ", t.lockedWeek] }));
                        }
                        return (_jsxs("span", { children: [t.cutoffMessage, " ", new Date(activeWeek.cutoffDate).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { month: "short", day: "numeric", weekday: "short" })] }));
                    })() }) })] }));
}
