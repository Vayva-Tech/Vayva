"use client";

import React from "react";
import { Logo } from "@/components/Logo";
import { AuthLeftPanel } from "./AuthLeftPanel";
import { AuthRightPanel } from "./AuthRightPanel";

type AuthLeftPanelVariant = "signin" | "signup" | "support";

interface SplitAuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  leftVariant?: AuthLeftPanelVariant;
}

export const SplitAuthLayout = ({
  children,
  title,
  subtitle,
  leftVariant = "support",
}: SplitAuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
      {/* Left Panel - Hidden on mobile, shows as sidebar on desktop */}
      <AuthLeftPanel variant={leftVariant} />

      {/* Mobile header - Only visible on mobile */}
      <div className="lg:hidden bg-background/60 backdrop-blur-md p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Logo size="md" showText={false} />
          <span className="font-bold text-2xl tracking-tight text-black">
            Merchant
          </span>
        </div>
      </div>

      {/* Right Panel - Form area */}
      <AuthRightPanel title={title} subtitle={subtitle}>
        {children}
      </AuthRightPanel>
    </div>
  );
};
