"use client";

import React from "react";
import Link from "next/link";

interface AuthRightPanelProps {
  children: React.ReactNode;
  stepIndicator?: string;
  title: string;
  subtitle?: string;
}

export const AuthRightPanel = ({
  children,
  stepIndicator,
  title,
  subtitle,
}: AuthRightPanelProps) => {
  return (
    <div
      className="flex-1 lg:w-[60%] flex flex-col min-h-0 crm-canvas"
    >
      {/* Top bar with help link only */}
      <div className="h-14 px-6 lg:px-10 flex items-center justify-end border-b border-green-200/30">
        <Link
          href="/help"
          className="text-sm text-gray-500 hover:text-black font-medium transition-colors"
        >
          Having trouble? Get help
        </Link>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-start lg:items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-[440px]">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-base text-gray-500 mb-6">{subtitle}</p>
            )}

            {/* Form content */}
            <div>{children}</div>

            {/* Simple Footer Links - Centered under the form */}
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-400">
              <Link
                href="/legal/terms"
                className="hover:text-gray-900 transition-colors"
              >
                Terms of Service
              </Link>
              <span>•</span>
              <Link
                href="/legal/privacy"
                className="hover:text-gray-900 transition-colors"
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
