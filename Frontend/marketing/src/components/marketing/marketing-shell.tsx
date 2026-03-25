import React from "react";
import { ScrollToTop } from "./ScrollToTop";

interface MarketingShellProps {
  children: React.ReactNode;
  className?: string;
}

export function MarketingShell({
  children,
  className = "",
}: MarketingShellProps): React.JSX.Element {
  return (
    <div
      className={`min-h-screen overflow-x-hidden font-sans text-text-primary bg-emerald-blur ${className}`}
    >
      <div className="relative w-full min-w-0">{children}</div>
      <ScrollToTop />
    </div>
  );
}
