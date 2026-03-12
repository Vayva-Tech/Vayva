import React, { useState } from "react";
import { Button } from "@vayva/ui";
import { PublicStore, PublicProduct } from "@vayva/templates/types/storefront";
import { EventHeader } from "./components/EventHeader";
import { EventHero } from "./components/EventHero";
import { TicketSelector } from "./components/TicketSelector";
import { CheckoutOverlay } from "./components/CheckoutOverlay";
import { TicketSuccess } from "./components/TicketSuccess";
import { useStore } from "@vayva/templates/context/StoreContext";

interface TicketlyLayoutProps {
  store: PublicStore;
  products: PublicProduct[];
}

export const TicketlyLayout = ({ store, products }: TicketlyLayoutProps): React.JSX.Element => {
  // For demo, we just pick the first event to show as "Main Event"
  // In real app, this would be an event detail page or a list
  const mainEvent = products[0];

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    total: number;
    count: number;
    productId: string;
  } | null>(null);
  const [successData, setSuccessData] = useState<{
    attendee: { name: string; email: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bankDetails?: any;
    storeName?: string;
    orderNumber?: string;
  } | null>(null);

  const handleBuyClick = () => {
    // Scroll to tickets
    document.getElementById("tickets")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTicketSelect = (id: string, count: number, total: number) => {
    setCheckoutData({ total, count, productId: id });
    setIsCheckingOut(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePaymentComplete = (data: any) => {
    setIsCheckingOut(false);
    setSuccessData(data);
  };

  if (!mainEvent) return <div>No events found.</div>;

  return (
    <div className="min-h-screen bg-transparent font-sans text-gray-900">
      <EventHeader storeName={store.name} />

      <main>
        <EventHero event={mainEvent} onBuy={handleBuyClick} />
        <TicketSelector event={mainEvent} onSelect={handleTicketSelect} />

        {/* More Events Test */}
        <section className="bg-background/40 backdrop-blur-sm py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">More from {store.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {products.slice(1).map((evt: any) => (
                <div
                  key={evt.id}
                  className="bg-transparent rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-48 bg-gray-200">
                    <img
                      src={evt.images?.[0]}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-purple-600 text-xs font-bold uppercase tracking-wider mb-2">
                      {new Date(
                        evt.eventDetails?.date || "",
                      ).toLocaleDateString()}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{evt.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {evt.eventDetails?.venue}
                    </p>
                    <Button className="text-sm font-bold border border-gray-200 px-4 py-2 rounded-lg hover:border-purple-600 hover:text-purple-600 transition-colors">
                      See Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center opacity-50 text-sm">
          <p>
            &copy; {new Date().getFullYear()} {store.name}. Powered by Ticketly.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span>Terms</span>
            <span>Privacy</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isCheckingOut && checkoutData && (
        <CheckoutOverlay
          total={checkoutData.total}
          count={checkoutData.count}
          storeId={store.id}
          productId={checkoutData.productId}
          onClose={() => setIsCheckingOut(false)}
          onComplete={handlePaymentComplete}
        />
      )}

      {successData && (
        <TicketSuccess
          event={mainEvent}
          attendee={successData.attendee}
          bankDetails={successData.bankDetails}
          storeName={successData.storeName}
          orderNumber={successData.orderNumber}
          onClose={() => setSuccessData(null)}
        />
      )}
    </div>
  );
};
