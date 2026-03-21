"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AuthLeftPanel } from "./AuthLeftPanel";
import { AuthRightPanel } from "./AuthRightPanel";

type AuthLeftPanelVariant = "signin" | "signup" | "support";

interface SplitAuthLayoutProps {
  children: React.ReactNode;
  stepIndicator?: string;
  title: string;
  subtitle?: string;
  showSignInLink?: boolean;
  showSignUpLink?: boolean;
  leftVariant?: AuthLeftPanelVariant;
}

export const SplitAuthLayout = ({
  children,
  stepIndicator = "",
  title,
  subtitle,
  showSignInLink = false,
  showSignUpLink = false,
  leftVariant = "support",
}: SplitAuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
      {/* Left Panel - Hidden on mobile, shows as sidebar on desktop */}
      <AuthLeftPanel
        showSignInLink={showSignInLink}
        showSignUpLink={showSignUpLink}
        variant={leftVariant}
      />

      {/* Mobile header - Only visible on mobile */}
      <div className="lg:hidden bg-white  p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <Logo size="md" showText={false} disableLink />
          <span className="font-bold text-2xl tracking-tight text-black">
            Merchant
          </span>
        </Link>
      </div>

      {/* Right Panel - Form area */}
      <AuthRightPanel
        stepIndicator={stepIndicator || ""}
        title={title}
        subtitle={subtitle}
      >
        {children}
      </AuthRightPanel>
    </div>
  );
};
