"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass as Search, MapPin } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";

export const HeroSearch = (): React.JSX.Element => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"buy" | "rent" | "shortlet">(
    "rent",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const params = new URLSearchParams({
      q: searchQuery.trim(),
      type: activeTab,
    });
    router.push(`/search?${params.toString()}`);
    setIsSearching(false);
  };

  const handleQuickSearch = (location: string) => {
    setSearchQuery(location);
    const params = new URLSearchParams({
      q: location,
      type: activeTab,
    });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative h-[500px] w-full bg-[#0F172A] flex flex-col items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80')] bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 bg-[#0F172A]/70 backdrop-blur-[1px]"></div>

      <div className="relative z-10 w-full max-w-4xl text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-sm">
          Find a place you&apos;ll love <br /> to live.
        </h1>

        {/* Tabs */}
        <div className="inline-flex bg-transparent/20 backdrop-blur-md p-1 rounded-t-xl overflow-hidden">
          {(["buy", "rent", "shortlet"] as const).map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 text-sm font-bold capitalize transition-all h-auto ${activeTab === tab ? "bg-white text-[#0F172A] rounded-t-lg" : "text-white hover:bg-transparent/10"}`}
              aria-label={`Search for properties to ${tab}`}
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-sm p-4 rounded-b-xl rounded-r-xl shadow-2xl flex flex-col md:flex-row gap-4 items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex-1 w-full relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <MapPin size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="City, neighborhood, address, or school..."
              className="w-full pl-12 pr-4 py-4 bg-background/40 backdrop-blur-sm border border-transparent hover:bg-transparent hover:border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-medium transition-all"
              aria-label="Search location"
            />
          </div>

          <Button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="w-full md:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200 h-auto disabled:opacity-50"
            aria-label="Search properties"
          >
            <Search size={20} />
            <span>{isSearching ? "Searching..." : "Search"}</span>
          </Button>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-3 text-white/80 text-xs font-medium">
          <span>Popular:</span>
          {["Lekki Phase 1", "Ikoyi", "Banana Island", "Victoria Island"].map(
            (location) => (
              <Button
                key={location}
                variant="link"
                onClick={() => handleQuickSearch(location)}
                className="text-white hover:text-white hover:underline h-auto p-0 font-medium text-xs"
                aria-label={`Search ${location}`}
              >
                {location}
              </Button>
            ),
          )}
        </div>
      </div>
    </section>
  );
};
