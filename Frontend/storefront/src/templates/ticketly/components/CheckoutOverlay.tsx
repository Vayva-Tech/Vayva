import React, { useState } from "react";
import { X, ArrowRight, LockKey as Lock } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { reportError } from "@/lib/error";

interface CheckoutOverlayProps {
  storeId: string;
  productId: string;
  total: number;
  count: number;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComplete: (data: any) => void;
}

export const CheckoutOverlay = ({
  storeId,
  productId,
  total,
  count,
  onClose,
  onComplete,
}: CheckoutOverlayProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          items: [
            {
              id: productId,
              quantity: count,
              price: total / count,
              title: "Ticket",
            },
          ], // Simple mapping
          total,
          subtotal: total,
          customer: { email, firstName: name.split(" ")[0] },
          paymentMethod: "BANK_TRANSFER",
          deliveryMethod: "digital",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onComplete({
          attendee: { name, email },
          bankDetails: data.bankDetails,
          storeName: data.storeName,
          orderNumber: data.orderNumber,
        });
      } else {
        alert("Failed to create ticket order.");
        setIsProcessing(false);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: unknown) {
      reportError(err, {
        scope: "Ticketly.CheckoutOverlay.submit",
        app: "storefront",
      });
      setIsProcessing(false);
      alert("Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-transparent rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-lg">Checkout</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="p-2 hover:bg-white/60 rounded-full h-auto"
            aria-label="Close checkout"
          >
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div className="bg-background/40 backdrop-blur-sm p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tickets</span>
              <span className="font-bold">{count}x</span>
            </div>
            <div className="flex justify-between text-lg font-black pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-purple-600">₦{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e: any) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="E.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="john@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tickets will be sent here.
              </p>
            </div>
          </div>
        </form>

        <div className="p-4 border-t border-gray-100">
          <Button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-70 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all h-auto"
            aria-label={
              isProcessing
                ? "Processing order"
                : `Pay ₦${total.toLocaleString()}`
            }
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                Pay ₦{total.toLocaleString()} <ArrowRight size={18} />
              </>
            )}
          </Button>
          <div className="flex justify-center items-center gap-2 mt-3 text-xs text-gray-400">
            <Lock size={10} /> Secured by Vayva Pay
          </div>
        </div>
      </div>
    </div>
  );
};
