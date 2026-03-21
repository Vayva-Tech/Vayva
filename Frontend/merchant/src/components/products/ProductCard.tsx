import React from "react";
import {
  ProductServiceItem,
  ProductServiceType,
  ProductServiceStatus,
  formatCurrency,
} from "@vayva/shared";
import { Icon, cn, Button } from "@vayva/ui";

interface ProductCardProps {
  item: ProductServiceItem;
}

export const ProductCard = ({ item }: ProductCardProps) => {
  const getStatusColor = (status: ProductServiceStatus) => {
    switch (status) {
      case ProductServiceStatus.ACTIVE:
        return "bg-green-100 text-green-700";
      case ProductServiceStatus.DRAFT:
        return "bg-white/40 text-gray-500";
      case ProductServiceStatus.INACTIVE:
        return "bg-white/40 text-gray-500";
      case ProductServiceStatus.OUT_OF_STOCK:
        return "bg-red-100 text-red-700";
      case ProductServiceStatus.SCHEDULED:
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-white/40 text-gray-500";
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
      {/* Image Thumbnail Area */}
      <div className="h-40 bg-white/40 relative flex items-center justify-center text-gray-400">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon name="Image" size={32} />
        )}

        {/* Status Badge */}
        <div
          className={cn(
            "absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide",
            getStatusColor(item.status),
          )}
        >
          {item.status.replace("_", " ")}
        </div>

        {/* Edit Actions Checkbox (Optional) */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-black"
            variant="ghost"
          >
            <Icon name="MoveHorizontal" size={16} />
          </Button>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
          {item.name}
        </h3>
        <p className="text-gray-900 font-mono text-sm mb-3 font-medium">
          {formatCurrency(item.price, item.currency)}
        </p>

        <div className="mt-auto pt-3 border-t border-gray-100 text-xs text-gray-400 space-y-1">
          {/* Retail Specifics */}
          {item.type === ProductServiceType.RETAIL && (
            <div className="flex justify-between items-center">
              <span>Inventory:</span>
              {item.inventory?.enabled ? (
                <span
                  className={cn(
                    "font-medium",
                    item.inventory.quantity === 0
                      ? "text-red-600"
                      : "text-gray-500",
                  )}
                >
                  {item.inventory.quantity} in stock
                </span>
              ) : (
                <span className="text-gray-400 italic">Not tracked</span>
              )}
            </div>
          )}

          {/* Service Specifics */}
          {item.type === ProductServiceType.SERVICE && item.availability && (
            <div className="flex justify-between items-center">
              <span>Availability:</span>
              <span className="text-gray-500">
                {item.availability.days.length} days/week
              </span>
            </div>
          )}

          {/* Food Specifics */}
          {item.type === ProductServiceType.FOOD && item.isTodaysSpecial && (
            <div className="flex items-center gap-1 text-orange-600 font-bold">
              <Icon name="Star" size={12} fill="currentColor" /> Today's Special
            </div>
          )}
        </div>

        {/* Quick Actions Row */}
        <div className="flex items-center gap-2 mt-4 pt-2">
          <Button
            className="flex-1 py-1.5 border border-gray-100 rounded-lg text-xs font-bold text-gray-500 hover:bg-white/40 flex items-center justify-center gap-1"
            variant="outline"
          >
            <Icon name="Pencil" size={12} /> Edit
          </Button>
          <Button
            className="p-1.5 border border-gray-100 rounded-lg text-gray-400 hover:bg-white/40 hover:text-gray-900"
            title="Duplicate"
            variant="outline"
          >
            <Icon name="Copy" size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
};
