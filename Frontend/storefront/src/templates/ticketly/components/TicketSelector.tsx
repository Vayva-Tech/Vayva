import React, { useState } from "react";
import { Button } from "@vayva/ui";
import { Minus, Plus, Ticket } from "@phosphor-icons/react/ssr";
import { PublicProduct } from "@/types/storefront";

interface TicketSelectorProps {
  event: PublicProduct;
  onSelect: (ticketTypeId: string, qty: number, total: number) => void;
}

export const TicketSelector = ({
  event,
  onSelect,
}: TicketSelectorProps): React.JSX.Element => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQtyChange = (id: string, delta: number): void => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const newVal = Math.max(0, current + delta);
      return { ...prev, [id]: newVal };
    });
  };

  const totalTickets = Object.values(quantities).reduce((a: any, b: any) => a + b, 0);
  const totalPrice = (event.eventDetails?.ticketTypes || []).reduce((acc: any, type: any) => {
      return acc + type.price * (quantities[type.id] || 0);
    },
    0,
  );

  return (
    <div id="tickets" className="bg-transparent py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
            <Ticket size={24} />
          </div>
          <h2 className="text-2xl font-bold">Select Tickets</h2>
        </div>

        <div className="space-y-4">
          {(event.eventDetails?.ticketTypes || []).map(
            (type: {
              id: string;
              name: string;
              price: number;
              capacity?: number;
            }) => (
              <div
                key={type.id}
                className="border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-lg">{type.name}</h3>
                  <p className="text-purple-600 font-bold">
                    ₦{type.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {type.capacity && type.capacity < 100
                      ? "Almost sold out!"
                      : "Available"}
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-background/40 backdrop-blur-sm p-2 rounded-lg">
                  <Button
                    onClick={() => handleQtyChange(type.id, -1)}
                    className="w-8 h-8 flex items-center justify-center bg-transparent rounded shadow-sm hover:bg-white/60 disabled:opacity-50"
                    disabled={!quantities[type.id]}
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="font-bold w-6 text-center">
                    {quantities[type.id] || 0}
                  </span>
                  <Button
                    onClick={() => handleQtyChange(type.id, 1)}
                    className="w-8 h-8 flex items-center justify-center bg-transparent rounded shadow-sm hover:bg-white/60"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            ),
          )}
        </div>

        {totalTickets > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-transparent border-t border-gray-100 p-4 shadow-lg md:relative md:shadow-none md:border-t-0 md:bg-transparent md:p-0 md:mt-8 animate-in slide-in-from-bottom duration-300 z-40">
            <div className="flex items-center justify-between gap-6 max-w-4xl mx-auto">
              <div className="hidden md:block">
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-2xl font-black">
                  ₦{totalPrice.toLocaleString()}
                </div>
              </div>
              <Button
                onClick={() => onSelect("mixed", totalTickets, totalPrice)} // Simplified ID for test
                className="flex-1 md:flex-none md:w-64 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 transition-colors"
              >
                Checkout (₦{totalPrice.toLocaleString()})
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
