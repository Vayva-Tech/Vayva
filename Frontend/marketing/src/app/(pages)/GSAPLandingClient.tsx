"use client";

import React, { useRef, useLayoutEffect } from "react";
import Image from "next/image";
import { IconDeviceMobile as Smartphone } from "@tabler/icons-react";
import { LandingHero } from "@/components/marketing/LandingHero";
import IndustriesInteractiveSection from "@/components/marketing/sections/IndustriesInteractiveSection";
import { MerchantTestimonials } from "@/components/marketing/MerchantTestimonials";
import { BeforeAfterHero } from "@/components/marketing/BeforeAfterHero";
import { StatsWall } from "@/components/marketing/StatsWall";
import { LeadMagnetInline, LeadMagnetPopup } from "@/components/marketing/LeadMagnet";
import { StickyCTABar } from "@/components/marketing/StickyCTABar";
import { WhatsAppShareButton, SharePage } from "@/components/marketing/WhatsAppShare";
import dynamic from "next/dynamic";
import { Button } from "@vayva/ui";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const DashboardShowcase = dynamic(
  () => import("@/components/marketing/sections/DashboardShowcase"),
);

export function LandingClient({
  industry,
}: {
  industry: string;
}): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const whoWeAreRef = useRef<HTMLDivElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const partnersRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      // Who We Are Section - Staggered reveal
      gsap.fromTo(
        ".who-we-are-content",
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: whoWeAreRef.current,
            start: "top 80%",
            end: "top 30%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".who-we-are-image",
        { opacity: 0, x: 60, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          delay: 0.2,
          scrollTrigger: {
            trigger: whoWeAreRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Problem Statement Section
      gsap.fromTo(
        ".problem-image",
        { opacity: 0, x: -80, rotate: -3 },
        {
          opacity: 1,
          x: 0,
          rotate: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: problemRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".problem-content h2",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: problemRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".problem-content p",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: problemRef.current,
            start: "top 65%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Partners Section - Stagger logo fade in
      gsap.fromTo(
        ".partner-logo",
        { opacity: 0, y: 20 },
        {
          opacity: 0.8,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: partnersRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Final CTA - Scale and fade
      gsap.fromTo(
        ".cta-content",
        { opacity: 0, scale: 0.9, y: 50 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Hero headline character animation (subtle)
      gsap.fromTo(
        ".hero-headline",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          delay: 0.3,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}>
      {/* Hero Section */}
      <div className="hero-headline">
        <LandingHero
          headline={
            <>
              From WhatsApp Chats
              <br />
              to Real Sales in Nigeria.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                Vayva Makes It Easy.
              </span>
            </>
          }
          sub="Accept payments from customers worldwide—international Visa, Mastercard, Amex, Apple Pay—plus all local Nigerian payment methods via Paystack. Manage orders, get payouts in Naira. No tech skills needed. Built for Nigerian merchants who want global reach."
          showGlobalBadge
        />
      </div>

      {/* Before/After Comparison */}
      <BeforeAfterHero />

      {/* Dashboard Showcase */}
      <DashboardShowcase />

      {/* Stats Wall */}
      <StatsWall />

      <IndustriesInteractiveSection initialIndustry={industry} />

      {/* Merchant Testimonials */}
      <MerchantTestimonials />

      {/* Lead Magnet - Free Guide */}
      <section className="py-16 px-4">
        <div className="max-w-[1760px] mx-auto">
          <LeadMagnetInline />
        </div>
      </section>

      {/* Who We Are Section */}
      <section
        ref={whoWeAreRef}
        className="hidden md:block py-24 px-4"
      >
        <div className="max-w-[1760px] mx-auto">
          <div className="relative">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[44px] border-2 border-emerald-200/60" />
            <div className="relative grid lg:grid-cols-[1fr_0.7fr] gap-12 items-center surface-glass rounded-[40px] border-2 border-slate-900/10 p-10 md:p-14 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
              <div className="who-we-are-content">
                <h2 className="text-4xl md:text-5xl font-black text-text-primary mb-8 leading-[1.1] tracking-tight">
                  Everything Your Business Needs,{" "}
                  <span className="text-primary italic">In One Place.</span>
                </h2>
                <p className="text-text-secondary text-lg leading-relaxed mb-4">
                  Imagine managing your entire business from a single, beautiful dashboard. 
                  No more switching between apps. No more lost orders in WhatsApp chats. 
                  No more late-night stress about inventory or deliveries.
                </p>
                <p className="text-text-secondary text-lg leading-relaxed">
                  Vayva brings together your orders, payments, campaigns, and fulfillment 
                  into one smooth experience. Our AI works quietly in the background, 
                  so you can focus on growing your business—and actually enjoy your life.
                </p>
              </div>
              <div className="relative lg:flex lg:justify-end who-we-are-image">
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
      <section
        ref={problemRef}
        className="hidden md:block py-24 px-4 relative"
      >
        <div className="max-w-[1760px] mx-auto grid md:grid-cols-[0.65fr_1fr] gap-16 items-center">
          <div className="relative group md:flex md:justify-start problem-image">
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
          <div className="problem-content">
            <h2 className="text-4xl md:text-5xl font-black text-text-primary mb-8 leading-tight tracking-tight">
              Stop Juggling a Dozen Apps.
              <br />
              <span className="text-rose-400">Start Living Better.</span>
            </h2>
            <div className="text-lg text-text-secondary leading-relaxed space-y-6">
              <p>
                You&apos;re tired. Tired of checking WhatsApp at midnight. Tired of 
                manually updating stock. Tired of coordinating deliveries across 
                three different platforms.
              </p>
              <p>
                Every minute you spend on busywork is a minute stolen from your 
                family, your rest, or your next big idea. Running a business 
                shouldn&apos;t mean sacrificing your peace of mind.
              </p>
              <p className="text-text-primary font-bold text-xl">
                Vayva changes the game. One dashboard. AI that works for you. 
                Finally, business feels easy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section
        ref={partnersRef}
        className="hidden md:block py-16 px-4"
      >
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
              className="partner-logo h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
            <Image
              src="/logos/youverify_logo.png"
              alt="YouVerify"
              width={140}
              height={50}
              className="partner-logo h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
            <Image
              src="/logos/123design_logo.jpg"
              alt="123Design"
              width={140}
              height={50}
              className="partner-logo h-12 w-auto object-contain mix-blend-multiply opacity-80 hover:opacity-100 transition-opacity"
            />
            <Image
              src="/logos/kwikdelivery_logo.jpeg"
              alt="Kwik Delivery"
              width={140}
              height={50}
              className="partner-logo h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </section>

      {/* WhatsApp Share Section */}
      <section className="py-8 px-4 bg-gradient-to-r from-emerald-50 to-green-50 border-y border-emerald-100">
        <div className="max-w-[1760px] mx-auto">
          <SharePage className="justify-center" />
        </div>
      </section>

      {/* Sticky CTA Bar */}
      <StickyCTABar />

      {/* Lead Magnet Popup (Exit Intent) */}
      <LeadMagnetPopup />

      {/* Final CTA */}
      <section
        ref={ctaRef}
        className="py-16 md:py-24 px-4 relative"
      >
        <div className="cta-content max-w-[1760px] mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[44px] border-2 border-emerald-200/60" />
            <div className="relative rounded-[40px] border-2 border-slate-900/10 bg-white/90 p-10 md:p-14 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
                Ready for Less Stress
                <br />
                <span className="text-primary">and More Sales?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join thousands of Nigerian businesses who&apos;ve simplified their operations 
                with Vayva. One dashboard. AI-powered everything. Smoother days ahead.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="inline-block">
                  <Button
                    onClick={() =>
                      typeof window !== "undefined" && (window.location.href = `https://app.vayva.ng/signup`)
                    }
                    className="bg-primary text-white font-bold px-12 py-6 text-lg rounded-[20px] shadow-[0_20px_40px_-10px_rgba(34,197,94,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(34,197,94,0.4)] transition-all h-auto"
                  >
                    Start Your Free Journey
                  </Button>
                </div>
              </div>
              <p className="mt-6 text-muted-foreground font-medium">
                No credit card. No stress. Set up in 5 minutes and reclaim your time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

