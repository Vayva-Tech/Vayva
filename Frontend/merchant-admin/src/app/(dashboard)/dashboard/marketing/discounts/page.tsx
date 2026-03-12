"use client";

import { DiscountList } from "@/components/marketing/DiscountList";
import { Button } from "@vayva/ui";
import { Plus } from "@phosphor-icons/react/ssr";
import Link from "next/link";

export default function DiscountsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discounts</h1>
          <p className="text-muted-foreground">
            Manage automatic discounts and coupon codes.
          </p>
        </div>
        <Link href="/dashboard/marketing/discounts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Discount
          </Button>
        </Link>
      </div>

      <DiscountList />
    </div>
  );
}
