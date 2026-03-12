import React from "react";
import { MagnifyingGlass as Search, ShoppingBag, User, Heart, List as Menu } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { Button } from "@vayva/ui";

interface MarketHeaderProps {
  storeName?: string;
  cartCount?: number;
  onOpenCart: () => void;
}

export const MarketHeader = ({
  storeName,
  cartCount = 0,
  onOpenCart,
}: MarketHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-transparent border-b border-gray-200">
      {/* Top Utility Bar */}
      <div className="bg-[#111827] text-gray-300 text-xs py-2 px-6 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white">
              Sell on {storeName || "MarketHub"}
            </Link>
            <Link href="#" className="hover:text-white">
              Help Center
            </Link>
          </div>
          <div>
            <span>Currency: ₦ NGN</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 h-18 md:h-20 flex items-center gap-4 md:gap-8 bg-transparent">
        {/* Mobile Menu */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-gray-600 h-auto"
          aria-label="Open mobile menu"
        >
          <Menu size={24} />
        </Button>

        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[#111827] min-w-max"
        >
          <div className="bg-[#10B981] text-white p-1.5 rounded-lg">
            <ShoppingBag size={20} />
          </div>
          <span className="font-black text-xl tracking-tight hidden sm:inline">
            {storeName || "MARKETHUB"}
          </span>
        </Link>

        {/* Search Bar (Central Focus) */}
        <div className="flex-1 max-w-2xl relative group">
          <div className="flex">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products, brands and categories..."
                className="w-full bg-background/50 backdrop-blur-sm border border-gray-300 border-r-0 rounded-l-lg py-2.5 px-4 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:bg-transparent transition-all"
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
            <Button
              className="bg-[#111827] hover:bg-[#1F2937] text-white px-6 py-2.5 rounded-r-lg font-bold text-sm transition-colors h-auto"
              aria-label="Search"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 text-gray-600">
          <Link
            href="#"
            className="hidden md:flex flex-col items-center gap-0.5 hover:text-[#111827]"
          >
            <User size={20} />
            <span className="text-[10px] font-bold">Account</span>
          </Link>
          <Link
            href="#"
            className="hidden md:flex flex-col items-center gap-0.5 hover:text-[#111827]"
          >
            <Heart size={20} />
            <span className="text-[10px] font-bold">Wishlist</span>
          </Link>
          <Button
            variant="ghost"
            onClick={onOpenCart}
            className="flex flex-col items-center gap-0.5 hover:text-[#111827] relative h-auto"
            aria-label={`Open cart, ${cartCount} items`}
          >
            <div className="relative">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#10B981] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">Cart</span>
          </Button>
        </div>
      </div>

      {/* Categories Nav */}
      <nav className="border-t border-gray-100 py-3 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex gap-8 text-sm font-medium text-gray-600">
          <Link href="#" className="hover:text-[#10B981]">
            All Categories
          </Link>
          <Link href="#" className="hover:text-[#10B981]">
            Fashion
          </Link>
          <Link href="#" className="hover:text-[#10B981]">
            Electronics
          </Link>
          <Link href="#" className="hover:text-[#10B981]">
            Home & Garden
          </Link>
          <Link href="#" className="hover:text-[#10B981]">
            Beauty
          </Link>
          <Link href="#" className="hover:text-[#10B981]">
            Groceries
          </Link>
          <Link href="#" className="text-[#10B981] ml-auto font-bold">
            Daily Deals
          </Link>
        </div>
      </nav>
    </header>
  );
};
