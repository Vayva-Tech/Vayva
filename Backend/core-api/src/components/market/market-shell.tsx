"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@vayva/ui";

import {
  MagnifyingGlass as Search,
  MapPin,
  CaretDown as ChevronDown,
  ShoppingCart,
  User,
  Globe,
  Camera,
} from "@phosphor-icons/react/ssr";

interface MarketShellProps {
  children: React.ReactNode;
}

export function MarketShell({ children }: MarketShellProps) {
  return (
    <div className="min-h-screen bg-background/40 backdrop-blur-[2px] text-white font-sans selection:bg-primary/30">
      {/* Sticky Marketplace Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 h-18 flex items-center justify-between gap-6 py-3">
          {/* Left: Brand */}
          <Link href="/market" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-black font-bold text-xl shadow-[0_0_15px_rgba(70,236,19,0.3)]">
              V
            </div>
            <span className="font-bold text-xl hidden md:block tracking-tight">
              Market
            </span>
          </Link>

          {/* Center: Global Search */}
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-white/40" size={20} />
            </div>
            <input
              className="w-full h-11 bg-background/5 border border-white/10 rounded-full pl-11 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-background/10 transition-all placeholder:text-white/30"
              type="search"
              aria-label="Search for products, brands and categories"
              placeholder="Search for products, brands and categories..."
            />
            <Button className="absolute right-2 top-1.5 h-8 px-4 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-full transition-colors">
              Search
            </Button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              aria-label="Open search"
              title="Search"
            >
              <Search />
            </Button>

            <div className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-background/5 border border-white/5 cursor-pointer hover:bg-background/10 transition-colors">
              <MapPin size={16} className="text-primary" />
              <span className="text-xs font-medium text-white/90">Lagos</span>
              <ChevronDown size={16} className="text-white/50" />
            </div>

            <Link href="/market/cart">
              <Button
                variant="ghost"
                size="icon"
                className="text-white relative hover:bg-background/5"
                aria-label="Cart"
                title="Cart"
              >
                <ShoppingCart />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-[#142210]" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hidden sm:flex hover:bg-background/5"
              aria-label="Account"
              title="Account"
            >
              <User size={24} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-400px)]">{children}</main>

      {/* Marketplace Footer */}
      <footer className="border-t border-white/5 bg-[#0b141a] mt-20 pt-16 pb-8">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-background/10 flex items-center justify-center text-white font-bold">
                  V
                </div>
                <span className="font-bold text-xl text-white">
                  Vayva Market
                </span>
              </div>
              <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">
                The most trusted marketplace for premium products in Nigeria.
                Shop directly from verified sellers with confidence.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-background/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-background/10 cursor-pointer transition-colors">
                  <Globe size={20} />
                </div>
                <div className="w-10 h-10 rounded-full bg-background/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-background/10 cursor-pointer transition-colors">
                  <Camera size={20} />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">
                Shop
              </h4>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li>
                  <Link
                    href="/market/categories/all"
                    className="hover:text-primary transition-colors"
                  >
                    All Categories
                  </Link>
                </li>
                <li>
                  <Link
                    href="/market/search?sort=trending"
                    className="hover:text-primary transition-colors"
                  >
                    Trending Now
                  </Link>
                </li>
                <li>
                  <Link
                    href="/market/sellers"
                    className="hover:text-primary transition-colors"
                  >
                    Featured Sellers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">
                Support
              </h4>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li>
                  <Link
                    href="/support?topic=Help%20Center"
                    className="hover:text-primary transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support?topic=Report%20Portal"
                    className="hover:text-primary transition-colors"
                  >
                    Report a Listing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support?topic=Buyer%20Protection"
                    className="hover:text-primary transition-colors"
                  >
                    Buyer Protection
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">
                Policies
              </h4>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li>
                  <Link
                    href="/legal/privacy"
                    className="hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/terms"
                    className="hover:text-primary transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/returns"
                    className="hover:text-primary transition-colors"
                  >
                    Return Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-text-secondary">
            <p>
              &copy; {new Date().getFullYear()} Vayva Market. All orders
              fulfilled by independent sellers.
            </p>
            <p>Secured by Paystack</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
