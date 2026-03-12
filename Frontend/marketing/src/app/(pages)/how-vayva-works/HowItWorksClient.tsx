"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@vayva/ui";
import { APP_URL } from "@/lib/constants";
import { IconArrowRight as ArrowRight } from "@tabler/icons-react";
import { howItWorksContent } from "@/data/marketing-content";

export function HowItWorksClient(): React.JSX.Element {
  return (
    <div className="relative text-slate-900">
      <section className="pt-16 pb-12 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-semibold text-slate-900 mb-6 tracking-tight">
            {howItWorksContent.heroTitle}
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {howItWorksContent.heroDescription}
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

      <section className="py-24 px-6">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">
              {howItWorksContent.flowTitle}
            </h2>
            <p className="text-slate-600">{howItWorksContent.flowDescription}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {howItWorksContent.steps.map((step) => (
              <div key={step.step} className="relative">
                <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[22px] border-2 border-emerald-200/60" />
                <div className="relative rounded-2xl border-2 border-slate-900/10 bg-white/90 backdrop-blur p-6 shadow-[0_16px_40px_rgba(15,23,42,0.1)]">
                  <span className="text-xs font-semibold text-emerald-600">Step {step.step}</span>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-3 text-sm text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-slate-900">
              {howItWorksContent.stagesTitle}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {howItWorksContent.stages.map((stage) => (
              <div key={stage.title} className="relative">
                <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[22px] border-2 border-emerald-200/60" />
                <div className="relative rounded-2xl border-2 border-slate-900/10 bg-white/90 backdrop-blur p-6 shadow-[0_16px_40px_rgba(15,23,42,0.1)]">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">{stage.title}</h3>
                  <p className="text-sm text-slate-600">{stage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[34px] border-2 border-emerald-200/60" />
            <div className="relative rounded-3xl border-2 border-slate-900/10 bg-white/90 backdrop-blur p-10 text-center shadow-[0_24px_55px_rgba(15,23,42,0.12)]">
              <h2 className="text-3xl font-semibold text-slate-900 mb-6">
                {howItWorksContent.advantagesTitle}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-left">
                {howItWorksContent.advantages.map((advantage) => (
                  <div key={advantage} className="flex gap-3 text-slate-600">
                    <span className="text-emerald-600">✓</span>
                    <span>{advantage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[34px] border-2 border-emerald-200/60" />
            <div className="relative rounded-[32px] border-2 border-slate-900/10 bg-white/90 p-10 shadow-[0_24px_55px_rgba(15,23,42,0.12)]">
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
        </div>
      </section>
    </div>
  );
}
