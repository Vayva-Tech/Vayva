import React from "react";
import { cn } from "../utils";

interface AppShellProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
  className?: string;
}

export function AppShell({
  children,
  sidebar,
  header,
  className,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background-dark text-white">
      {/* Fixed Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl">
        {sidebar}
      </aside>

      {/* Main Content Area */}
      <main className={cn("flex-1 pl-64", className)}>
        {/* Fixed Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center border-b border-white/10 bg-black/40 px-6 backdrop-blur-xl">
          {header}
        </header>

        {/* Scrollable Content */}
        <div className="p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
