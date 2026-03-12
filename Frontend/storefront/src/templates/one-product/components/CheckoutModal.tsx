import React, { useState, ChangeEvent } from "react";
import { X, CheckCircle, ShoppingBag } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { reportError } from "@/lib/error";
import { PublicProduct } from "@/types/storefront";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: PublicProduct;
  qty: number;
  upsellProduct?: PublicProduct;
}

export const CheckoutModal = ({
  isOpen,
  onClose,
  product,
  qty,
  upsellProduct,
}: CheckoutModalProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [upsellAdded, setUpsellAdded] = useState(false);
  const [step, setStep] = useState(1);
  const [confirmationData, setConfirmationData] = useState<{
    storeName?: string;
    orderNumber?: string;
    bankDetails?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  } | null>(null);

  if (!isOpen) return null;

  const total =
    (product.price || 0) * qty +
    (upsellAdded && upsellProduct ? (upsellProduct.price || 0) : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Determine items
      const items = [
        {
          id: product.id,
          quantity: qty,
          metadata: product.variants?.[0]?.id
            ? {
                variantId: product.variants?.[0]?.id,
              }
            : undefined,
        },
      ];

      if (upsellAdded && upsellProduct) {
        items.push({
          id: upsellProduct.id,
          quantity: 1,
          metadata: upsellProduct.variants?.[0]?.id
            ? {
                variantId: upsellProduct.variants?.[0]?.id,
              }
            : undefined,
        });
      }

      // Real API Call to Backend
      // Only works if storeId is available on product (it should be)
      // If CORS is an issue, we might need a proxy in next.config.js, but let's assume same-domain or CORS enabled.
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: product.storeId,
          items,
          customer: {
            email,
            note: `${fullName}\n${address}, ${city}, ${state}`,
          },
          deliveryMethod: "DELIVERY",
          paymentMethod: "BANK_TRANSFER",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConfirmationData(data); // Save response data for display
        setStep(2);
        // Removed setTimeout to allow user to read bank details
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (err: unknown) {
      reportError(err, {
        scope: "OneProduct.CheckoutModal.submit",
        app: "storefront",
      });
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-transparent rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h3>
          <p className="text-gray-500 mb-6">
            Ref: <b>{confirmationData?.orderNumber}</b>
            <br />
            We've sent a receipt to <b>{email}</b>.
          </p>

          {confirmationData?.bankDetails && (
            <div className="bg-background/40 backdrop-blur-sm p-4 rounded-xl text-left border border-gray-200 mb-6">
              <p className="text-xs font-bold uppercase text-gray-500 mb-2">
                Please transfer to:
              </p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Bank:</span>{" "}
                  <span className="font-semibold">
                    {confirmationData.bankDetails.bankName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Account:</span>{" "}
                  <span className="font-semibold text-lg">
                    {confirmationData.bankDetails.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Name:</span>{" "}
                  <span className="font-semibold">
                    {confirmationData.bankDetails.accountName}
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-center text-gray-400">
                Paying to <b>{confirmationData?.storeName}</b>
              </div>
            </div>
          )}

          <Button
            onClick={onClose}
            className="w-full bg-black text-white font-bold py-3 rounded-xl h-auto"
            aria-label="I have made payment"
          >
            I have made payment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm animate-in slide-in-from-right-10 duration-300">
      <div className="w-full max-w-md bg-transparent h-full shadow-2xl flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <ShoppingBag size={20} /> Checkout
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-auto"
            aria-label="Close checkout"
          >
            <X size={24} className="text-gray-400" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Order Summary */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">
              Order Summary
            </h3>
            <div className="flex gap-4 mb-4">
              <div className="w-16 h-16 bg-background/50 backdrop-blur-sm rounded-lg overflow-hidden shrink-0">
                <img
                  src={product.images?.[0] || "/placeholder.png"}
                  alt={product.name || "Product"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-gray-900">
                  {product.name || "Product"}
                </h4>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-500">Qty: {qty}</span>
                  <span className="font-bold text-sm">
                    ₦{((product.price || 0) * qty).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Upsell */}
            {upsellProduct && (
              <div
                className={`border-2 rounded-xl p-4 transition-all ${upsellAdded ? "border-green-500 bg-green-50" : "border-dashed border-gray-300"}`}
              >
                <div className="flex items-start gap-4">
                  <input
                    id="upsell-added"
                    type="checkbox"
                    checked={upsellAdded}
                    onChange={() => setUpsellAdded(!upsellAdded)}
                    className="mt-1 w-5 h-5 rounded text-green-600 focus:ring-green-500"
                    aria-label={`Add ${upsellProduct.name || "Product"} to order`}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm text-gray-900 block mb-1">
                        One-time Offer: Add {upsellProduct.name || "Product"}?
                      </span>
                      <span className="font-bold text-sm text-gray-900">
                        {" "}
                        +₦{(upsellProduct.price || 0).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {upsellProduct.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="checkout-email"
                className="block text-xs font-bold text-gray-700 uppercase mb-1"
              >
                Contact Info
              </label>
              <input
                id="checkout-email"
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="checkout-fullname"
                className="block text-xs font-bold text-gray-700 uppercase mb-1"
              >
                Shipping Address
              </label>
              <input
                id="checkout-fullname"
                type="text"
                placeholder="Full Name"
                required
                value={fullName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFullName(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:outline-none mb-2"
                aria-label="Full Name"
              />
              <input
                id="checkout-address"
                type="text"
                placeholder="Street Address"
                required
                value={address}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setAddress(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:outline-none mb-2"
                aria-label="Street Address"
              />
              <div className="flex gap-2">
                <input
                  id="checkout-city"
                  type="text"
                  placeholder="City"
                  required
                  value={city}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCity(e.target.value)
                  }
                  className="w-1/2 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                  aria-label="City"
                />
                <input
                  id="checkout-state"
                  type="text"
                  placeholder="State"
                  required
                  value={state}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setState(e.target.value)
                  }
                  className="w-1/2 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                  aria-label="State"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-background/40 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium text-gray-600">Total to pay</span>
            <span className="font-black text-2xl text-gray-900">
              ₦{total.toLocaleString()}
            </span>
          </div>
          <Button
            form="checkout-form"
            type="submit"
            disabled={loading}
            className="w-full bg-[#111827] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black transition-all disabled:opacity-50 h-auto"
            aria-label={
              loading ? "Processing order" : `Pay ₦${total.toLocaleString()}`
            }
          >
            {loading ? "Processing..." : `Pay ₦${total.toLocaleString()}`}
          </Button>
          <div className="text-center mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>🔒 Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};
