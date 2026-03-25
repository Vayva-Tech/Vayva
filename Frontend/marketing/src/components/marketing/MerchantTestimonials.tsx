"use client";

import React from "react";
import * as motion from "framer-motion/client";
import {
  IconStar as Star,
  IconMapPin as MapPin,
  IconBuildingStore as Store,
} from "@tabler/icons-react";
import { MarketingSnapItem, MarketingSnapRow } from "@/components/marketing/MarketingSnapRow";

interface Testimonial {
  name: string;
  role: string;
  location: string;
  business: string;
  quote: string;
  rating: number;
  initials: string;
  image?: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Chioma N.",
    role: "Fashion Retailer",
    location: "Lekki, Lagos",
    business: "Chioma's Closet",
    quote: "Before Vayva, I was losing track of orders in WhatsApp chats. Now I process 50+ orders daily without stress. My customers love the instant confirmations!",
    rating: 5,
    initials: "CN",
  },
  {
    name: "Abdul M.",
    role: "Electronics Seller",
    location: "Computer Village, Lagos",
    business: "TechHub NG",
    quote: "The Paystack integration is seamless. I get paid instantly and withdrawals to my bank take minutes. Vayva paid for itself in the first week.",
    rating: 5,
    initials: "AM",
  },
  {
    name: "Ngozi O.",
    role: "Skincare Entrepreneur",
    location: "Abuja",
    business: "Glow by Ngozi",
    quote: "I run my entire business from my phone now. The dashboard shows me exactly what's selling, what's low on stock, and who owes me money.",
    rating: 5,
    initials: "NO",
  },
  {
    name: "Emmanuel K.",
    role: "Restaurant Owner",
    location: "Port Harcourt",
    business: "Kelechi's Kitchen",
    quote: "WhatsApp orders used to be chaotic. Now they're organized, tracked, and I can see my daily revenue in real-time. Game changer for my business!",
    rating: 5,
    initials: "EK",
  },
  {
    name: "Fatima B.",
    role: "Jewelry Designer",
    location: "Kano",
    business: "Fatima's Gems",
    quote: "Started with the Starter trial to test. Upgraded to Pro within 2 weeks because it helped me reach customers in Lagos and Abuja from Kano. Worth every naira!",
    rating: 5,
    initials: "FB",
  },
  {
    name: "Oluwaseun A.",
    role: "Phone Accessories Dealer",
    location: "Ikeja, Lagos",
    business: "MobileMart NG",
    quote: "The inventory tracking saved me from over-selling. My customers trust me more because I never promise what I don't have. Vayva = Peace of mind.",
    rating: 5,
    initials: "OA",
  },
];

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-background/70 backdrop-blur-xl rounded-3xl p-6 border border-border/60 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-400/30 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-primary">{testimonial.initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-foreground text-sm truncate">{testimonial.name}</h4>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-primary/60" />
            <span className="text-[10px] text-muted-foreground">{testimonial.location}</span>
          </div>
        </div>
      </div>

      {/* Business Tag */}
      <div className="flex items-center gap-1.5 mb-3">
        <Store className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">{testimonial.business}</span>
      </div>

      {/* Quote */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Rating */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < testimonial.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function MerchantTestimonials(): React.JSX.Element {
  return (
    <section className="py-24 px-4 relative w-full min-w-0 overflow-x-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

      <div className="container-wide relative min-w-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Trusted by merchants across Nigeria
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4 leading-tight tracking-tight">
            Real Merchants, <span className="text-primary">Real Results</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            <span className="md:hidden">
              Swipe for stories from merchants using Vayva across Nigeria.
            </span>
            <span className="hidden md:inline">
              From Lagos to Kano, see how Nigerian entrepreneurs are transforming their WhatsApp businesses with Vayva.
            </span>
          </p>
        </motion.div>

        {/* Testimonials: desktop grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard key={testimonial.initials} testimonial={testimonial} index={index} />
          ))}
        </div>
        <div className="md:hidden -mx-1 pb-2">
          <MarketingSnapRow
            ariaLabel="Merchant testimonials"
            hint="Swipe for more stories"
            showDots
            dotCount={TESTIMONIALS.length}
          >
            {TESTIMONIALS.map((testimonial, index) => (
              <MarketingSnapItem key={testimonial.initials}>
                <TestimonialCard testimonial={testimonial} index={index} />
              </MarketingSnapItem>
            ))}
          </MarketingSnapRow>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8 text-muted-foreground"
        >
          <span className="flex items-center gap-2 text-sm">
            <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Payments via Paystack
          </span>
          <span className="flex items-center gap-2 text-sm">
            <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
            Secure & Encrypted
          </span>
          <span className="flex items-center gap-2 text-sm">
            <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Naira Payouts
          </span>
        </motion.div>
      </div>
    </section>
  );
}
