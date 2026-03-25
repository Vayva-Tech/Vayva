"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@vayva/ui";
import {
  IconShield as Shield,
  IconLock as Lock,
  IconDatabase as Database,
  IconCreditCard as CreditCard,
  IconActivity as Activity,
  IconFileText as FileText,
  IconCircleCheck as CheckCircle2,
  IconArrowUpRight as ExternalLink,
} from "@tabler/icons-react";
import { trustContent } from "@/data/marketing-content";
import { MarketingSnapItem, MarketingSnapRow } from "@/components/marketing/MarketingSnapRow";

export function TrustClient(): React.JSX.Element {
  const pillarIcons = [Lock, Shield, FileText];
  const complianceIcons = [Database, CheckCircle2, Shield, Lock];
  const reliabilityIcons = [Activity, Shield, ExternalLink];

  return (
    <div className="relative w-full min-w-0 overflow-x-hidden text-slate-900">
      {/* Section 1: Hero */}
      <section className="pt-16 pb-12 px-4 text-center">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 min-w-0">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm text-emerald-600 mb-6 border border-slate-200/80">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-semibold mb-5 sm:mb-6 tracking-tight">
            {trustContent.heroTitle}
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            <span className="md:hidden">
              Security, compliance, and reliability—details in the sections below.
            </span>
            <span className="hidden md:inline">{trustContent.heroDescription}</span>
          </p>
        </div>
      </section>

      {/* Section 2: Platform Security */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-semibold mb-6">Built with security at the core.</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                Your business data is protected through multiple layers of security controls, from authentication to audit logging.
              </p>
            </div>
            <div className="space-y-4">
              {trustContent.pillars.map((pillar, index) => {
                const Icon = pillarIcons[index] ?? Lock;
                return (
                  <div
                    key={pillar.title}
                    className="flex gap-4 items-start p-4 bg-white border border-slate-200/80 rounded-xl shadow-sm"
                  >
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0 shadow-[0_10px_20px_rgba(16,185,129,0.18)]">
                        <Icon size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1 text-slate-900">{pillar.title}</h3>
                        <p className="text-sm text-slate-600">{pillar.description}</p>
                      </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Data Privacy & Compliance */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4">{trustContent.complianceTitle}</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">{trustContent.complianceDescription}</p>
          </div>

          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustContent.complianceCards.map((card, index) => {
              const Icon = complianceIcons[index] ?? Database;
              return (
                <div
                  key={card.title}
                  className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm"
                >
                    <Icon className="text-emerald-600 mb-4" size={32} />
                    <h3 className="font-semibold mb-2 text-slate-900">{card.title}</h3>
                    <p className="text-sm text-slate-600">{card.description}</p>
                </div>
              );
            })}
          </div>
          <div className="md:hidden -mx-1">
            <MarketingSnapRow
              ariaLabel="Compliance and privacy"
              hint="Swipe for each topic"
              showDots
              dotCount={trustContent.complianceCards.length}
            >
              {trustContent.complianceCards.map((card, index) => {
                const Icon = complianceIcons[index] ?? Database;
                return (
                  <MarketingSnapItem key={card.title}>
                    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm h-full">
                      <Icon className="text-emerald-600 mb-4" size={32} />
                      <h3 className="font-semibold mb-2 text-slate-900">{card.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{card.description}</p>
                    </div>
                  </MarketingSnapItem>
                );
              })}
            </MarketingSnapRow>
          </div>
        </div>
      </section>

      {/* Section 4: Payments & Transactions */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl p-8 md:p-12 border border-slate-200/80 bg-white shadow-sm">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 border border-emerald-200">
                  <CreditCard size={24} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-semibold mb-4 text-slate-900">
                    {trustContent.paymentsTitle}
                  </h2>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    {trustContent.paymentsDescription}
                  </p>
                </div>
              </div>

              <div className="hidden md:grid md:grid-cols-3 gap-6">
                {trustContent.paymentHighlights.map((item) => (
                  <div
                    key={item.title}
                    className="bg-slate-50/80 p-6 rounded-xl border border-slate-200/80 shadow-sm"
                  >
                      <h3 className="font-semibold mb-2 text-slate-900">{item.title}</h3>
                      <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
              <div className="md:hidden -mx-1 mt-4">
                <MarketingSnapRow
                  ariaLabel="Payment highlights"
                  hint="Swipe for payment details"
                  showDots
                  dotCount={trustContent.paymentHighlights.length}
                >
                  {trustContent.paymentHighlights.map((item) => (
                    <MarketingSnapItem key={item.title}>
                      <div className="bg-slate-50/80 p-6 rounded-xl border border-slate-200/80 shadow-sm h-full min-h-[120px]">
                        <h3 className="font-semibold mb-2 text-slate-900">{item.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                      </div>
                    </MarketingSnapItem>
                  ))}
                </MarketingSnapRow>
              </div>
          </div>
        </div>
      </section>

      {/* Section 5: Platform Reliability */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4">{trustContent.reliabilityTitle}</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">{trustContent.reliabilityDescription}</p>
          </div>

          <div className="hidden md:grid md:grid-cols-3 gap-8">
            {trustContent.reliabilityCards.map((card, index) => {
              const Icon = reliabilityIcons[index] ?? Activity;
              return (
                <div key={card.title} className="text-center rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-200/80">
                      <Icon size={32} className="text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-slate-900">{card.title}</h3>
                    <p className="text-sm text-slate-600">{card.description}</p>
                </div>
              );
            })}
          </div>
          <div className="md:hidden -mx-1">
            <MarketingSnapRow
              ariaLabel="Platform reliability"
              hint="Swipe for each commitment"
              showDots
              dotCount={trustContent.reliabilityCards.length}
            >
              {trustContent.reliabilityCards.map((card, index) => {
                const Icon = reliabilityIcons[index] ?? Activity;
                return (
                  <MarketingSnapItem key={card.title}>
                    <div className="text-center rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm h-full">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-200/80">
                        <Icon size={32} className="text-emerald-600" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 text-slate-900">{card.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{card.description}</p>
                    </div>
                  </MarketingSnapItem>
                );
              })}
            </MarketingSnapRow>
          </div>
        </div>
      </section>

      {/* Section 6: CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-[32px] border border-slate-200/80 bg-white p-10 shadow-sm">
              <h2 className="text-3xl font-semibold text-slate-900 mb-6">{trustContent.ctaTitle}</h2>
              <p className="text-slate-600 mb-8 text-lg">{trustContent.ctaDescription}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={trustContent.ctaPrimary.href}>
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all">
                    {trustContent.ctaPrimary.label}
                  </Button>
                </Link>
                <Link href={trustContent.ctaSecondary.href}>
                  <Button
                    variant="outline"
                    className="border-2 border-slate-300 text-slate-700 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white/60 transition-all"
                  >
                    {trustContent.ctaSecondary.label}
                  </Button>
                </Link>
              </div>
          </div>
        </div>
      </section>
    </div>
  );
}
