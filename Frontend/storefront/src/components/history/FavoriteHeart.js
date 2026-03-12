"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { Heart } from "lucide-react";
import { Button } from "@vayva/ui";
export function FavoriteHeart({ isFavorite, onToggle, size = 20, }) {
    return (_jsx(Button, { variant: "ghost", size: "icon", onClick: onToggle, className: "p-2 rounded-full hover:bg-white/50 transition-colors focus:outline-none group h-auto", "aria-label": isFavorite ? "Remove from favorites" : "Add to favorites", children: _jsx(Heart, { size: size, className: `
                    transition-all duration-300
                    ${isFavorite
                ? "fill-red-500 text-red-500 scale-110"
                : "text-gray-400 group-hover:text-red-400"}
                ` }) }));
}
