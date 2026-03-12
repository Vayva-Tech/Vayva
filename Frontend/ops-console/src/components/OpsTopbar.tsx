"use client";

import React from "react";
import { MagnifyingGlass as Search, Bell, Check as MonitorCheck, X as MonitorX } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";

export function OpsTopbar(): React.JSX.Element {
  const isProd =
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Env Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${isProd ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}
        >
          {isProd ? <MonitorX size={14} /> : <MonitorCheck size={14} />}
          {isProd ? "PRODUCTION" : "STAGING"}
        </div>

        <div className="w-96 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search merchants, orders, disputes..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black relative"
          aria-label="View notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">
          AD
        </div>
      </div>
    </header>
  );
}
