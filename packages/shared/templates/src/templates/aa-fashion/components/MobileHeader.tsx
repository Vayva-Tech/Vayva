import React from "react";
import { ShoppingBag, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@vayva/ui";

interface MobileHeaderProps {
  storeName: string;
  cartItemCount?: number;
}

export const MobileHeader = ({
  storeName,
  cartItemCount = 0,
}: MobileHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-transparent border-b border-gray-100 h-[60px] flex items-center justify-between px-4">
      <Link
        href="/"
        className="font-bold text-lg tracking-tight uppercase text-[#111111]"
      >
        {storeName}
      </Link>

      <div className="flex items-center gap-4 text-[#111111]">
        <Button
          variant="ghost"
          size="icon"
          className="p-1 h-auto"
          aria-label="Search"
        >
          <Search size={22} strokeWidth={1.5} />
        </Button>
        <Link href="/cart" className="relative p-1">
          <ShoppingBag size={22} strokeWidth={1.5} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#111111] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};
