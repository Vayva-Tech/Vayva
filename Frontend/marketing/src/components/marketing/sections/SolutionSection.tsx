"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconMessageCircle as MessageCircle, IconCreditCard as CreditCard, IconTruck as Truck, IconChartBar as BarChart3 } from "@tabler/icons-react";

// WhatsApp Chat Mini Mockup with iPhone Frame
function WhatsAppMockup() {
  return (
    <div className="relative w-full h-full">
      {/* iPhone Frame */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2rem] p-1 shadow-2xl">
        {/* Inner Bezel */}
        <div className="w-full h-full bg-black rounded-[1.75rem] overflow-hidden relative">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-2xl z-20" />
          
          {/* Status Bar */}
          <div className="h-6 bg-[#075e54] flex items-center justify-between px-4 pt-1">
            <span className="text-white text-[8px] font-medium">9:41</span>
            <div className="flex items-center gap-0.5">
              <div className="w-3 h-2 bg-white/80 rounded-sm" />
              <div className="w-3 h-2 bg-white/80 rounded-sm" />
              <div className="w-3 h-2 border border-white/80 rounded-sm" />
            </div>
          </div>

          {/* WhatsApp Header */}
          <div className="bg-[#075e54] px-3 py-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.13-1.35A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-white text-[9px] font-semibold">Vayva Store</div>
              <div className="text-white/70 text-[7px]">online</div>
            </div>
          </div>

          {/* Chat Area - WhatsApp Background */}
          <div className="flex-1 bg-[#e5ddd5] h-[calc(100%-4.5rem)] overflow-hidden relative">
            {/* WhatsApp Pattern Overlay */}
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
            }} />

            {/* Messages */}
            <div className="relative p-2 space-y-2">
              {/* Received Message */}
              <div className="flex justify-start">
                <div className="bg-white rounded-lg rounded-tl-none p-2 max-w-[85%] shadow-sm">
                  <p className="text-[8px] text-slate-700 leading-snug">Hi! I want to order 2 Ankara dresses size M</p>
                  <div className="flex items-end justify-end gap-1 mt-1">
                    <span className="text-[6px] text-slate-400">10:30 AM</span>
                  </div>
                </div>
              </div>

              {/* Sent Message */}
              <div className="flex justify-end">
                <div className="bg-[#dcf8c6] rounded-lg rounded-tr-none p-2 max-w-[85%] shadow-sm">
                  <p className="text-[8px] text-slate-700 leading-snug">Got it! Total: ₦15,000. Send to: 12 Adeola...</p>
                  <div className="flex items-end justify-end gap-1 mt-1">
                    <span className="text-[6px] text-slate-400">10:31 AM</span>
                    <svg className="w-3 h-3 text-blue-500" viewBox="0 0 16 15" fill="currentColor">
                      <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Payment Confirmation */}
              <div className="flex justify-start">
                <div className="bg-white rounded-lg rounded-tl-none p-2 max-w-[85%] shadow-sm">
                  <div className="flex items-center gap-1 text-emerald-600">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    <p className="text-[8px] text-slate-700">Payment sent</p>
                  </div>
                  <span className="text-[6px] text-slate-400 ml-4">10:35 AM</span>
                </div>
              </div>

              {/* Vayva Capturing */}
              <div className="flex justify-end">
                <div className="bg-[#dcf8c6] rounded-lg p-2 max-w-[85%] shadow-sm flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-600 rounded-full animate-spin" />
                  <span className="text-[8px] text-slate-600">Vayva capturing...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Payment Dashboard Mini Mockup with Device Frame
