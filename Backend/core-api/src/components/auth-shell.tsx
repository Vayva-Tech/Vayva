"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@vayva/ui";

export const AuthShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Green Design Sidebar */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative bg-[#020817] flex-col overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Green Glow Top Right */}
          <div className="absolute -top-[20%] -right-[20%] w-[80%] h-[80%] rounded-full bg-primary opacity-20 blur-[120px]" />
          {/* Blue/Dark Bottom Left */}
          <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-900 opacity-20 blur-[100px]" />

          {/* Abstract Circle/orb placeholder if needed or just gradients */}
          <div className="absolute top-1/3 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-2xl opacity-30" />
        </div>

        {/* Logo Area */}
        <div className="relative z-20 p-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 flex items-center">
              <Image
                src="/vayva-logo-official.svg"
                alt="Vayva"
                width={217}
                height={150}
                priority
                className="w-10 h-auto"
              />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Vayva Merchant
            </span>
          </Link>
        </div>

        {/* Hero Card Content */}
        <div className="relative z-20 flex-1 flex flex-col justify-center px-12">
          <div className="bg-background/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-8 text-primary">
              <Icon name="Zap" size={24} fill="currentColor" />
            </div>

            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              Run your business on WhatsApp
            </h1>

            <p className="text-lg text-text-tertiary leading-relaxed mb-8">
              Transform chaotic conversations into organized orders, payments,
              and delivery tracking. The operating system for modern African
              commerce.
            </p>

            <div className="flex items-center gap-6 text-sm font-medium text-text-tertiary">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Real-time Sync
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/400" />
                Automated Invoices
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="relative z-20 p-8 text-xs text-text-secondary">
          © 2026 Vayva Inc.
        </div>
      </div>

      {/* Right Side - Form Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Logo */}
        <div className="lg:hidden p-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/vayva-logo-official.svg"
              alt="Vayva"
              width={217}
              height={150}
              className="w-9 h-auto"
            />
            <span className="text-black font-bold text-xl">Vayva Merchant</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-[440px] space-y-8">{children}</div>
        </div>

        <div className="p-6 text-center text-xs text-text-tertiary lg:hidden">
          © 2026 Vayva Inc.
        </div>
      </div>
    </div>
  );
};
