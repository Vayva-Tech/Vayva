"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@vayva/ui";
import { APP_URL } from "@/lib/constants";
import { IconArrowRight as ArrowRight } from "@tabler/icons-react";
import { howItWorksContent } from "@/data/marketing-content";
import { MarketingSnapItem, MarketingSnapRow } from "@/components/marketing/MarketingSnapRow";

export function HowItWorksClient(): React.JSX.Element {
  return (
    <div className="relative w-full min-w-0 overflow-x-hidden text-slate-900">
      <section className="pt-16 pb-12 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto min-w-0">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-semibold text-slate-900 mb-5 sm:mb-6 tracking-tight">
            {howItWorksContent.heroTitle}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-1">
            <span className="md:hidden">
              WhatsApp threads become structured workflows—see the five steps below.
            </span>
            <span className="hidden md:inline">{howItWorksContent.heroDescription}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`${APP_URL}${howItWorksContent.primaryCta.href}`}>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all shadow-lg">
                {howItWorksContent.primaryCta.label}
              </Button>
            </Link>
            <Link href={howItWorksContent.secondaryCta.href}>
              <Button
                variant="outline"
                className="border-2 border-slate-300 text-slate-700 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white/60 transition-all"
              >
                {howItWorksContent.secondaryCta.label}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto px-2 sm:px-6 min-w-0">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">
              {howItWorksContent.flowTitle}
            </h2>
            <p className="text-slate-600 px-2">
              <span className="md:hidden">Five steps from chat to fulfillment.</span>
              <span className="hidden md:inline">{howItWorksContent.flowDescription}</span>
            </p>
          </div>

          <div className="hidden md:grid md:grid-cols-2 gap-6">
            {howItWorksContent.steps.map((step) => (
              <div
                key={step.step}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
              >
                <span className="text-xs font-semibold text-emerald-600">Step {step.step}</span>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="md:hidden -mx-1">
            <MarketingSnapRow
              ariaLabel="How it works steps"
              hint="Swipe through each step"
              showDots
              dotCount={howItWorksContent.steps.length}
            >
              {howItWorksContent.steps.map((step) => (
                <MarketingSnapItem key={step.step}>
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm h-full">
                    <span className="text-xs font-semibold text-emerald-600">Step {step.step}</span>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">{step.description}</p>
                  </div>
                </MarketingSnapItem>
              ))}
            </MarketingSnapRow>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto px-2 sm:px-6 min-w-0">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-slate-900">
              {howItWorksContent.stagesTitle}
            </h2>
            <p className="mt-3 text-sm text-slate-500 md:hidden">Swipe to compare each stage.</p>
          </div>
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {howItWorksContent.stages.map((stage) => (
              <div
                key={stage.title}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{stage.title}</h3>
                <p className="text-sm text-slate-600">{stage.description}</p>
              </div>
            ))}
          </div>
          <div className="md:hidden -mx-1">
            <MarketingSnapRow
              ariaLabel="Business stages"
              hint="Swipe for each stage"
              showDots
              dotCount={howItWorksContent.stages.length}
            >
              {howItWorksContent.stages.map((stage) => (
                <MarketingSnapItem key={stage.title}>
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm h-full">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">{stage.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{stage.description}</p>
                  </div>
                </MarketingSnapItem>
              ))}
            </MarketingSnapRow>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto min-w-0">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 text-center shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-5 sm:mb-6">
              {howItWorksContent.advantagesTitle}
            </h2>
            <div className="hidden sm:grid sm:grid-cols-2 gap-4 text-left">
              {howItWorksContent.advantages.map((advantage) => (
                <div key={advantage} className="flex gap-3 text-slate-600 text-sm">
                  <span className="text-emerald-600 shrink-0">✓</span>
                  <span>{advantage}</span>
                </div>
              ))}
            </div>
            <div className="sm:hidden text-left -mx-1">
              <MarketingSnapRow
                ariaLabel="Platform advantages"
                hint="Swipe for more benefits"
                showDots
                dotCount={howItWorksContent.advantages.length}
              >
                {howItWorksContent.advantages.map((advantage) => (
                  <MarketingSnapItem key={advantage}>
                    <div className="flex gap-3 text-slate-600 text-sm rounded-2xl border border-slate-100 bg-slate-50/80 p-4 h-full min-h-[100px] items-start">
                      <span className="text-emerald-600 shrink-0">✓</span>
                      <span className="leading-relaxed">{advantage}</span>
                    </div>
                  </MarketingSnapItem>
                ))}
              </MarketingSnapRow>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-[32px] border border-slate-200/80 bg-white p-10 shadow-sm">
            <h2 className="text-4xl font-semibold text-slate-900 mb-6">
              {howItWorksContent.finalCtaTitle}
            </h2>
            <Link href={`${APP_URL}${howItWorksContent.primaryCta.href}`}>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-5 text-lg font-semibold rounded-xl shadow-xl inline-flex items-center gap-2">
                {howItWorksContent.finalCtaLabel} <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
