"use client";

import React from "react";
import Link from "next/link";
import {
  IconBulb as Lightbulb,
  IconShieldCheck as ShieldCheck,
  IconAccessible as Accessible,
  IconUsers as Users,
} from "@tabler/icons-react";
import * as motion from "framer-motion/client";
import { PremiumButton } from "@/components/marketing/PremiumButton";
import { APP_URL } from "@/lib/constants";

const VALUES = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We push boundaries to create tools that anticipate what merchants need before they ask.",
  },
  {
    icon: ShieldCheck,
    title: "Reliability",
    description:
      "Your business never sleeps, and neither does our platform. Uptime and trust are non-negotiable.",
  },
  {
    icon: Accessible,
    title: "Accessibility",
    description:
      "World-class technology should not require a world-class budget. We build for every entrepreneur.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We grow when our merchants grow. Their success stories are the only metric that matters.",
  },
];

export function AboutClient(): React.JSX.Element {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="pt-20 pb-16 px-4 text-center bg-white">
        <div className="max-w-[1600px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="inline-block mb-6"
          >
            <span className="px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-sm font-semibold tracking-wide">
              About Vayva
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-[1.1]"
          >
            Built for African
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
              Commerce
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            The all-in-one platform that gives every merchant the powerful
            technology they deserve — designed from the ground up for how
            African business actually works.
          </motion.p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-1 w-12 rounded-full bg-green-500" />
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-green-600">
              Our Story
            </h2>
          </div>

          <div className="rounded-2xl bg-slate-50 p-8 md:p-12 space-y-6 text-lg text-slate-700 leading-relaxed">
            <p>
              Vayva was born from a simple frustration: watching talented
              Nigerian entrepreneurs struggle with fragmented tools that
              weren&apos;t built for them.
            </p>
            <p>
              While the world had Shopify, Stripe, and sophisticated AI —
              African businesses were left stitching together unreliable
              solutions, losing customers to slow responses, and spending hours
              on tasks that should take minutes.
            </p>
            <p>
              We built Vayva because every merchant deserves the same powerful
              technology that drives the world&apos;s best businesses — designed
              from the ground up for how African commerce actually works.
            </p>
            <p className="font-medium text-slate-900">
              From the bustling markets of Lagos to growing businesses across
              the continent, Vayva is the platform that grows with you.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Our Mission */}
      <section className="py-24 px-4 bg-white relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-bold uppercase tracking-[0.25em] text-green-600 mb-10"
          >
            Our Mission
          </motion.h2>
          <motion.blockquote
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-5xl font-bold leading-[1.15] tracking-tight text-slate-900"
          >
            Empower every African business with the{" "}
            <span className="text-green-500">tools, automation, and AI</span>{" "}
            they need to compete on a global stage — without leaving the
            platforms their customers already love.
          </motion.blockquote>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-green-600 mb-4">
              Our Values
            </h2>
            <p className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              What We Stand For
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-white border border-slate-200 p-8 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-5">
                  <value.icon className="text-green-500" size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-50/50 via-transparent to-transparent opacity-50" />
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="relative rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Ready to grow your business?
            </h2>
            <p className="text-slate-600 mb-10 text-lg max-w-xl mx-auto">
              Join thousands of merchants across Africa who are building their
              future with Vayva.
            </p>
            <Link href={`${APP_URL}/signup`}>
              <PremiumButton className="px-16 py-8 text-xl rounded-2xl">
                Get started for free
              </PremiumButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
