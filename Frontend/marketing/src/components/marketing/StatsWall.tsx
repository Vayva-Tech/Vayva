"use client";

import React, { useEffect, useRef, useState } from "react";
import * as motion from "framer-motion/client";
import {
  IconBolt as Lightning,
  IconShieldCheck as ShieldCheck,
  IconSparkles as Sparkle,
  IconClock as Clock,
} from "@tabler/icons-react";

interface StatItem {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  color: string;
}

// Honest startup metrics - no inflated numbers
const STATS: StatItem[] = [
  { 
    value: 24, 
    suffix: "/7", 
    label: "Platform Uptime", 
    sublabel: "Always-on commerce",
    icon: Clock, 
    color: "from-emerald-500 to-green-600" 
  },
  { 
    value: 35, 
    suffix: "+", 
    label: "AI Rules", 
    sublabel: "Monitoring your business",
    icon: Sparkle, 
    color: "from-violet-500 to-purple-600" 
  },
  { 
    value: 19, 
    suffix: "", 
    label: "Industries", 
    sublabel: "Specialized features",
    icon: Lightning, 
    color: "from-amber-500 to-orange-600" 
  },
  { 
    value: 4.9, 
    suffix: "/5", 
    label: "Beta Rating", 
    sublabel: "From early merchants",
    icon: ShieldCheck, 
    color: "from-blue-500 to-indigo-600" 
  },
];

function AnimatedCounter({ value, suffix, prefix = "" }: { value: number; suffix: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Number(current.toFixed(1)));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <span ref={ref} className="font-black">
      {prefix}{count}{suffix}
    </span>
  );
}

export function StatsWall(): React.JSX.Element {
  return (
    <section className="py-20 px-4 relative overflow-hidden bg-slate-50/50">
      <div className="max-w-[1600px] mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold mb-4">
            Early Access
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Built for serious merchants
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Join the beta and help shape the future of African commerce
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>

                <div className="text-3xl md:text-4xl text-slate-900 mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </div>

                <p className="font-semibold text-slate-900">
                  {stat.label}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {stat.sublabel}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-slate-500"
        >
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Accepting beta merchants
          </span>
          <span>•</span>
          <span>Lagos • Abuja • Port Harcourt</span>
          <span>•</span>
          <span>Fashion • Food • Services • Tech</span>
        </motion.div>
      </div>
    </section>
  );
}
