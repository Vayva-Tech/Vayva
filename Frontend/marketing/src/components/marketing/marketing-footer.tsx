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
} from "@tabler/icons-react";

export function MarketingFooter(): React.JSX.Element {
  return (
    <footer className="border-t border-slate-200/40 bg-white/30 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr_1fr_1fr_1fr] gap-8">
          <div className="space-y-4">
            <Logo href="/" size="sm" showText={true} text="Vayva" />
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
              The business operating system that runs your business smoothly. From anywhere in the world, manage orders, payments, inventory, and deliveries in one unified platform.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                Talk to sales →
              </Link>
              <Link href="/pricing" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                View pricing
              </Link>
            </div>
          </div>

          {/* Nav Column: Product */}
          <div className="space-y-6">
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Product
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Pricing Plans", href: "/pricing" },
                { label: "AI Agent", href: "/ai-agent" },
                { label: "Autopilot", href: "/autopilot" },
                { label: "All Features", href: "/all-features" },
                { label: "Industries", href: "/industries" },
                { label: "Templates", href: "/templates" },
                { label: "Solutions", href: "/solutions" },
                { label: "Download App", href: "/download" },
              ].map((link) => (
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
          </div>

          {/* Nav Column: Company */}
          <div className="space-y-6">
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { label: "About Vayva", href: "/about" },
                { label: "Contact Us", href: "/contact" },
                { label: "Blog", href: "/blog" },
                { label: "Developers", href: "/developers" },
                { label: "Trust & Security", href: "/trust" },
                { label: "System Status", href: "/system-status" },
              ].map((link) => (
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
          </div>

          {/* Nav Column: Resources */}
          <div className="space-y-6">
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Resources
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Help Center", href: "/help" },
                { label: "Getting Started", href: "/help/getting-started" },
                { label: "API Documentation", href: "/developers" },
                { label: "Desktop App", href: "/desktop-download" },
                { label: "Merchant Login", href: `${APP_URL}/signin` },
              ].map((link) => (
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
          </div>

          {/* Nav Column: Legal */}
          <div className="space-y-6">
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Legal
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Legal Hub", href: "/legal" },
                { label: "Privacy Policy", href: "/legal/privacy" },
                { label: "Terms of Service", href: "/legal/terms" },
                { label: "Cookie Policy", href: "/legal/cookies" },
                { label: "Refund Policy", href: "/legal/refund-policy" },
                { label: "Acceptable Use", href: "/legal/acceptable-use" },
                { label: "Data Processing", href: "/legal/dpa" },
                { label: "KYC & Safety", href: "/legal/kyc-safety" },
              ].map((link) => (
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
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/40 py-6">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-row items-center justify-between gap-4 whitespace-nowrap">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 flex-shrink-0">
            © {new Date().getFullYear()} Vayva Tech
          </p>

          <Link
            href="/contact"
            className="flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-all flex-shrink-0"
          >
            <Gift className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="whitespace-nowrap">Partner with Vayva → Let&apos;s collaborate</span>
          </Link>

          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="https://twitter.com/vayva_ng"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:border-emerald-200 transition-all flex-shrink-0"
              aria-label="Twitter"
            >
              <Twitter size={16} />
            </a>
            <a
              href="https://linkedin.com/company/vayva"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:border-emerald-200 transition-all flex-shrink-0"
              aria-label="LinkedIn"
            >
              <Linkedin size={16} />
            </a>
            <a
              href="https://instagram.com/vayva.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:border-emerald-200 transition-all flex-shrink-0"
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
