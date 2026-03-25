"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type MarketingOfferState = {
  starterFirstMonthFree: boolean;
  starterTrialDays: number;
  loaded: boolean;
};

const fallbackState = (starter: boolean, days: number): MarketingOfferState => ({
  starterFirstMonthFree: starter,
  starterTrialDays: days,
  loaded: true,
});

const MarketingOfferContext = createContext<MarketingOfferState>(
  fallbackState(true, 30),
);

export function MarketingOfferProvider({
  children,
  initialStarterFirstMonthFree = true,
  initialStarterTrialDays = 30,
}: {
  children: React.ReactNode;
  /** From server `readStarterFirstMonthFreeEnabled()` — avoids promo/trial flash on first paint. */
  initialStarterFirstMonthFree?: boolean;
  initialStarterTrialDays?: number;
}): React.JSX.Element {
  const [state, setState] = useState<MarketingOfferState>(() =>
    fallbackState(initialStarterFirstMonthFree, initialStarterTrialDays),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/public/marketing-offer", {
          cache: "no-store",
        });
        const data = (await res.json()) as Partial<MarketingOfferState>;
        if (cancelled) return;
        setState({
          starterFirstMonthFree: Boolean(data.starterFirstMonthFree ?? true),
          starterTrialDays:
            typeof data.starterTrialDays === "number" ? data.starterTrialDays : 30,
          loaded: true,
        });
      } catch {
        if (!cancelled) {
          setState((s) => ({ ...s, loaded: true }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MarketingOfferContext.Provider value={state}>
      {children}
    </MarketingOfferContext.Provider>
  );
}

export function useMarketingOffer(): MarketingOfferState {
  return useContext(MarketingOfferContext);
}
