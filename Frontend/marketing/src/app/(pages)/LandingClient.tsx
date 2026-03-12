"use client";

import React from "react";
import Image from "next/image";
import { IconDeviceMobile as Smartphone } from "@tabler/icons-react";
import { LandingHero } from "@/components/marketing/LandingHero";
import IndustriesInteractiveSection from "@/components/marketing/sections/IndustriesInteractiveSection";
import * as motion from "framer-motion/client";
import dynamic from "next/dynamic";
import { Button } from "@vayva/ui";

const DashboardShowcase = dynamic(
  () => import("@/components/marketing/sections/DashboardShowcase"),
);

export function LandingClient({
  industry,
}: {
  industry: string;
}): React.JSX.Element {
  return (
    <>
      {/* Hero Section */}
      <LandingHero
        headline={
          <>
            Turn Conversations Into Sales.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
              Vayva
            </span>{" "}
            Works Everywhere.
          </>
        }
        sub="Capture orders from WhatsApp and Instagram DMs automatically. Manage everything from one powerful dashboard. Keep records clean and accountable for every sale."
      />

      {/* Dashboard Showcase */}
      <DashboardShowcase />

      <IndustriesInteractiveSection initialIndustry={industry} />

      {/* Who We Are Section */}
      <section className="hidden md:block py-24 px-4">
        <div className="max-w-[1760px] mx-auto">
          <div className="relative">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[44px] border-2 border-emerald-200/60" />
            <div className="relative grid lg:grid-cols-[1fr_0.7fr] gap-12 items-center surface-glass rounded-[40px] border-2 border-slate-900/10 p-10 md:p-14 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-text-primary mb-8 leading-[1.1] tracking-tight">
                  The bridge between{" "}
                  <span className="text-primary italic">conversations</span> and
                  commerce.
                </h2>
                <p className="text-text-secondary text-lg leading-relaxed">
                  Vayva started with a simple observation in Lagos markets:
                  commerce happens on WhatsApp, but growth hits a ceiling. We're
                  building the infrastructure that turns chat logs into
                  storefronts and casual sellers into data-driven merchants.
                </p>
              </div>
              <div className="relative lg:flex lg:justify-end">
                <div className="relative">
                  <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl border-2 border-emerald-200/60" />
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-900/10 w-full max-w-[390px]">
                    <Image
                      src="/images/calm-solution.jpg"
                      alt="Nigerian entrepreneurs collaborating on mobile commerce"
                      width={390}
                      height={293}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-background/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-border/60">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">
                              Nigeria-First Design
                            </p>
                            <p className="text-sm font-bold text-text-primary">
                              Built for low-bandwidth environments
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="hidden md:block py-24 px-4 relative">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="max-w-[1760px] mx-auto grid md:grid-cols-[0.65fr_1fr] gap-16 items-center"
        >
          <div className="relative group md:flex md:justify-start">
            <div className="absolute -inset-4 bg-rose-500/10 rounded-[40px] blur-2xl opacity-30 group-hover:opacity-40 transition-all" />
            <div className="relative">
              <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[40px] border-2 border-emerald-200/60" />
              <div className="relative rounded-[40px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border-2 border-slate-900/10 rotate-1 group-hover:rotate-0 transition-all duration-700 w-full max-w-[390px]">
                <Image
                  src="/images/chaos-problem.jpg"
                  alt="Chaos without Vayva"
                  width={390}
                  height={293}
                  className="w-full h-auto object-cover group-hover:scale-100 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-text-primary mb-8 leading-tight tracking-tight">
              WhatsApp is chaotic.
              <br />
              <span className="text-rose-400">Business shouldn't be.</span>
            </h2>
            <div className="text-lg text-text-secondary leading-relaxed space-y-6">
              <p>
                You know the feeling. Your phone is buzzing with customers
                asking "How much?" or "Is this available?" while you're trying
                to focus.
              </p>
              <p>
                Replying late means losing sales. Selling without recording
                means losing profits. Eventually, you're just stressing yourself
                out for nothing.
              </p>
              <p className="text-text-primary font-bold text-xl">
                It's exhausting. We fixed it.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Partners Section */}
      <section className="hidden md:block py-16 px-4">
        <div className="max-w-[1760px] mx-auto">
          <p className="text-center text-sm font-bold text-muted-foreground uppercase tracking-widest mb-12">
            Powered by Industry Leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
            <Image
              src="/logos/partner-paystack.png"
              alt="Paystack"
              width={140}
              height={50}
              className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
            <Image
              src="/logos/youverify_logo.png"
              alt="YouVerify"
              width={140}
              height={50}
              className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
            <Image
              src="/logos/123design_logo.jpg"
              alt="123Design"
              width={140}
              height={50}
              className="h-12 w-auto object-contain mix-blend-multiply opacity-80 hover:opacity-100 transition-opacity"
            />
            <Image
              src="/logos/kwikdelivery_logo.jpeg"
              alt="Kwik Delivery"
              width={140}
              height={50}
              className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 px-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-[1760px] mx-auto text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[44px] border-2 border-emerald-200/60" />
            <div className="relative rounded-[40px] border-2 border-slate-900/10 bg-white/90 p-10 md:p-14 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
              <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-10 leading-[1.1] tracking-tight">
                Stop running your business in chat bubbles.
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* CTA is handled in page.tsx for static URL generation or passed down */}
                {/* For simplicity we'll replicate the core structure and UI */}
                <div className="inline-block">
                  <Button
                    onClick={() =>
                      typeof window !== "undefined" && (window.location.href = `https://app.vayva.ng/signup`)
                    }
                    className="bg-primary text-white font-bold px-16 py-8 text-xl rounded-[24px] shadow-[0_20px_40px_-10px_rgba(34,197,94,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(34,197,94,0.4)] transition-all h-auto"
                  >
                    Create your account free
                  </Button>
                </div>
              </div>
              <p className="mt-8 text-muted-foreground font-medium">
                No credit card. No maintenance fees. 5-minute setup.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
};

