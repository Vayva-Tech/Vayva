import React from "react";
import { X, ShoppingBag, Package } from "lucide-react";
import { Button } from "@vayva/ui";
import { PublicProduct } from "@vayva/templates/types/storefront";

interface CartItem {
  product: PublicProduct;
  qty: number;
}

interface MultiVendorCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export const MultiVendorCart = ({
  isOpen,
  onClose,
  items,
  onRemove,
  onCheckout,
}: MultiVendorCartProps) => {
  if (!isOpen) return null;

  // Group items by vendor
  const groupedItems = items.reduce(
    (acc, item) => {
      const vendorId = item.product.vendorDetails?.id || "unknown";
      if (!acc[vendorId]) {
        acc[vendorId] = {
          details: item.product.vendorDetails,
          items: [],
        };
      }
      acc[vendorId].items.push(item);
      return acc;
    },
    {} as Record<
      string,
      { details: PublicProduct["vendorDetails"]; items: CartItem[] }
    >,
  );

  const subTotal = items.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0,
  );

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-transparent h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-transparent">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#10B981]" />
            <h2 className="font-bold text-lg text-gray-900">
              Your Cart ({items.length})
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="p-2 hover:bg-white/60 rounded-full transition-colors text-gray-500 h-auto"
            aria-label="Close cart"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-background/40 backdrop-blur-sm">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
              <p>Your cart is empty.</p>
              <Button
                variant="link"
                onClick={onClose}
                className="mt-4 text-[#10B981] font-bold hover:underline h-auto p-0"
                aria-label="Start shopping"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            Object.entries(groupedItems).map(([vendorId, group]) => (
              <div
                key={vendorId}
                className="bg-transparent rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Vendor Header (Package Visual) */}
                <div className="bg-background/40 backdrop-blur-sm p-3 border-b border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-gray-700">
                    <Package size={14} />
                    <span>
                      Sold by {group.details?.name || "Unknown Vendor"}
                    </span>
                  </div>
                  <span className="text-gray-400">
                    Package {Object.keys(groupedItems).indexOf(vendorId) + 1} of{" "}
                    {Object.keys(groupedItems).length}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-50">
                  {group.items.map(({ product, qty }) => (
                    <div key={product.id} className="p-3 flex gap-3">
                      <div className="w-16 h-16 bg-background/50 backdrop-blur-sm rounded-md overflow-hidden shrink-0">
                        <img
                          src={product.images?.[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {group.details?.name}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold">
                            ₦{product.price.toLocaleString()}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">
                              Qty: {qty}
                            </span>
                            <Button
                              variant="link"
                              onClick={() => onRemove(product.id)}
                              className="text-xs text-red-500 hover:underline h-auto p-0 font-normal"
                              aria-label={`Remove ${product.name} from cart`}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-transparent">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 text-sm">
                Total ({Object.keys(groupedItems).length} Packages)
              </span>
              <span className="font-black text-xl text-[#111827]">
                ₦{subTotal.toLocaleString()}
              </span>
            </div>
            <Button
              onClick={onCheckout}
              className="w-full bg-[#111827] hover:bg-[#1F2937] text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-gray-200 h-auto"
              aria-label="Proceed to checkout"
            >
              Checkout Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
