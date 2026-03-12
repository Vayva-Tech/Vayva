import React from "react";
import { ShoppingBag, Search, Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@vayva/ui";

interface MobileHeaderProps {
  storeName?: string;
  cartItemCount?: number;
}

export const MobileHeader = ({
  storeName = "GIZMO TECH",
  cartItemCount = 0,
}: MobileHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-transparent border-b border-gray-200 h-[60px] flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-3 ring-offset-2">
        {/* Optional Menu Icon for more nav */}
        {/* <Menu size={20} className="text-gray-500" /> */}
        <Link
          href="/"
          className="font-bold text-xl tracking-tighter uppercase text-[#0B0F19]"
        >
          {storeName}
        </Link>
      </div>

      <div className="flex items-center gap-5 text-[#0B0F19]">
        <Button variant="ghost" size="icon" className="p-1 hover:text-blue-600 transition-colors h-auto" aria-label="Search">
          <Search size={20} strokeWidth={2} />
        </Button>
        <Link
          href="/cart"
          className="relative p-1 hover:text-blue-600 transition-colors"
        >
          <ShoppingBag size={20} strokeWidth={2} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#3B82F6] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
              {cartItemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};
