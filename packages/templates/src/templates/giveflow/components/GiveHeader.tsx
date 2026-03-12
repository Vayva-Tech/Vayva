import React from "react";
import { Heart, Globe, Menu, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@vayva/ui";
import { urls } from "@vayva/shared";

interface GiveHeaderProps {
  storeName?: string;
}

export const GiveHeader = ({ storeName }: GiveHeaderProps): React.JSX.Element => {
  return (
    <header className="sticky top-0 z-50 bg-transparent shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[#16A34A] hover:opacity-90 transition-opacity"
        >
          <div className="bg-[#16A34A] text-white p-2 rounded-full">
            <Heart size={20} fill="currentColor" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">
            {storeName || "GiveFlow"}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="#" className="hover:text-[#16A34A] transition-colors">
            Explore Campaigns
          </Link>
          <Link href="#" className="hover:text-[#16A34A] transition-colors">
            How it Works
          </Link>
          <Link href="#" className="hover:text-[#16A34A] transition-colors">
            Success Stories
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900 md:block hidden h-auto" aria-label="Search">
            <Search size={20} />
          </Button>
          <Link
            href={`${urls.merchantBase()}/login`}
            className="hidden sm:inline-block text-sm font-bold text-gray-900 hover:text-[#16A34A]"
          >
            Sign In
          </Link>
          <Link
            href="#"
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-2.5 px-6 rounded-full text-sm transition-all shadow-lg shadow-green-100"
          >
            Start Fundraising
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden text-gray-600 h-auto" aria-label="Open mobile menu">
            <Menu size={24} />
          </Button>
        </div>
      </div>
    </header>
  );
};
