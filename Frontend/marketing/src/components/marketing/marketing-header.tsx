
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@vayva/ui";
import { APP_URL } from "@/lib/constants";
import { useUserPlan } from "@/hooks/useUserPlan";
import { Logo } from "@/components/Logo";
import {
  IconChevronDown as ChevronDown,
  IconMenu2 as Menu,
  IconX as X,
  IconSparkles as Sparkles,
  IconRocket as Rocket,
  IconBuilding as Building2,
  IconLifebuoy as LifeBuoy,
  IconFileText as FileText,
  IconDeviceMobile as Smartphone,
} from "@tabler/icons-react";

// Navigation structure with dropdowns
const NAV_ITEMS = [
  {
    label: "Product",
    href: "/autopilot",
    items: [
      { href: "/autopilot", label: "Autopilot", icon: Rocket, description: "AI-powered automation" },
      { href: "/ai-agent", label: "AI Agent", icon: Sparkles, description: "Your intelligent assistant" },
    ]
  },
  {
    label: "Pricing",
    href: "/pricing",
    // Simple link - no dropdown
  },
  {
    label: "Industries",
    href: "/industries",
    // Simple link - no dropdown
  },
  {
    label: "Help",
    href: "/help",
    // Simple link — always reachable (no dropdown hover gap)
  },
  {
    label: "Company",
    href: "/about",
    items: [
      { href: "/about", label: "About Us", icon: Building2, description: "Our story & mission" },
      { href: "/trust", label: "Trust & Security", icon: Sparkles, description: "Your data is safe with us" },
      { href: "/system-status", label: "System Status", icon: Smartphone, description: "Platform availability" },
      { href: "/contact", label: "Contact", icon: LifeBuoy, description: "Get in touch" },
    ]
  },
  {
    label: "Legal",
    href: "/legal",
    items: [
      { href: "/legal", label: "Legal hub", icon: FileText, description: "All policies in one place" },
      { href: "/legal/terms", label: "Terms of Service", icon: FileText, description: "Platform terms of use" },
      { href: "/legal/privacy", label: "Privacy Policy", icon: FileText, description: "How we handle your data" },
      { href: "/legal/cookies", label: "Cookie Policy", icon: FileText, description: "Cookies & preferences" },
    ]
  },
];

export function MarketingHeader(): React.JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
    return;
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/40 bg-white/30 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto h-16 md:h-[72px] flex items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Logo href="/" size="sm" showText={true} />

        {/* Desktop Nav with Dropdowns */}
        <nav className="hidden lg:flex items-center gap-2">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className="relative pt-2"
              onMouseEnter={() => item.items && setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {item.items ? (
                <Link
                  href={item.href}
                  onClick={() => setActiveDropdown(null)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors rounded-lg hover:bg-emerald-50"
                >
                  {item.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`}
                  />
                </Link>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors rounded-lg hover:bg-emerald-50"
                >
                  {item.label}
                </Link>
              )}

              {/* Dropdown Menu - only render if items exist */}
              {item.items && activeDropdown === item.label && (
                <div className="absolute left-0 top-full z-50 pt-2 -mt-2 min-w-[288px]">
                  <div className="w-72 rounded-2xl border border-slate-200/50 bg-white/90 py-3 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="mb-2 border-b border-slate-200/40 px-4 py-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                        {item.label}
                      </span>
                    </div>
                    {item.items.map((subItem) => {
                      const Icon = subItem.icon;
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-emerald-50/60"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <div className="rounded-xl bg-emerald-100/80 p-2 transition-colors group-hover:bg-emerald-200/80">
                            <Icon size={18} className="text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground transition-colors group-hover:text-emerald-700">
                              {subItem.label}
                            </div>
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              {subItem.description}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* CTA Buttons & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <HeaderActions />
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            className="lg:hidden p-2 rounded-lg bg-transparent text-emerald-700 hover:text-emerald-800 hover:bg-transparent transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="marketing-mobile-nav"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            id="marketing-mobile-nav"
            className="absolute top-[calc(env(safe-area-inset-top,0px)+0.75rem)] left-3 right-3 sm:left-4 sm:right-4 bg-white shadow-2xl py-6 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200 rounded-2xl border border-slate-200/60 max-h-[80vh] overflow-y-auto"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {NAV_ITEMS.map((section) => (
              <div key={section.label} className="flex flex-col gap-2">
                {section.items ? (
                  <>
                    <div className="px-4 py-2 bg-emerald-50 rounded-xl">
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                        {section.label}
                      </span>
                    </div>
                    <Link
                      href={section.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 text-sm font-semibold text-emerald-800 hover:text-emerald-900"
                    >
                      {section.label} overview →
                    </Link>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 px-4 py-3 rounded-xl transition-all"
                        >
                          <Icon size={20} className="text-emerald-600" />
                          <span className="font-semibold">{item.label}</span>
                        </Link>
                      );
                    })}
                  </>
                ) : (
                  <Link
                    href={section.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 px-4 py-3 rounded-xl transition-all font-semibold"
                  >
                    {section.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="h-px bg-emerald-100 my-2" />
            <div className="flex flex-col gap-3 px-2">
              <div
                className="flex justify-center w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HeaderActions />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function HeaderActions(): React.JSX.Element {
  const { plan, loading } = useUserPlan();

  if (loading) {
    return (
      <div className="flex items-center gap-4 animate-pulse">
        <div className="h-10 w-20 bg-emerald-100 rounded-lg hidden sm:block"></div>
        <div className="h-10 w-32 bg-emerald-100 rounded-lg"></div>
      </div>
    );
  }

  if (plan) {
    return (
      <a href={`${APP_URL}/dashboard`} className="w-full sm:w-auto">
        <Button className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-text-inverse font-semibold shadow-card stroke-glow">
          Go to Dashboard
        </Button>
      </a>
    );
  }

  return (
    <div className="flex w-full sm:w-auto items-center gap-3">
      <a href={`${APP_URL}/signin`} className="flex-1 sm:flex-none">
        <Button
          variant="ghost"
          className="w-full sm:w-auto text-text-primary hover:bg-emerald-50"
        >
          Sign In
        </Button>
      </a>
      <a href={`${APP_URL}/signup`} className="flex-1 sm:flex-none">
        <Button className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-text-inverse shadow-card stroke-glow">
          Start Free Trial
        </Button>
      </a>
    </div>
  );
}
