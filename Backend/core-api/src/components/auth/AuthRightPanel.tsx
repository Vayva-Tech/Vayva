"use client";

import React from "react";
import Link from "next/link";

interface AuthRightPanelProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthRightPanel = ({
  children,

  title,
  subtitle,
}: AuthRightPanelProps) => {
  return (
    <div className="flex-1 lg:w-[60%] bg-transparent flex flex-col min-h-0">
      {/* Top bar with help link only */}
      <div className="h-14 px-6 lg:px-10 flex items-center justify-end border-b border-border/20">
        <Link
          href="/help"
          className="text-sm text-text-secondary hover:text-black font-medium transition-colors"
        >
          Having trouble? Get help
        </Link>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-start lg:items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-[440px]">
            {/* Title */}
            <h1 className="text-3xl font-bold text-text-primary mb-2 leading-tight">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-base text-text-secondary mb-6">{subtitle}</p>
            )}

            {/* Form content */}
            <div>{children}</div>

            {/* Simple Footer Links - Centered under the form */}
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-text-tertiary">
              <Link
                href="/legal/terms"
                className="hover:text-text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <span>•</span>
              <Link
                href="/legal/privacy"
                className="hover:text-text-primary transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
