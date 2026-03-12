"use client";

import React from "react";
import Link from "next/link";
import {
  IconCheck as BadgeCheck,
  IconBriefcase as Briefcase,
  IconCreditCard as CreditCard,
  IconLayoutDashboard as LayoutDashboard,
  IconPackage as Package,
  IconSparkles as Sparkles,
  IconHanger as Shirt,
  IconDeviceMobile as Smartphone,
  IconTruck as Truck,
  IconUsers as Users,
  IconToolsKitchen2 as UtensilsCrossed,
} from "@tabler/icons-react";

import { Button } from "@vayva/ui";

type IndustryKey =
  | "food"
  | "fashion"
  | "beauty"
  | "electronics"
  | "services";

const INDUSTRIES: Array<{
  key: IndustryKey;
  buttonLabel: string;
  label: string;
  tagline: string;
  Icon: React.ComponentType<{ className?: string }>;
  before: string;
  after: string;
  bullets: string[];
  outcomes: string[];
}> = [
  {
    key: "food",
    buttonLabel: "Food",
    label: "Food & Restaurants",
    tagline: "Menu orders, payment requests, kitchen and dispatch tracking.",
    Icon: UtensilsCrossed,
    before:
      "Before Vayva, orders are screenshots, addresses are voice notes, and your kitchen is calling you because they can’t find the right details.",
    after:
      "With Vayva, WhatsApp orders are structured. Your team sees what to prepare, who has paid, and where the rider is without calling you every 5 minutes.",
    bullets: [
      "Capture menu orders with notes (no onions, extra spice, etc.) and keep it organized.",
      "Request payment and mark paid so you don’t cook for jokes.",
      "Kitchen view keeps active orders clear during rush hour.",
      "Dispatch tracking so you can answer “dispatch don reach?” with confidence. Manual or automated depending on your setup.",
    ],
    outcomes: ["Fewer mistakes", "Less calling", "Faster turnaround"],
  },
  {
    key: "fashion",
    buttonLabel: "Fashion",
    label: "Fashion & Apparel",
    tagline: "Sizes, variants, stock control, repeat customers.",
    Icon: Shirt,
    before:
      "Before Vayva, you are asking the same questions all day: size, colour, delivery address. Then you lose the chat when you get busy at work.",
    after:
      "With Vayva, the details are captured once. Stock stays accurate, payment is tracked, and delivery is handled even if you are at your 9 to 5.",
    bullets: [
      "Capture size, colour, and variant details so you don’t ask the same questions again.",
      "Track inventory so you stop taking payment for what’s not available.",
      "Send payment links and keep receipts/records clean for every sale.",
      "Know what’s selling, what to restock, and what’s pending delivery from your dashboard.",
    ],
    outcomes: ["Less back and forth", "Better stock", "More repeat buyers"],
  },
  {
    key: "beauty",
    buttonLabel: "Beauty",
    label: "Beauty & Cosmetics",
    tagline: "Shades, variants, product info, repeat purchase tracking.",
    Icon: Sparkles,
    before:
      "Before Vayva, customers ask for ingredients, shade names, and expiry. You end up sending long voice notes and still losing the sale.",
    after:
      "With Vayva, your products have clear details on your storefront, and WhatsApp chats become trackable orders with payment + delivery handled.",
    bullets: [
      "List products with ingredients/usage so customers trust what they’re buying.",
      "Track shades/variants and stock so you don’t oversell.",
      "Payment and delivery tracking in one flow. Less back and forth, more completed orders. Automation depends on plan and integration.",
      "See repeat customers and what they usually buy.",
    ],
    outcomes: ["More trust", "Fewer cancelled orders", "Repeat customers"],
  },
  {
    key: "electronics",
    buttonLabel: "Electronics",
    label: "Electronics",
    tagline: "Specs, warranty info, stock, faster checkout.",
    Icon: Smartphone,
    before:
      "Before Vayva, you are answering specs and price questions nonstop, while serious buyers wait. You still can’t tell which orders are paid.",
    after:
      "With Vayva, product specs live on your storefront and every WhatsApp conversation can become a paid order with delivery tracking.",
    bullets: [
      "Publish products with specs + warranty info so buyers don’t need to ask twice.",
      "Confirm availability and lock stock when payment is received.",
      "Keep receipts, order history, and customer details automatically.",
      "Delivery tracking and after sales follow up from one dashboard. Automation depends on plan and integration.",
    ],
    outcomes: ["Faster response", "Cleaner payments", "Fewer disputes"],
  },
  {
    key: "services",
    buttonLabel: "Services",
    label: "Professional Services",
    tagline: "Bookings, invoices, status updates.",
    Icon: Briefcase,
    before:
      "Before Vayva, you’re chasing clients for deposits, mixing bookings with personal chats, and forgetting who you promised what.",
    after:
      "With Vayva, bookings and payments are organized. Clients get clarity, you get peace, and you can focus on your work not your WhatsApp.",
    bullets: [
      "Turn chats into bookings with clear status requested to confirmed to completed.",
      "Send quotes/invoices and collect payment without chasing.",
      "Keep customer notes and history so you deliver consistently.",
      "Track your daily/weekly performance from the dashboard.",
    ],
    outcomes: ["Cleaner bookings", "Paid faster", "Better customer history"],
  },
];

