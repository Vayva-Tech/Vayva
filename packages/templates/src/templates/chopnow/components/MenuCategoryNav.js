import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from "@vayva/ui";
export const MenuCategoryNav = ({ categories, activeCategory, onSelect, }) => {
    // Simple sticky nav with horizontal scroll
    return (_jsx("div", { className: "sticky top-[105px] z-40 bg-background/70 backdrop-blur-xl border-b border-gray-100 shadow-sm overflow-x-auto no-scrollbar", children: _jsx("div", { className: "flex items-center gap-6 px-4 py-3 min-w-max", children: categories.map((cat) => (_jsx(Button, { variant: "ghost", onClick: () => onSelect(cat), className: `text-sm font-bold whitespace-nowrap transition-colors h-auto ${activeCategory === cat
                    ? "text-red-600 bg-red-50 px-3 py-1 rounded-full"
                    : "text-gray-500 hover:text-gray-800"}`, "aria-label": `Show ${cat} category`, children: cat }, cat))) }) }));
};