function PaymentMockup() {
  return (
    <div className="relative w-full h-full">
      {/* Device Frame */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl p-1 shadow-2xl">
        <div className="w-full h-full bg-white rounded-xl overflow-hidden relative">
          {/* App Header */}
          <div className="h-8 bg-emerald-600 flex items-center justify-between px-3">
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
                <span className="text-white text-[6px] font-bold">V</span>
              </div>
              <span className="text-white text-[8px] font-semibold">Vayva Pay</span>
            </div>
            <div className="w-4 h-4 rounded-full bg-white/20" />
          </div>

          {/* Payment List */}
          <div className="p-2 space-y-2">
            <div className="text-[8px] font-bold text-slate-700 mb-1">Recent Payments</div>
            {[
              { name: "Adebayo K.", amount: "₦45,000", status: "Confirmed", time: "2m ago", color: "emerald" },
              { name: "Chioma N.", amount: "₦12,500", status: "Confirmed", time: "5m ago", color: "emerald" },
              { name: "Emeka O.", amount: "₦28,000", status: "Pending", time: "1m ago", color: "amber" },
            ].map((payment, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg p-2 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[7px] font-bold text-emerald-600">
                    {payment.name[0]}
                  </div>
                  <div>
                    <div className="text-[8px] font-semibold text-slate-700">{payment.name}</div>
                    <div className="text-[6px] text-slate-400">{payment.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-bold text-slate-700">{payment.amount}</div>
                  <div className={`text-[6px] flex items-center gap-0.5 ${payment.status === "Confirmed" ? "text-emerald-600" : "text-amber-600"}`}>
                    {payment.status === "Confirmed" && (
                      <svg className="w-2 h-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                    {payment.status}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Auto Confirm Banner */}
          <div className="mx-2 mt-1 p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <span className="text-[7px] text-emerald-700 font-medium">Auto-confirmed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Delivery Tracking Mini Mockup with Map
function DeliveryMockup() {
  return (
    <div className="relative w-full h-full">
      {/* Device Frame */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl p-1 shadow-2xl">
        <div className="w-full h-full bg-white rounded-xl overflow-hidden relative">
          {/* App Header */}
          <div className="h-8 bg-blue-600 flex items-center justify-between px-3">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              </svg>
              <span className="text-white text-[8px] font-semibold">Kwik Delivery</span>
            </div>
          </div>

          {/* Map Background */}
          <div className="h-20 bg-gradient-to-br from-blue-50 to-emerald-50 relative overflow-hidden">
            {/* Simple Map Lines */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <path d="M0 30 Q30 20, 60 35 T120 25" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.3"/>
              <path d="M20 50 Q50 40, 80 45 T140 40" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.3"/>
              <circle cx="40" cy="35" r="4" fill="#3b82f6" />
              <circle cx="90" cy="40" r="4" fill="#ef4444" />
            </svg>
            
            {/* Route Info */}
            <div className="absolute bottom-1 left-2 right-2 bg-white/90 backdrop-blur rounded-lg p-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-[7px] text-slate-600">Lagos Island → Ikoyi</div>
                <div className="text-[7px] font-bold text-blue-600">12 mins</div>
              </div>
            </div>
          </div>

          {/* Delivery List */}
          <div className="p-2 space-y-1.5">
            {[
              { id: "#4721", status: "Out for delivery", progress: 75, color: "bg-blue-500" },
              { id: "#4722", status: "Picked up", progress: 40, color: "bg-emerald-500" },
              { id: "#4723", status: "Delivered", progress: 100, color: "bg-slate-400" },
            ].map((delivery, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-1.5 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-bold text-slate-700">{delivery.id}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-blue-500 animate-pulse' : i === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  </div>
                  <span className="text-[7px] text-slate-500">{delivery.status}</span>
                </div>
                <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${delivery.color} rounded-full transition-all`} style={{ width: `${delivery.progress}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Status */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[7px] text-slate-600 font-medium">3 active deliveries</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Analytics Dashboard Mini Mockup with Charts
function AnalyticsMockup() {
  return (
    <div className="relative w-full h-full">
      {/* Device Frame */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl p-1 shadow-2xl">
        <div className="w-full h-full bg-slate-50 rounded-xl overflow-hidden relative">
          {/* App Header */}
          <div className="h-8 bg-slate-800 flex items-center justify-between px-3">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
              <span className="text-white text-[8px] font-semibold">Analytics</span>
            </div>
            <div className="text-[7px] text-slate-400">Today</div>
          </div>

          {/* Stats Cards */}
          <div className="p-2 grid grid-cols-2 gap-2">
            <div className="bg-white rounded-lg p-2 shadow-sm border-l-2 border-emerald-500">
              <div className="text-[12px] font-bold text-emerald-600">₦127K</div>
              <div className="text-[7px] text-slate-500">Revenue</div>
              <div className="text-[6px] text-emerald-500 flex items-center gap-0.5 mt-0.5">
                <svg className="w-2 h-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14l5-5 5 5z"/>
                </svg>
                +12%
              </div>
            </div>
            <div className="bg-white rounded-lg p-2 shadow-sm border-l-2 border-blue-500">
              <div className="text-[12px] font-bold text-blue-600">24</div>
              <div className="text-[7px] text-slate-500">Orders</div>
              <div className="text-[6px] text-blue-500 flex items-center gap-0.5 mt-0.5">
                <svg className="w-2 h-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14l5-5 5 5z"/>
                </svg>
                +8%
              </div>
            </div>
          </div>

          {/* Mini Chart */}
          <div className="px-2 pb-2">
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <div className="text-[7px] text-slate-500 mb-2">Weekly Sales</div>
              <div className="flex items-end justify-between h-14 gap-1 px-1">
                {[40, 65, 45, 80, 55, 95, 75].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} className="text-[6px] text-slate-400 flex-1 text-center">{d}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Insight */}
          <div className="absolute bottom-2 left-2 right-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <span className="text-[7px] text-emerald-700 font-medium">Best day: Saturday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    icon: MessageCircle,
    title: "WhatsApp becomes your sales team",
    description: "Customers message you like always. But now Vayva captures every detail, creates the order, and tracks it to delivery.",
    color: "bg-emerald-100 text-emerald-700",
    mockup: WhatsAppMockup,
  },
  {
    icon: CreditCard,
    title: "Payments, confirmed automatically",
    description: "No more \"have you paid?\" back-and-forth. Paystack integration means instant confirmation and clean records.",
    color: "bg-blue-100 text-blue-700",
    mockup: PaymentMockup,
  },
  {
    icon: Truck,
    title: "Delivery sorted, end to end",
    description: "From Kwik dispatch to self-managed riders — track every package and know exactly when it reaches your customer.",
    color: "bg-amber-100 text-amber-700",
    mockup: DeliveryMockup,
  },
  {
    icon: BarChart3,
    title: "Know your business inside out",
    description: "What's selling? Who's buying? What to restock? Your dashboard tells you — no spreadsheets, no guessing.",
    color: "bg-purple-100 text-purple-700",
    mockup: AnalyticsMockup,
  },
];

export function SolutionSection(): React.JSX.Element {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Subtle gradient accents */}
      <div 
        className="absolute top-0 right-0 w-[800px] h-[400px] opacity-40"
        style={{
          background: "radial-gradient(ellipse 100% 100% at 100% 0%, rgba(59, 130, 246, 0.06), transparent 70%)"
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[600px] h-[300px] opacity-30"
        style={{
          background: "radial-gradient(ellipse 100% 100% at 0% 100%, rgba(34, 197, 94, 0.06), transparent 70%)"
        }}
      />

      <div className="container-wide relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
            <BarChart3 className="w-4 h-4" />
            Here&apos;s how it works
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
            Four things that just… work
          </h2>
          <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto">
            No 200-feature lists. No complex setup. Just the essentials, 
            done right for Nigerian businesses.
          </p>
        </motion.div>

        {/* Feature grid - with visual mockups */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Mockup = feature.mockup;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-6 rounded-3xl bg-white border border-slate-200 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50/30 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: Icon + Text */}
                  <div className="flex-1">
                    <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Right: Visual Mockup */}
                  <div className="w-full md:w-44 h-48 flex-shrink-0">
                    <Mockup />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white shadow-lg border border-slate-200">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <p className="text-sm text-slate-600">
              Works seamlessly with <span className="font-semibold text-emerald-700">Paystack</span>, 
              <span className="font-semibold text-emerald-700"> Kwik</span>, 
              <span className="font-semibold text-emerald-700"> WhatsApp Business</span> & more
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
