import React from "react";
import { Button } from "@vayva/ui";

interface StickyCTAProps {
  price: number;
  onBuy: () => void;
}

export const StickyCTA = ({ price, onBuy }: StickyCTAProps): React.JSX.Element => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-transparent border-t border-gray-200 p-4 md:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex items-center justify-between gap-4 safe-area-bottom">
      <div>
        <span className="text-xs text-gray-500 uppercase font-bold block">
          Total
        </span>
        <span className="text-xl font-black text-gray-900">
          ₦{price.toLocaleString()}
        </span>
      </div>
      <Button
        onClick={onBuy}
        className="flex-1 bg-[#111827] text-white font-bold py-3 rounded-xl shadow-lg h-auto"
        aria-label={`Buy now for ₦${price.toLocaleString()}`}
      >
        Buy Now
      </Button>
    </div>
  );
};
