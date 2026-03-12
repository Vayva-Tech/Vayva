import React from "react";
import { cn } from "../utils";

interface StorefrontShellProps {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  className?: string;
}

export function StorefrontShell({
  children,
  header,
  footer,
  className,
}: StorefrontShellProps) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center">
          {header}
        </div>
      </header>

      <main className={cn("flex-1", className)}>{children}</main>

      <footer className="border-t border-white/10 bg-black/40">
        <div className="container mx-auto py-10 px-4 text-gray-400">
          {footer}
        </div>
      </footer>
    </div>
  );
}
