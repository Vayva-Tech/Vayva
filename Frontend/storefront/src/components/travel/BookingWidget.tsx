"use client";

import { useState } from "react";
import { Users } from "@phosphor-icons/react/ssr";
import { Button, Input } from "@vayva/ui";
import { reportError } from "@/lib/error";

// Mocking "product" prop for simplicity in this file
import { CheckoutModal } from "@/templates/one-product/components/CheckoutModal"; // Cross-template import

import { PublicStore, PublicProduct } from "@/types/storefront";

export function BookingWidget({
  productId,
  price,
  store,
}: {
  productId: string;
  price: number;
  store: PublicStore;
}): React.JSX.Element {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<{
    isAvailable: boolean;
    available: number;
  } | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const nights =
    startDate && endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 1;
  const totalPrice = price * nights;

  const checkAvailability = async () => {
    if (!startDate || !endDate) return;
    setChecking(true);
    try {
      const res = await fetch(
        `/api/bookings/availability?productId=${productId}&start=${startDate}&end=${endDate}`,
      );
      const data = await res.json();
      setAvailability(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: unknown) {
      reportError(e, {
        scope: "BookingWidget.checkAvailability",
        app: "storefront",
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100 sticky top-24">
      <div className="flex justify-between items-baseline mb-6">
        <span className="text-2xl font-bold">₦{price.toLocaleString()}</span>
        <span className="text-gray-500 text-sm">/ night</span>
      </div>

      {startDate && endDate && (
        <div className="mb-4 text-sm bg-gray-50 p-2 rounded flex justify-between">
          <span>Total ({nights} nights)</span>
          <span className="font-bold">₦{totalPrice.toLocaleString()}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 block mb-1">
              Check-in
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setStartDate(e.target.value);
                setAvailability(null);
              }}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 block mb-1">
              Check-out
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEndDate(e.target.value);
                setAvailability(null);
              }}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-gray-500 block mb-1">
            Guests
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <Input
              type="number"
              min={1}
              value={guests}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setGuests(parseInt(e.target.value))
              }
              className="pl-9"
            />
          </div>
        </div>

        {availability !== null && (
          <div
            className={`text-sm p-3 rounded-lg flex items-center gap-2 ${availability.isAvailable ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${availability.isAvailable ? "bg-green-500" : "bg-red-500"}`}
            />
            {availability.isAvailable
              ? `${availability.available} rooms left!`
              : "Sold out for these dates."}
          </div>
        )}

        <Button
          className="w-full h-12 text-lg font-semibold"
          onClick={
            availability?.isAvailable
              ? () => setShowCheckout(true)
              : checkAvailability
          }
          variant={availability?.isAvailable ? "primary" : "secondary"}
        >
          {checking
            ? "Checking..."
            : availability?.isAvailable
              ? "Reserve Now"
              : "Check Availability"}
        </Button>

        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          qty={1} // We bundle nights into price
          product={
            {
              id: productId,
              name: `Stay: ${startDate} to ${endDate} (${nights} nights)`,
              price: totalPrice,
              images: [],
              description: `Booking for ${guests} guests`,
              storeId: store.id,
              variants: [],
              isDigital: true,
            } as unknown as PublicProduct
          }
        />
      </div>
    </div>
  );
}
