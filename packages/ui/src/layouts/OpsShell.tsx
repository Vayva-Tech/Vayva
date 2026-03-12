import React from "react";
import { cn } from "../utils";

interface OpsShellProps {
  children: React.ReactNode;
  header: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
}

export function OpsShell({
  children,
  header,
  sidebar,
  className,
}: OpsShellProps) {
  return (
    <div className="flex min-h-screen bg-background-dark text-white">
      {/* High contrast sidebar for Ops */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl">
        {sidebar}
      </aside>

      <main className={cn("flex-1 pl-64", className)}>
        {/* Ops Header - distinct from Merchant */}
        <header className="sticky top-0 z-40 flex h-14 items-center border-b border-white/10 bg-black/40 px-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="rounded bg-red-900 px-2 py-0.5 text-xs font-bold text-red-200">
              INTERNAL
            </span>
            {header}
          </div>
        </header>

        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
