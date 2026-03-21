"use client";

import React from "react";
import { HeroSection } from "./sections/HeroSectionNew";
import { OSLayersSection } from "./sections/OSLayersSection";

export default function SimpleRedesignedLanding(): React.JSX.Element {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/30">
      {/* Hero Section */}
      <HeroSection />
      
      {/* OS Layers Section */}
      <OSLayersSection />
      
      {/* Footer CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Ready to upgrade your business?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Join 2,000+ businesses running on Vayva
          </p>
          <p className="text-sm text-slate-500">
            7-day trial • No credit card • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}
