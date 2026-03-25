"use client";

import React from "react";
import { motion } from "framer-motion";

export function DashboardPreview(): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
      className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 min-w-0 overflow-x-hidden"
    >
      {/* Glow Effect */}
      <div className="absolute -inset-8 bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-500/20 rounded-[60px] blur-3xl -z-10 opacity-70" />
      
      {/* Dashboard Mock */}
      <div className="relative rounded-[28px] overflow-hidden shadow-2xl p-4 bg-white/50 backdrop-blur-sm">
        {/* Dashboard mock removed */}
      </div>
    </motion.div>
  );
}
