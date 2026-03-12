import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@vayva/ui";
import { PublicProduct } from "@vayva/templates/types/storefront";

interface FoodItemCardProps {
  item: PublicProduct;
  onClick: () => void;
}

export const FoodItemCard = ({
  item,
  onClick,
}: FoodItemCardProps): React.JSX.Element => {
  return (
    <div
      onClick={onClick}
      className="flex gap-4 p-4 border-b border-gray-100 bg-transparent active:bg-white/60 transition-colors cursor-pointer"
    >
      {/* Text Content */}
      <div className="flex-1 space-y-1">
        <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
        <div className="pt-2 text-sm font-bold text-gray-900">
          ₦{item.price.toLocaleString()}
        </div>
      </div>

      {/* Image & Add Button */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <img
          src={item.images?.[0] || "https://placehold.co/100x100?text=Food"}
          alt={item.name}
          className="w-full h-full object-cover rounded-xl bg-background/50 backdrop-blur-sm shadow-sm"
        />
        <Button
          size="icon"
          className="absolute -bottom-2 -right-2 bg-transparent text-red-600 p-1.5 rounded-full shadow-md border border-gray-100 h-auto"
          aria-label={`Add ${item.name} to order`}
        >
          <Plus size={18} strokeWidth={3} />
        </Button>
      </div>
    </div>
  );
};
