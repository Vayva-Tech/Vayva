import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Store, Package, CreditCard, Truck, BarChart3 } from "lucide-react";
import { IconBrandWhatsapp, IconBrandInstagram } from "@tabler/icons-react";

interface FeatureItem {
  kind: "single" | "multi";
  icon?: React.ComponentType<{ className?: string }>;
  icons?: Array<React.ComponentType<{ className?: string }>>;
  title: string;
  content: string;
}

const features: FeatureItem[] = [
  {
    kind: "single",
    icon: Store,
    title: "Professional Storefront",
    content: "Beautiful, mobile-optimized templates that make your business look established from day one."
  },
  {
    kind: "multi",
    icons: [IconBrandWhatsapp, IconBrandInstagram],
    title: "Unified Order Capture",
    content: "All your orders—whether from WhatsApp, Instagram, or your website—flow into one organized dashboard."
  },
  {
    kind: "single",
    icon: Package,
    title: "Smart Inventory",
    content: "Real-time stock tracking across all channels. Low-stock alerts and automatic updates."
  },
  {
    kind: "single",
    icon: CreditCard,
    title: "Integrated Payments",
    content: "Paystack-powered cards, bank transfers, and USSD—all automated with instant settlement."
  },
  {
    kind: "single",
    icon: Truck,
    title: "Coordinated Delivery",
    content: "One-click dispatch with live tracking for you and your customers."
  },
  {
    kind: "single",
    icon: BarChart3,
    title: "Business Intelligence",
    content: "Real-time dashboards showing revenue, bestsellers, and growth opportunities."
  },
];

