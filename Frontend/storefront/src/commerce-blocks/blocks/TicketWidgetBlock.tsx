"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@vayva/ui";
import { reportError } from "@/lib/error";

interface TicketTier {
  id: string;
  name: string;
  description: string | null;
  price: number;
  remaining: number;
  maxPerOrder: number;
}

interface EventDetails {
  id: string;
  title: string;
  description: string | null;
  venue: string | null;
  address: string | null;
  startDate: string;
  endDate: string;
  timezone: string;
  bannerImage: string | null;
  category: string;
  ticketTiers: TicketTier[];
}

export default function TicketWidgetBlock({ eventId }: { eventId?: string }) {
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!eventId) {
        setLoading(false);
        setEvent(null);
        return;
      }

      try {
        const url = new URL("/api/storefront/events/one", window.location.origin);
        url.searchParams.set("eventId", eventId);

        const res = await fetch(url.toString());
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(String((json as any)?.error || "Failed to load event"));

        setEvent((json as any)?.data || null);
      } catch (e: unknown) {
        reportError(e, { scope: "CommerceBlock.TicketWidget.fetchEvent", app: "storefront" });
        setError(e instanceof Error ? e.message : "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [eventId]);

  const tiers = event?.ticketTiers || [];

  const totalPrice = useMemo(() => {
    return tiers.reduce((acc, t) => acc + (quantities[t.id] || 0) * t.price, 0);
  }, [tiers, quantities]);

  const totalQty = useMemo(() => {
    return Object.values(quantities).reduce((a, b) => a + b, 0);
  }, [quantities]);

  const canSubmit = Boolean(eventId && totalQty > 0 && name.trim() && email.trim() && !submitting);

  const setQty = (tierId: string, next: number) => {
    setQuantities((prev) => ({ ...prev, [tierId]: Math.max(0, next) }));
  };

  const onCheckout = async () => {
    if (!event) return;

    setSubmitting(true);
    setError(null);
    setSuccessRef(null);

    try {
      const items = tiers
        .map((t) => ({ tierId: t.id, quantity: quantities[t.id] || 0 }))
        .filter((i) => i.quantity > 0);

      const res = await fetch("/api/storefront/events/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          items,
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim() || null,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(String((json as any)?.error || "Checkout failed"));

      const reference = (json as any)?.data?.reference;
      if (!reference) throw new Error("Missing payment reference");

      // Use existing storefront payment initializer. It validates tenant ownership.
      const payRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const payJson = await payRes.json().catch(() => ({}));
      if (!payRes.ok) {
        throw new Error(String((payJson as any)?.error || "Payment init failed"));
      }

      const authorizationUrl = (payJson as any)?.authorizationUrl;
      if (authorizationUrl) {
        window.location.href = authorizationUrl;
        return;
      }

      setSuccessRef(reference);
    } catch (e: unknown) {
      reportError(e, { scope: "CommerceBlock.TicketWidget.checkout", app: "storefront" });
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!eventId) {
    return (
      <div className="p-6 rounded-3xl border border-gray-200 bg-transparent">
        <div className="text-sm font-bold">Select an event</div>
        <div className="text-xs text-text-tertiary mt-1">
          Add an eventId prop in WebStudio to show ticket checkout.
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-6 text-sm text-text-tertiary">Loading tickets...</div>;

  if (error || !event) {
    return (
      <div className="p-6 rounded-3xl border border-red-100 bg-red-50/50">
        <p className="text-sm font-bold text-red-600">This section couldn't load.</p>
        <p className="text-[10px] text-red-400 mt-1">{error || "Event not found"}</p>
      </div>
    );
  }

  return (
    <div id="tickets" className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-xs font-black uppercase tracking-widest text-text-tertiary">Tickets</div>
      <div className="text-2xl font-black tracking-tight">{event.title}</div>
      {event.venue ? <div className="text-sm text-text-tertiary mt-1">{event.venue}</div> : null}

      {successRef ? (
        <div className="mt-6 p-4 rounded-2xl border border-green-100 bg-green-50/50">
          <div className="text-sm font-bold text-green-700">Checkout created.</div>
          <div className="text-[10px] text-green-600 mt-1">Reference: {successRef}</div>
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-gray-200 bg-transparent p-5">
          <div className="text-sm font-black">Your details</div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" />
          </div>

          {error ? (
            <div className="mt-4 text-[10px] text-red-500">{error}</div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-gray-200 bg-transparent p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-black">Select tickets</div>
            <div className="text-[10px] text-text-tertiary">
              {totalQty} ticket{totalQty === 1 ? "" : "s"}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {tiers.map((t) => {
              const qty = quantities[t.id] || 0;
              const max = Math.min(t.maxPerOrder || 10, t.remaining);
              return (
                <div key={t.id} className="rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-black">{t.name}</div>
                      {t.description ? (
                        <div className="text-xs text-text-tertiary mt-1">{t.description}</div>
                      ) : null}
                      <div className="text-xs text-text-tertiary mt-1">Remaining: {t.remaining}</div>
                    </div>
                    <div className="font-black text-purple-600">₦{t.price.toLocaleString()}</div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-text-tertiary">Qty</div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setQty(t.id, qty - 1)}
                        disabled={qty <= 0}
                        className="w-9 h-9 rounded-xl bg-transparent border border-gray-200"
                      >
                        -
                      </Button>
                      <div className="w-10 text-center font-black">{qty}</div>
                      <Button
                        onClick={() => setQty(t.id, qty + 1)}
                        disabled={qty >= max}
                        className="w-9 h-9 rounded-xl bg-transparent border border-gray-200"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {tiers.length === 0 ? (
              <div className="p-4 rounded-2xl border border-gray-100 bg-background/40 text-xs text-text-tertiary">
                No ticket tiers available.
              </div>
            ) : null}
          </div>

          <div className="mt-6">
            <Button
              onClick={onCheckout}
              disabled={!canSubmit}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {submitting ? "Processing..." : `Checkout (₦${totalPrice.toLocaleString()})`}
            </Button>
            <div className="mt-2 text-[10px] text-text-tertiary">
              You will be redirected to payment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
