"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@vayva/ui";
export function RatingStars({ rating, onRate, size = 18 }) {
    const [hover, setHover] = useState(0);
    return (_jsx("div", { className: "flex gap-1", onMouseLeave: () => setHover(0), children: [1, 2, 3, 4, 5].map((star) => (_jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: () => onRate(star), onMouseEnter: () => setHover(star), className: "focus:outline-none transition-transform hover:scale-110 p-0 h-auto", "aria-label": `Rate ${star} stars`, children: _jsx(Star, { size: size, className: `
                            transition-colors
                            ${(hover || rating) >= star
                    ? "fill-[#FFD700] text-[#FFD700]"
                    : "text-gray-300"}
                        ` }) }, star))) }));
}