export function FeatureArc(): React.JSX.Element {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const active = features[activeIndex];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything you need to
            <span className="text-emerald-600"> sell and grow</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            A complete suite of commerce tools designed specifically for African businesses.
          </p>
        </div>

        {/* Desktop Semicircle Arc */}
        <div className="hidden md:block relative">
          <div className="relative w-full max-w-[800px] mx-auto aspect-[2/1.1]">
            
            {/* SVG Semicircle Background - smaller size */}
            <svg 
              viewBox="0 0 600 250" 
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="xMidYMax meet"
            >
              {/* 6 colored wedge segments - smaller semicircle */}
              {features.map((_, i) => {
                // Semicircle from left (180°) to right (0°), curving upward
                const startAngle = 180 - (i * 30);
                const endAngle = 180 - ((i + 1) * 30);
                const rad1 = (startAngle * Math.PI) / 180;
                const rad2 = (endAngle * Math.PI) / 180;
                const r = 200;
                const cx = 300;
                const cy = 250; // Bottom of viewBox
                const x1 = cx + Math.cos(rad1) * r;
                const y1 = cy - Math.sin(rad1) * r; // Subtract because SVG y is down
                const x2 = cx + Math.cos(rad2) * r;
                const y2 = cy - Math.sin(rad2) * r;
                
                const colors = ["#ecfdf5", "#d1fae5", "#a7f3d0", "#6ee7b7", "#34d399", "#10b981"];
                
                return (
                  <path
                    key={i}
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 0 ${x2} ${y2} Z`}
                    fill={colors[i]}
                    opacity={i === activeIndex ? 1 : 0.6}
                    className="transition-opacity duration-300"
                  />
                );
              })}
              
              {/* White center semicircle - smaller */}
              <path
                d="M 240 250 A 60 60 0 0 1 360 250 Z"
                fill="white"
                stroke="#10b981"
                strokeWidth="2"
              />
            </svg>

            {/* Vayva Logo - smaller and centered */}
            <div className="absolute left-1/2 bottom-[12%] -translate-x-1/2 z-30">
              <Image
                src="/vayva-logo-official.svg"
                alt="Vayva"
                width={50}
                height={35}
                className="w-12 h-auto"
                priority
              />
            </div>

            {/* Feature icons on OUTER edge - positioned ON the arc line */}
            {features.map((feature, i) => {
              const isActive = i === activeIndex;
              // Position exactly on arc edge - radius 200
              const angleDeg = 180 - (i * 30) - 15;
              const angleRad = (angleDeg * Math.PI) / 180;
              const r = 200;
              
              const cx = 300;
              const cy = 250;
              const x = cx + Math.cos(angleRad) * r;
              const y = cy - Math.sin(angleRad) * r;
              
              const xPct = (x / 600) * 100;
              const yPct = (y / 250) * 100;
              
              // Individual icon adjustments - higher % = lower on screen
              // Center icons (2,3) need much more downward shift to touch the arc
              const translateYAdjustments = [
                "-75%",  // 0: Store (Professional Storefront) - left side
                "-85%",  // 1: WhatsApp (Unified Order Capture) - left-mid
                "-90%",  // 2: Package (Smart Inventory) - top left center
                "-90%",  // 3: CreditCard (Integrated Payments) - top right center  
                "-85%",  // 4: Truck (Coordinated Delivery) - right-mid
                "-75%",  // 5: BarChart3 (Business Intelligence) - right side
              ];

              return (
                <motion.button
                  key={`icon-${i}`}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`absolute w-10 h-10 rounded-full flex items-center justify-center transition-all z-30 shadow-md ${
                    isActive
                      ? "bg-emerald-500 text-white scale-110"
                      : "bg-white text-emerald-600 hover:scale-105"
                  }`}
                  style={{
                    left: `${xPct}%`,
                    top: `${yPct}%`,
                    transform: `translate(-50%, ${translateYAdjustments[i]})`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                >
                  {(() => {
                    const IconComponent = feature.kind === "multi" 
                      ? (feature.icons && feature.icons[0])
                      : feature.icon;
                    return IconComponent ? <IconComponent className={`w-5 h-5 ${isActive ? "text-white" : "text-emerald-600"}`} /> : null;
                  })()}
                </motion.button>
              );
            })}

            {/* Feature titles positioned INSIDE each wedge - text only */}
            {features.map((feature, i) => {
              const isActive = i === activeIndex;
              // Position inside the wedge, at radius 120
              const angleDeg = 180 - (i * 30) - 15;
              const angleRad = (angleDeg * Math.PI) / 180;
              const r = 120;
              
              const cx = 300;
              const cy = 250;
              const x = cx + Math.cos(angleRad) * r;
              const y = cy - Math.sin(angleRad) * r;
              
              const xPct = (x / 600) * 100;
              const yPct = (y / 250) * 100;

              return (
                <motion.div
                  key={`label-${i}`}
                  className="absolute text-center pointer-events-none"
                  style={{
                    left: `${xPct}%`,
                    top: `${yPct}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <p className={`text-[11px] font-bold leading-tight max-w-[80px] ${
                    isActive ? "text-slate-900" : "text-slate-600"
                  }`}>
                    {feature.title}
                  </p>
                </motion.div>
              );
            })}

            {/* Active feature detail card - positioned far outside, beside the active icon */}
            {features.map((feature, i) => {
              const isActive = i === activeIndex;
              if (!isActive) return null;
              
              // Position card outside the semicircle
              const angleDeg = 180 - (i * 30) - 15;
              const angleRad = (angleDeg * Math.PI) / 180;
              const r = 440; // Adjusted position
              
              const cx = 300;
              const cy = 250;
              const x = cx + Math.cos(angleRad) * r;
              const y = cy - Math.sin(angleRad) * r;
              
              const xPct = (x / 600) * 100;
              const yPct = (y / 250) * 100;
              
              // For left side (i > 2), card extends left; for right side (i < 3), extends right
              const isLeftSide = i > 2;
              
              return (
                <motion.div
                  key={`card-${i}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute w-[260px] z-50"
                  style={{
                    left: `${xPct}%`,
                    top: `${yPct}%`,
                    transform: isLeftSide ? 'translate(-100%, -50%)' : 'translate(0%, -50%)',
                    marginLeft: isLeftSide ? '-20px' : '20px',
                  }}
                >
                  <div className="bg-white rounded-xl border-2 border-emerald-300 shadow-xl px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                        {(() => {
                          const IconComponent = active.kind === "multi" 
                            ? (active.icons && active.icons[0])
                            : active.icon;
                          return IconComponent ? <IconComponent className="w-3.5 h-3.5 text-white" /> : null;
                        })()}
                      </div>
                      <span className="text-emerald-600 font-bold text-sm">
                        {String(activeIndex + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{active.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {active.content}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile Accordion */}
        <div className="md:hidden space-y-3 mt-8">
          {features.map((feature, i) => {
            const isActive = i === activeIndex;
            
            // Extract icon for mobile
            const SingleIcon = feature.icon;
            const MultiIcons = feature.icons;
            
            return (
              <motion.button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                  isActive
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? "bg-emerald-500" : "bg-slate-100"
                  }`}>
                    {feature.kind === "multi" && MultiIcons ? (
                      <div className="flex -space-x-1">
                        {MultiIcons.map((Icon, idx) => (
                          <Icon key={idx} className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                        ))}
                      </div>
                    ) : SingleIcon ? (
                      <SingleIcon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500"}`} />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isActive ? "text-emerald-600" : "text-slate-400"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={`font-bold ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                        {feature.title}
                      </span>
                    </div>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-sm text-slate-600 mt-2 leading-relaxed"
                      >
                        {feature.content}
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
