import React from "react";
import { DownloadSimple as Download, MagnifyingGlass as Search, ShoppingCart, User } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { Button } from "@vayva/ui";
import { urls } from "@vayva/shared";

interface DigitalHeaderProps {
  storeName?: string;
}

export const DigitalHeader = ({
  storeName = "CREATOR HUB",
}: DigitalHeaderProps) => {
  const { cart } = useStore();
  const cartCount = cart.reduce((acc: any, item: any) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19] border-b border-gray-800 text-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white">
            <Download size={18} strokeWidth={3} />
          </div>
          <span className="font-bold text-xl tracking-tight group-hover:text-white transition-colors">
            {storeName}
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link href="#" className="hover:text-indigo-400 transition-colors">
            Templates
          </Link>
          <Link href="#" className="hover:text-indigo-400 transition-colors">
            UI Kits
          </Link>
          <Link href="#" className="hover:text-indigo-400 transition-colors">
            E-books
          </Link>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors h-auto"
            aria-label="Search"
          >
            <Search size={20} />
          </Button>
          <Link
            href="/cart"
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors relative"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-indigo-500 rounded-full"></span>
            )}
          </Link>
          <Link
            href={`${urls.merchantBase()}/login`}
            className="hidden sm:flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors ml-2"
            aria-label="Sign in"
          >
            <User size={16} />
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
