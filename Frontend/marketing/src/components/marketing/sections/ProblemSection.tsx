"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  IconDeviceMobile as Smartphone,
  IconNote as StickyNote,
  IconAlertCircle as AlertCircle,
  IconCircleCheck as CheckCircle2,
  IconLayoutDashboard as LayoutDashboard,
  IconSparkles as Sparkles,
  IconArrowRight as ArrowRight,
} from "@tabler/icons-react";

const beforeProblems = [
  { icon: Smartphone, text: "47 unread WhatsApp messages and counting" },
  { icon: StickyNote, text: "Orders tracked across 3 different notebooks" },
  { icon: AlertCircle, text: "'Did they pay?' confusion every single day" },
  { icon: AlertCircle, text: "Stockouts during your biggest sales" },
];

const afterBenefits = [
  { icon: CheckCircle2, text: "Orders auto-captured from every channel" },
  { icon: LayoutDashboard, text: "Everything visible in one dashboard" },
  { icon: CheckCircle2, text: "Payment status confirmed instantly" },
  { icon: CheckCircle2, text: "Low-stock alerts before you run out" },
];

export function ProblemSection(): React.JSX.Element {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden" id="how-it-works">
      {/* Background accents */}
      <div 
        className="absolute top-0 right-0 w-[600px] h-[400px] opacity-30"
        style={{
          background: "radial-gradient(ellipse 100% 100% at 100% 0%, rgba(239, 68, 68, 0.08), transparent 70%)"
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[600px] h-[400px] opacity-30"
        style={{
          background: "radial-gradient(ellipse 100% 100% at 0% 100%, rgba(34, 197, 94, 0.08), transparent 70%)"
        }}
      />

      <div className="container-readable relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            The Chaos of Running a Business
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-3">
            Before vs After Vayva
          </h2>
        </motion.div>

        {/* Before/After Cards */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* BEFORE Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl border-2 border-red-100 overflow-hidden shadow-lg shadow-red-100/50">
              {/* Header */}
              <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold text-lg">✗</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Before Vayva</h3>
                    <p className="text-sm text-slate-500">The daily struggle</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {beforeProblems.map((problem, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-red-50/50 border border-red-100/50"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <problem.icon className="w-4 h-4 text-red-600" />
                    </div>
                    <p className="text-slate-700 pt-1">{problem.text}</p>
                  </motion.div>
                ))}
              </div>

              {/* Visual chaos representation */}
              <div className="px-6 pb-6">
                <div className="relative h-32 bg-slate-100 rounded-xl overflow-hidden">
                  {/* Floating chaos elements */}
                  <motion.div
                    animate={{ y: [0, -5, 0], rotate: [0, 3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-3 left-4 bg-white p-2 rounded-lg shadow-md"
                  >
                    <Smartphone className="w-5 h-5 text-red-500" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute top-8 right-6 bg-white p-2 rounded-lg shadow-md"
                  >
                    <StickyNote className="w-5 h-5 text-amber-500" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -6, 0], rotate: [0, 4, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-4 left-8 bg-white p-2 rounded-lg shadow-md"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </motion.div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-slate-400 text-sm font-medium">Visual chaos</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AFTER Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl border-2 border-emerald-100 overflow-hidden shadow-lg shadow-emerald-100/50">
              {/* Header */}
              <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">After Vayva</h3>
                    <p className="text-sm text-slate-500">Organized & automated</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {afterBenefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/50"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <benefit.icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-slate-700 pt-1">{benefit.text}</p>
                  </motion.div>
                ))}
              </div>

              {/* Visual organized representation */}
              <div className="px-6 pb-6">
                <div className="h-32 bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                  {/* Mini dashboard preview */}
                  <div className="p-4 h-full">
                    <div className="flex gap-3 h-full">
                      {/* Sidebar */}
                      <div className="w-12 bg-emerald-600 rounded-lg flex flex-col items-center py-3 gap-3">
                        <div className="w-6 h-6 bg-white/20 rounded" />
                        <div className="w-6 h-6 bg-white/20 rounded" />
                        <div className="w-6 h-6 bg-white/20 rounded" />
                      </div>
                      {/* Content */}
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-12 bg-emerald-100 rounded" />
                          <div className="h-12 bg-emerald-100 rounded" />
                        </div>
                        <div className="h-8 bg-white rounded border border-slate-200 flex items-center px-2">
                          <div className="w-4 h-4 bg-emerald-500 rounded-full mr-2" />
                          <div className="h-2 bg-slate-200 rounded w-20" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute -inset-4 bg-emerald-500/10 rounded-3xl blur-2xl -z-10" />
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-emerald-800">
              That&apos;s exactly why we built Vayva
            </span>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
