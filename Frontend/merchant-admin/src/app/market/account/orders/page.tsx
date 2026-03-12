"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MarketAccountOrdersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/market/orders");
  }, [router]);

  return null;
}
