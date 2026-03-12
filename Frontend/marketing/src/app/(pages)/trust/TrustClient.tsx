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

export function TrustClient(): React.JSX.Element {
  const pillarIcons = [Lock, Shield, FileText];
  const complianceIcons = [Database, CheckCircle2, Shield, Lock];
  const reliabilityIcons = [Activity, Shield, ExternalLink];

  return (
    <div className="relative text-slate-900">
      {/* Section 1: Hero */}
      <section className="pt-16 pb-12 px-4 text-center">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="relative inline-flex">
            <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl border-2 border-emerald-200/60" />
            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-white/90 backdrop-blur rounded-2xl shadow-[0_14px_30px_rgba(15,23,42,0.12)] text-emerald-600 mb-6 border-2 border-slate-900/10">
              <Shield size={32} />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold mb-6 tracking-tight">
            {trustContent.heroTitle}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {trustContent.heroDescription}
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
                  <div key={pillar.title} className="relative">
                    <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-xl border-2 border-emerald-200/60" />
                    <div className="relative flex gap-4 items-start p-4 bg-white/90 backdrop-blur border-2 border-slate-900/10 rounded-xl shadow-[0_16px_38px_rgba(15,23,42,0.1)]">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0 shadow-[0_10px_20px_rgba(16,185,129,0.18)]">
                        <Icon size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1 text-slate-900">{pillar.title}</h3>
                        <p className="text-sm text-slate-600">{pillar.description}</p>
                      </div>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustContent.complianceCards.map((card, index) => {
              const Icon = complianceIcons[index] ?? Database;
              return (
                <div key={card.title} className="relative">
                  <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-xl border-2 border-emerald-200/60" />
                  <div className="relative bg-white/90 backdrop-blur p-6 rounded-xl border-2 border-slate-900/10 shadow-[0_16px_40px_rgba(15,23,42,0.1)]">
                    <Icon className="text-emerald-600 mb-4" size={32} />
                    <h3 className="font-semibold mb-2 text-slate-900">{card.title}</h3>
                    <p className="text-sm text-slate-600">{card.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 4: Payments & Transactions */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[34px] border-2 border-emerald-200/60" />
            <div className="relative rounded-3xl p-8 md:p-12 border-2 border-slate-900/10 bg-white/85 backdrop-blur shadow-[0_26px_60px_rgba(15,23,42,0.12)]">
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

              <div className="grid md:grid-cols-3 gap-6">
                {trustContent.paymentHighlights.map((item) => (
                  <div key={item.title} className="relative">
                    <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-xl border-2 border-emerald-200/60" />
                    <div className="relative bg-white/90 backdrop-blur p-6 rounded-xl border-2 border-slate-900/10 shadow-[0_16px_40px_rgba(15,23,42,0.1)]">
                      <h3 className="font-semibold mb-2 text-slate-900">{item.title}</h3>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
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

          <div className="grid md:grid-cols-3 gap-8">
            {trustContent.reliabilityCards.map((card, index) => {
              const Icon = reliabilityIcons[index] ?? Activity;
              return (
                <div key={card.title} className="relative text-center">
                  <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl border-2 border-emerald-200/60" />
                  <div className="relative rounded-2xl border-2 border-slate-900/10 bg-white/90 backdrop-blur p-6 shadow-[0_16px_40px_rgba(15,23,42,0.1)]">
                    <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-2xl shadow-[0_12px_26px_rgba(15,23,42,0.12)] flex items-center justify-center mx-auto mb-4 border-2 border-slate-900/10">
                      <Icon size={32} className="text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-slate-900">{card.title}</h3>
                    <p className="text-sm text-slate-600">{card.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 6: CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[34px] border-2 border-emerald-200/60" />
            <div className="relative rounded-[32px] border-2 border-slate-900/10 bg-white/90 backdrop-blur p-10 shadow-[0_26px_60px_rgba(15,23,42,0.12)]">
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
        </div>
      </section>
    </div>
  );
}
