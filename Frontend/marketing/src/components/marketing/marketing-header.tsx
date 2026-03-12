
"use client";

import React, { useState } from "react";
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
  IconBuildingStore as Store,
  IconRocket as Rocket,
  IconBed as Bed,
  IconCar as Car,
  IconSchool as GraduationCap,
  IconHome as Home,
  IconNews as Newspaper,
  IconPackage as Package,
  IconPackage as Warehouse,
  IconPalette as Palette,
  IconConfetti as PartyPopper,
  IconTicket as Ticket,
  IconBuilding as Building2,
  IconUsers as Users,
  IconBriefcase as Briefcase,
  IconLifebuoy as LifeBuoy,
  IconFileText as FileText,
  IconShoppingBag as ShoppingBag,
  IconHanger as Shirt,
  IconToolsKitchen2 as UtensilsCrossed,
  IconHeart as Heart,
  IconDeviceMobile as Smartphone,
  IconShoppingCart as ShoppingCart,
  IconCoffee as Coffee
} from "@tabler/icons-react";

// Navigation structure with dropdowns
const NAV_ITEMS = [
  {
    label: "Product",
    href: "/features",
    items: [
      { href: "/features", label: "Features", icon: Sparkles, description: "Powerful tools for your business" },
      { href: "/autopilot", label: "Autopilot", icon: Rocket, description: "AI-powered automation" },
      { href: "/ai-agent", label: "AI Agent", icon: Sparkles, description: "Your intelligent assistant" },
      { href: "/store-builder", label: "Store Builder", icon: Building2, description: "Create your online store" },
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
    label: "Company",
    href: "/about",
    items: [
      { href: "/about", label: "About Us", icon: Building2, description: "Our story & mission" },
      { href: "/team", label: "Team", icon: Users, description: "Meet the people behind Vayva" },
      { href: "/trust", label: "Trust & Security", icon: Sparkles, description: "Your data is safe with us" },
      { href: "/system-status", label: "System Status", icon: Smartphone, description: "Platform availability" },
      { href: "/contact", label: "Contact", icon: LifeBuoy, description: "Get in touch" },
    ]
  },
  {
    label: "Resources",
    href: "/help",
    items: [
      { href: "/help", label: "Help Center", icon: LifeBuoy, description: "Guides & tutorials" },
      { href: "/how-vayva-works", label: "How It Works", icon: Sparkles, description: "Learn the basics" },
      { href: "/legal", label: "Legal", icon: FileText, description: "Terms & policies" },
    ]
  },
];

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/help", label: "Help" },
];

export function MarketingHeader(): React.JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-transparent backdrop-blur">
      <div className="max-w-[1600px] mx-auto h-16 md:h-[72px] flex items-center justify-between px-6">
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
                <button
                  onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors rounded-lg hover:bg-emerald-50"
                >
                  {item.label}
                  <ChevronDown 
                    size={14} 
                    className={`transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`}
                  />
                </button>
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
                <div className="absolute top-full left-0 w-72 bg-white shadow-2xl rounded-2xl py-3 border border-slate-200 animate-in fade-in slide-in-from-top-1 duration-200 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                  {item.items.map((subItem) => {
                    const Icon = subItem.icon;
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-emerald-50/60 transition-colors group"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="p-2 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                          <Icon size={18} className="text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-foreground group-hover:text-emerald-700 transition-colors">
                            {subItem.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {subItem.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
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
            className="lg:hidden p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-4 right-4 mt-2 bg-white shadow-2xl py-6 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200 rounded-2xl border border-slate-200 max-h-[80vh] overflow-y-auto">
          {NAV_ITEMS.map((section) => (
            <div key={section.label} className="flex flex-col gap-2">
              {section.items ? (
                <>
                  <div className="px-4 py-2 bg-emerald-50 rounded-xl">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      {section.label}
                    </span>
                  </div>
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
      <a href={`${process.env.NEXT_PUBLIC_APP_URL}/signin`} className="flex-1 sm:flex-none">
        <Button
          variant="ghost"
          className="w-full sm:w-auto text-text-primary hover:bg-emerald-50"
        >
          Login
        </Button>
      </a>
      <a href={`${process.env.NEXT_PUBLIC_APP_URL}/signup`} className="flex-1 sm:flex-none">
        <Button className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-text-inverse shadow-card stroke-glow">
          Get Started
        </Button>
      </a>
    </div>
  );
}