export default function IndustriesInteractiveSection(props: {
  initialIndustry?: string;
}): React.JSX.Element {
  const initialKey: IndustryKey = ((): IndustryKey => {
    const value = (props.initialIndustry || "").toLowerCase();
    if (value === "food") return "food";
    if (value === "fashion") return "fashion";
    if (value === "beauty") return "beauty";
    if (value === "electronics") return "electronics";
    if (value === "services") return "services";
    return "food";
  })();

  const [selected, setSelected] = React.useState<IndustryKey>(initialKey);
  const active = React.useMemo(
    () => INDUSTRIES.find((i) => i.key === selected)!,
    [selected],
  );

  return (
    <section className="px-4 pb-10 md:pb-16 relative z-10">
      <div className="max-w-[1760px] mx-auto">
        <div className="rounded-3xl border border-border/60 bg-background/80 p-6 md:p-10 shadow-sm backdrop-blur">
          <div className="grid gap-8 md:grid-cols-[1fr_1fr] md:items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                Built for how we actually sell in Nigeria.
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Most businesses don’t lose sales because their product is bad.
                They lose sales because DMs get messy: “How much?”, “Send
                account”, “Is it available?”, “Dispatch don reach?”.
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Vayva keeps it clean: it captures the order, requests payment,
                tracks delivery, and records everything in your dashboard.
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Delivery can be manual or automated depending on your plan and
                integrations.
              </p>

              <div className="mt-6">
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Choose an industry
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {INDUSTRIES.map((it) => {
                    const isActive = it.key === selected;
                    return (
                      <Button
                        variant="ghost"
                        key={it.key}
                        type="button"
                        onClick={() => setSelected(it.key)}
                        aria-pressed={isActive}
                        className={
                          isActive
                            ? "rounded-lg bg-foreground px-4 py-2 text-sm font-bold text-background"
                            : "rounded-lg border border-border/60 bg-background px-4 py-2 text-sm font-bold text-foreground hover:border-border"
                        }
                      >
                        {it.buttonLabel}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { Icon: LayoutDashboard, label: "Orders" },
                  { Icon: CreditCard, label: "Payments" },
                  { Icon: Package, label: "Inventory" },
                  { Icon: Truck, label: "Delivery" },
                ].map((it) => (
                  <div
                    key={it.label}
                    className="rounded-2xl border border-border/60 bg-muted/30 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-background border border-border/60 flex items-center justify-center">
                        <it.Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-sm font-extrabold text-foreground">
                        {it.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-muted/30 p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-background border border-border/60 flex items-center justify-center">
                  <active.Icon className="w-6 h-6 text-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-extrabold text-foreground leading-tight">
                    {active.label}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {active.tagline}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-background border border-border/60 p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center">
                      <BadgeCheck className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Before
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-foreground leading-relaxed">
                    {active.before}
                  </div>
                </div>
                <div className="rounded-2xl bg-background border border-border/60 p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      After
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-foreground leading-relaxed">
                    {active.after}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {active.bullets.map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <span className="mt-2 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <div className="text-sm text-foreground leading-relaxed">
                      {b}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-background border border-border/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">
                      What you get
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-foreground">
                      {active.outcomes.join(" • ")}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/industries"
                  className="text-sm font-semibold text-primary hover:text-primary/80"
                >
                  View all industries →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
