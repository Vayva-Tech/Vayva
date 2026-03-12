import React from "react";
import { ShoppingBag, Search, Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@vayva/ui";

interface EditorialHeaderProps {
  storeName?: string;
  cartItemCount?: number;
}

export const EditorialHeader = ({
  storeName = "BLOOME & HOME",
  cartItemCount = 0,
}: EditorialHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-[#FAFAF9]/90 backdrop-blur-sm border-b border-stone-200 h-[70px] flex items-center justify-between px-6 transition-all duration-300">
      {/* Left - Menu (Editorial feel often has menu on left) */}
      <Button variant="ghost" size="icon" className="p-2 -ml-2 hover:bg-stone-100 rounded-full text-stone-600 transition-colors h-auto" aria-label="Open menu">
        <Menu size={22} strokeWidth={1.5} />
      </Button>

      {/* Center - Brand */}
      <Link
        href="/"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-2xl tracking-widest text-[#2E2E2E]"
      >
        {storeName}
      </Link>

      {/* Right - Icons */}
      <div className="flex items-center gap-4 text-stone-600">
        <Button variant="ghost" size="icon" className="p-2 hover:text-[#C9B7A2] transition-colors h-auto" aria-label="Search">
          <Search size={22} strokeWidth={1.5} />
        </Button>
        <Link
          href="/cart"
          className="relative p-2 hover:text-[#C9B7A2] transition-colors"
        >
          <ShoppingBag size={22} strokeWidth={1.5} />
          {cartItemCount > 0 && (
            <span className="absolute top-1 right-0 bg-[#C9B7A2] text-white text-[10px] font-medium h-4 w-4 rounded-full flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};
