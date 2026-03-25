"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { APP_URL } from "@/lib/constants";
import {
  IconBrandX as Twitter,
  IconBrandLinkedin as Linkedin,
  IconBrandInstagram as Instagram,
  IconGift as Gift,
  IconChevronDown as ChevronDown,
} from "@tabler/icons-react";

const PRODUCT_LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "All features", href: "/all-features" },
  { label: "Industries", href: "/industries" },
];

const PRODUCT_LINKS_DESKTOP = [
  ...PRODUCT_LINKS,
  { label: "AI Agent", href: "/ai-agent" },
  { label: "Autopilot", href: "/autopilot" },
];

const COMPANY_LINKS = [
  { label: "About Vayva", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Trust & security", href: "/trust" },
  { label: "System status", href: "/system-status" },
];

const COMPANY_LINKS_MOBILE = COMPANY_LINKS.filter(
  (l) => l.href !== "/system-status",
);

const RESOURCE_LINKS = [
  { label: "Help Center", href: "/help" },
  { label: "Getting started", href: "/help/getting-started" },
  { label: "Merchant sign in", href: `${APP_URL}/signin` },
];

const LEGAL_ESSENTIAL = [
  { label: "Legal hub", href: "/legal" },
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
];

const LEGAL_MORE = [
  { label: "Cookies", href: "/legal/cookies" },
  { label: "Refunds", href: "/legal/refund-policy" },
  { label: "Acceptable use", href: "/legal/acceptable-use" },
  { label: "Data processing", href: "/legal/dpa" },
  { label: "KYC & safety", href: "/legal/kyc-safety" },
];

function FooterLinkList({
  links,
  className = "",
}: {
  links: { label: string; href: string }[];
  className?: string;
}): React.JSX.Element {
  return (
    <ul className={`space-y-3 ${className}`}>
      {links.map((link) => (
        <li key={link.label}>
          <Link
            href={link.href}
            className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function MarketingFooter(): React.JSX.Element {
  return (
    <footer className="border-t border-slate-200/40 bg-white/80 backdrop-blur-xl w-full min-w-0">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full min-w-0">
        {/* Mobile: compact intro + accordions */}
        <div className="md:hidden space-y-2 w-full">
          <Logo href="/" size="sm" showText text="Vayva" className="min-w-0" />
          <p className="text-base text-slate-600 leading-relaxed pt-2">
            Run orders, payments, and deliveries in one place — built for growing
            businesses.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/contact"
              className="text-base font-semibold text-emerald-700"
            >
              Talk to sales →
            </Link>
            <Link href="/pricing" className="text-base font-medium text-slate-700">
              View pricing
            </Link>
          </div>

          <details className="group border-b border-slate-200/80 py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold uppercase tracking-wider text-slate-800 [&::-webkit-details-marker]:hidden">
              Product
              <ChevronDown
                className="h-4 w-4 text-slate-400 transition group-open:rotate-180 shrink-0"
                aria-hidden
              />
            </summary>
            <FooterLinkList links={PRODUCT_LINKS} className="pb-4 pt-1" />
          </details>

          <details className="group border-b border-slate-200/80 py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold uppercase tracking-wider text-slate-800 [&::-webkit-details-marker]:hidden">
              Company
              <ChevronDown
                className="h-4 w-4 text-slate-400 transition group-open:rotate-180 shrink-0"
                aria-hidden
              />
            </summary>
            <FooterLinkList links={COMPANY_LINKS_MOBILE} className="pb-4 pt-1" />
          </details>

          <details className="group border-b border-slate-200/80 py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold uppercase tracking-wider text-slate-800 [&::-webkit-details-marker]:hidden">
              Resources
              <ChevronDown
                className="h-4 w-4 text-slate-400 transition group-open:rotate-180 shrink-0"
                aria-hidden
              />
            </summary>
            <FooterLinkList links={RESOURCE_LINKS} className="pb-4 pt-1" />
          </details>

          <details className="group border-b border-slate-200/80 py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold uppercase tracking-wider text-slate-800 [&::-webkit-details-marker]:hidden">
              Legal
              <ChevronDown
                className="h-4 w-4 text-slate-400 transition group-open:rotate-180 shrink-0"
                aria-hidden
              />
            </summary>
            <div className="pb-4 pt-1 space-y-4">
              <FooterLinkList links={LEGAL_ESSENTIAL} />
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                More policies
              </p>
              <FooterLinkList links={LEGAL_MORE} />
            </div>
          </details>
        </div>

        {/* Desktop */}
        <div className="hidden md:grid md:grid-cols-[1.1fr_1fr_1fr_1fr_1fr] gap-8">
          <div className="space-y-4 min-w-0">
            <Logo href="/" size="sm" showText={true} text="Vayva" />
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
              The business operating system that runs your business smoothly. From
              anywhere in the world, manage orders, payments, inventory, and
              deliveries in one unified platform.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Talk to sales →
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                View pricing
              </Link>
            </div>
          </div>

          <div className="space-y-6 min-w-0">
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Product
            </h4>
            <FooterLinkList links={PRODUCT_LINKS_DESKTOP} />
          </div>

          <div className="space-y-6 min-w-0">
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Company
            </h4>
            <FooterLinkList links={COMPANY_LINKS} />
          </div>

          <div className="space-y-6 min-w-0">
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Resources
            </h4>
            <FooterLinkList links={RESOURCE_LINKS} />
          </div>

          <div className="space-y-6 min-w-0">
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Legal
            </h4>
            <FooterLinkList links={[...LEGAL_ESSENTIAL, ...LEGAL_MORE]} />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/40 py-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full min-w-0">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 text-center sm:text-left">
            © {new Date().getFullYear()} Vayva Tech
          </p>

          <Link
            href="/contact"
            className="flex items-center justify-center gap-2 rounded-full border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-all text-center"
          >
            <Gift className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden />
            <span className="text-balance">Partner with Vayva</span>
          </Link>

          <div className="flex items-center justify-center sm:justify-end gap-3">
            <a
              href="https://twitter.com/vayva_ng"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:border-emerald-200 transition-all shrink-0"
              aria-label="Twitter"
            >
              <Twitter size={16} />
            </a>
            <a
              href="https://linkedin.com/company/vayva"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:border-emerald-200 transition-all shrink-0"
              aria-label="LinkedIn"
            >
              <Linkedin size={16} />
            </a>
            <a
              href="https://instagram.com/vayva.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:border-emerald-200 transition-all shrink-0"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
