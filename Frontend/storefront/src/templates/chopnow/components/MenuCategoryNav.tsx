import React from "react";
import { Button } from "@vayva/ui";

interface MenuCategoryNavProps {
  categories: string[];
  activeCategory: string;
  onSelect: (cat: string) => void;
}

export const MenuCategoryNav = ({
  categories,
  activeCategory,
  onSelect,
}: MenuCategoryNavProps) => {
  // Simple sticky nav with horizontal scroll
  return (
    <div className="sticky top-[105px] z-40 bg-transparent border-b border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-6 px-4 py-3 min-w-max">
        {categories.map((cat: any) => (
          <Button
            key={cat}
            variant="ghost"
            onClick={() => onSelect(cat)}
            className={`text-sm font-bold whitespace-nowrap transition-colors h-auto ${
              activeCategory === cat
                ? "text-red-600 bg-red-50 px-3 py-1 rounded-full"
                : "text-gray-500 hover:text-gray-800"
            }`}
            aria-label={`Show ${cat} category`}
          >
            {cat}
          </Button>
        ))}
      </div>
    </div>
  );
};
