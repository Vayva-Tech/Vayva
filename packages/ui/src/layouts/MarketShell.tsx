"use client";

import React from "react";
import { cn } from "../utils";

interface MarketShellProps {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  className?: string;
}

export function MarketShell({
  children,
  header,
  footer,
  className,
}: MarketShellProps) {
  // Marketplace uses same core theme but might have wider container or different nav structure
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center">
          {header}
        </div>
      </header>

      <main className={cn("flex-1 py-8", className)}>
        <div className="container mx-auto px-4">{children}</div>
      </main>

      <footer className="border-t border-white/10 bg-black/40">
        <div className="container mx-auto py-10 px-4 text-gray-400">
          {footer}
        </div>
      </footer>
    </div>
  );
}
