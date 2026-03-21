"use client";

import React from "react";
import { Button } from "@vayva/ui";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";

export function WithdrawFundsTrigger() {
  const router = useRouter();

  return (
    <Button onClick={() => router.push("/dashboard/finance/payouts")}>
      <ArrowUpRight className="mr-2 h-4 w-4" /> Withdraw Funds
    </Button>
  );
}
