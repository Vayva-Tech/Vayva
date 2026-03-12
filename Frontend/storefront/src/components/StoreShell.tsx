"use client";

import React from "react";
import { Button } from "@vayva/ui";
import NextLink from "next/link";
const Link = NextLink;
import { useStore } from "@/context/StoreContext";
import { ShoppingBag as ShoppingBagIcon, List as MenuIcon, MagnifyingGlass as SearchIcon, User as UserIcon } from "@phosphor-icons/react/ssr";
const ShoppingBag = ShoppingBagIcon;
const Menu = MenuIcon;
const Search = SearchIcon;
const User = UserIcon;
import { useParams } from "next/navigation";

import { FlashSaleBanner } from "@/components/FlashSaleBanner";
import { VayvaLogo } from "./VayvaLogo";

export function StoreShell({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { store, isLoading, error } = useStore();
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const params = useParams();
  const lang = (params.lang as string) || "tr";

  // Initial Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Error / No Store State
  if (error || !store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
        <p className="text-gray-500 mb-6">
          The store you are looking for does not exist or is currently
          unavailable.
        </p>
        <div className="text-sm text-gray-400">
          If you are the owner, please check your settings.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Flash Sale Banner */}
      {store?.id && <FlashSaleBanner storeId={store.id} />}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full h-auto"
              onClick={() => {}} // setMobileMenuOpen(true)
              aria-label="Toggle mobile menu"
            >
              <Menu size={20} />
            </Button>

            <Link
              href={`/?store=${store?.slug}`}
              className="flex items-center gap-2"
            >
              {/* Logo Placeholder */}
              <div className="w-8 h-8 bg-black text-white rounded flex items-center justify-center font-bold text-lg">
                {store?.name?.charAt(0)}
              </div>
              <span className="font-bold text-lg tracking-tight hidden sm:block">
                {store?.name}
              </span>
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Primary store navigation"
          >
            <Link
              href={`/?store=${store?.slug}`}
              className="text-sm font-medium hover:text-gray-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href={`/products?store=${store?.slug}`}
              className="text-sm font-medium hover:text-gray-600 transition-colors"
            >
              Shop
            </Link>
            <Link
              href={`/pages/about?store=${store?.slug}`}
              className="text-sm font-medium hover:text-gray-600 transition-colors"
            >
              About
            </Link>
            <Link
              href={`/pages/contact?store=${store?.slug}`}
              className="text-sm font-medium hover:text-gray-600 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Right: Search, Account & Cart */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="p-2 hover:bg-gray-100 rounded-full h-auto"
              aria-label="Search"
            >
              <Search size={20} />
            </Button>
            <Link href={`/${lang}/account`}>
              <Button
                variant="ghost"
                size="icon"
                className="p-2 hover:bg-gray-100 rounded-full h-auto"
                aria-label="Account"
              >
                <User size={20} />
              </Button>
            </Link>
            <Link href={`/cart?store=${store?.slug}`}>
              <Button
                variant="ghost"
                size="icon"
                className="p-2 hover:bg-gray-100 rounded-full relative h-auto"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-background/60 backdrop-blur-xl border-t border-border/40 pt-16 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-black text-white rounded flex items-center justify-center font-bold text-lg">
                  {store?.name?.charAt(0)}
                </div>
                <span className="font-bold text-lg tracking-tight">
                  {store?.name}
                </span>
              </div>
              <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
                {store?.tagline || "Premium quality goods."}
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <Link
                    href={`/collections/new?store=${store?.slug}`}
                    className="hover:text-black"
                  >
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/collections/bestsellers?store=${store?.slug}`}
                    className="hover:text-black"
                  >
                    Bestsellers
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/collections/all?store=${store?.slug}`}
                    className="hover:text-black"
                  >
                    All Products
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Customer Care</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <Link
                    href={`/policies/shipping?store=${store?.slug}`}
                    className="hover:text-black"
                  >
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/policies/returns?store=${store?.slug}`}
                    className="hover:text-black"
                  >
                    Returns & Exchange
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/policies/privacy?store=${store?.slug}`}
                    className="hover:text-black"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/policies/terms?store=${store?.slug}`}
                    className="hover:text-black"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/contact?store=${store?.slug}`}
                    className="hover:text-black"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
            <p>
              © {new Date().getFullYear()} {store?.name}. All rights reserved.
            </p>
            {store?.plan !== "PRO" && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Powered by</span>
                <div className="opacity-40 hover:opacity-100 transition-opacity">
                  <VayvaLogo variant="official" width={64} height={20} />
                </div>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
