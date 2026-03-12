"use client";

import { Star } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { Button } from "@vayva/ui";

interface RatingStarsProps {
  rating: number; // 0 if not rated
  onRate: (rating: number) => void;
  size?: number;
}

export function RatingStars({
  rating,
  onRate,
  size = 18,
}: RatingStarsProps): React.JSX.Element {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star: any) => (
        <Button
          key={star}
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRate(star)}
          onMouseEnter={() => setHover(star)}
          className="focus:outline-none transition-transform hover:scale-110 p-0 h-auto"
          aria-label={`Rate ${star} stars`}
        >
          <Star
            size={size}
            className={`
                            transition-colors
                            ${
                              (hover || rating) >= star
                                ? "fill-[#FFD700] text-[#FFD700]"
                                : "text-gray-300"
                            }
                        `}
          />
        </Button>
      ))}
    </div>
  );
}
