'use client';

import { usePOS } from '@/components/pos/POSProvider';
import { Button } from '@vayva/ui/components/ui/button';
import { ScrollArea } from '@vayva/ui/components/ui/scroll-area';
import { Trash2, Plus, Minus } from 'lucide-react';

export function POSCart() {
  const { state, removeItem, updateQuantity, updateDiscount } = usePOS();

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-3">
        {state.cart.map((item, index) => (
          <div 
            key={`${item.posItemId}-${index}`}
            className="p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{item.name}</h4>
                <p className="text-xs text-gray-500">₦{item.price.toLocaleString()}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500 hover:text-red-700"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(index, Math.max(1, item.quantity - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(index, item.quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>

              <div className="ml-auto font-semibold">
                ₦{(item.price * item.quantity - (item.discount || 0)).toLocaleString()}
              </div>
            </div>

            {/* Discount input */}
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                placeholder="Discount"
                value={item.discount || ''}
                onChange={(e) => updateDiscount(index, parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {item.notes && (
              <p className="text-xs text-gray-500 mt-2">{item.notes}</p>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
