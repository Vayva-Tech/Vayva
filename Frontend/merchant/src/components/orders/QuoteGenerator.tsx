"use client";

import { useState } from "react";
import { Button, Input, Label, Card, CardContent } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { Truck, Wallet, MapPin, Clock, CurrencyCircleDollar as Currency } from "@phosphor-icons/react/ssr";

interface Quote {
  provider: "kwik" | "custom";
  price: number;
  currency: string;
  estimatedTime: string;
  distance?: number;
  notes?: string;
}

interface QuoteGeneratorProps {
  pickupAddress?: string;
  deliveryAddress?: string;
  onQuoteGenerated?: (quote: Quote) => void;
}

export function QuoteGenerator({ 
  pickupAddress: initialPickup, 
  deliveryAddress: initialDelivery,
  onQuoteGenerated 
}: QuoteGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"kwik" | "custom">("kwik");
  const [pickup, setPickup] = useState(initialPickup || "");
  const [dropoff, setDropoff] = useState(initialDelivery || "");
  const [customPrice, setCustomPrice] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);

  const handleGetKwikQuote = async () => {
    if (!pickup || !dropoff) {
      toast.error("Please enter both pickup and dropoff addresses");
      return;
    }

    setLoading(true);
    try {
      const response = await apiJson<{ quote?: Quote; error?: string }>(
        `/api/shipping/kwik/quote?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}`
      );

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.quote) {
        setQuote(response.quote);
        toast.success("Kwik quote generated!");
        onQuoteGenerated?.(response.quote);
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : String(error);
      toast.error(err || "Failed to get Kwik quote");
      // Fallback to custom delivery
      setDeliveryMethod("custom");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomQuote = async () => {
    if (!pickup || !dropoff || !customPrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await apiJson<{ quote?: Quote; error?: string }>(
        "/api/shipping/custom/quote",
        {
          method: "POST",
          body: JSON.stringify({
            pickupAddress: pickup,
            dropoffAddress: dropoff,
            price: parseFloat(customPrice),
            currency: "NGN",
            notes: customNotes,
          }),
        }
      );

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.quote) {
        setQuote(response.quote);
        toast.success("Custom quote created!");
        onQuoteGenerated?.(response.quote);
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : String(error);
      toast.error(err || "Failed to create custom quote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Generate Shipping Quote
          </h3>

          {/* Delivery Method Selection */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={() => setDeliveryMethod("kwik")}
              className={`p-4 rounded-xl border-2 transition-all ${
                deliveryMethod === "kwik"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-100 hover:border-green-300"
              }`}
            >
              <div className="text-center space-y-2">
                <Truck className="w-8 h-8 mx-auto text-green-600" />
                <p className="text-sm font-semibold text-gray-900">Kwik Delivery</p>
                <p className="text-xs text-gray-400">Automated quote</p>
              </div>
            </Button>

            <Button
              type="button"
              onClick={() => setDeliveryMethod("custom")}
              className={`p-4 rounded-xl border-2 transition-all ${
                deliveryMethod === "custom"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-100 hover:border-purple-300"
              }`}
            >
              <div className="text-center space-y-2">
                <Wallet className="w-8 h-8 mx-auto text-purple-600" />
                <p className="text-sm font-semibold text-gray-900">Custom Delivery</p>
                <p className="text-xs text-gray-400">Manual pricing</p>
              </div>
            </Button>
          </div>

          {/* Address Inputs */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="pickup">Pickup Address</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="pickup"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="Enter pickup location"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dropoff">Dropoff Address</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="dropoff"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  placeholder="Enter delivery location"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Kwik Quote Button */}
          {deliveryMethod === "kwik" && (
            <Button
              onClick={handleGetKwikQuote}
              disabled={loading || !pickup || !dropoff}
              className="w-full h-12 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Getting Quote...
                </>
              ) : (
                <>
                  <Truck className="w-5 h-5 mr-2" />
                  Get Kwik Quote
                </>
              )}
            </Button>
          )}

          {/* Custom Delivery Inputs */}
          {deliveryMethod === "custom" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="price">Delivery Price (₦)</Label>
                <div className="relative mt-1">
                  <Currency className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="price"
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="Enter delivery fee"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="E.g., Handle with care, fragile items"
                />
              </div>

              <Button
                onClick={handleCreateCustomQuote}
                disabled={loading || !pickup || !dropoff || !customPrice}
                className="w-full h-12 bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Creating Quote...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 mr-2" />
                    Create Custom Quote
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Quote Display */}
          {quote && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-green-900">Shipping Quote</span>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-black uppercase">
                  {quote.provider}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Currency className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-green-700">Price</p>
                    <p className="text-lg font-bold text-green-900">
                      ₦{quote.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-green-700">Estimated Time</p>
                    <p className="text-sm font-semibold text-green-900">{quote.estimatedTime}</p>
                  </div>
                </div>
              </div>

              {quote.notes && (
                <p className="text-xs text-green-700 italic border-t border-green-200 pt-2">
                  📝 {quote.notes}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
