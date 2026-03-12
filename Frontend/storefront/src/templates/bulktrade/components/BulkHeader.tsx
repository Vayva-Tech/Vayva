import React from "react";
import { Truck, MagnifyingGlass as Search, User, FileText } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { Button } from "@vayva/ui";

interface BulkHeaderProps {
  storeName?: string;
  rfqCount?: number;
  onOpenRFQ: () => void;
}

export const BulkHeader = ({
  storeName,
  rfqCount = 0,
  onOpenRFQ,
}: BulkHeaderProps) => {
  return (
    <header className="bg-transparent border-b border-gray-200 sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-[#0F172A] text-gray-300 text-xs py-2 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-6">
            <span>Global Shipping Available</span>
            <span>Bulk Discounts: Save up to 25%</span>
          </div>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white">
              Track Order
            </Link>
            <Link href="#" className="hover:text-white">
              Support
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 text-[#0F172A] min-w-max"
        >
          <div className="bg-[#0F172A] text-white p-2 rounded">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="font-black text-xl leading-none tracking-tight">
              {storeName?.toUpperCase() || "BULKTRADE"}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
              Wholesale Direct
            </p>
          </div>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-2xl relative hidden md:block">
          <input
            type="text"
            placeholder="Search by SKU, Product Name or Category..."
            className="w-full bg-background/50 backdrop-blur-sm border border-gray-200 rounded-lg py-3 px-4 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:bg-transparent transition-all"
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#0F172A] px-3 py-2 rounded-lg transition-colors h-auto"
            aria-label="Account"
          >
            <User size={18} /> Account
          </Button>

          <Button
            onClick={onOpenRFQ}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-lg transition-colors shadow-sm relative group h-auto"
            aria-label={`Request quote${rfqCount > 0 ? `, ${rfqCount} items` : ""}`}
          >
            <FileText size={18} />
            <span>Request Quote</span>
            {rfqCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {rfqCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
