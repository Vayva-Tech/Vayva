"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, Badge, cn } from "@vayva/ui";
import type { LucideIcon } from "lucide-react";

/**
 * 🎨 PREMIUM CARD COMPONENT
 * 
 * Reusable enhanced card with Vayva's premium design system
 * Includes backdrop blur, emerald borders, shadows, and hover effects
 */

interface PremiumCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  gradient?: "emerald" | "slate" | "violet";
  hoverEffect?: boolean;
}

export function PremiumCard({
  title,
  description,
  icon: Icon,
  children,
  className,
  delay = 0,
  gradient = "emerald",
  hoverEffect = true,
}: PremiumCardProps) {
  const gradients = {
    emerald: "from-green-50 to-teal-50",
    slate: "from-gray-50 to-gray-50",
    violet: "from-violet-50 to-purple-50",
  };

  const borderColors = {
    emerald: "border-green-200/60",
    slate: "border-gray-200/60",
    violet: "border-violet-200/60",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hoverEffect ? { y: -4, scale: 1.02 } : undefined}
      className="group"
    >
      <Card className={cn(
        "relative bg-white/90  border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden",
        borderColors[gradient],
        className
      )}>
        {/* Subtle gradient background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          gradients[gradient]
        )} />
        
        <CardHeader className="relative pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              {Icon && (
                <div className="inline-flex p-2 rounded-xl bg-gradient-to-br from-green-400 to-teal-500 shadow-lg shadow-green-200/50">
                  <Icon className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-gray-500 mt-1 font-medium">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * PREMIUM METRIC CARD
 * 
 * Enhanced metric display card with animated values and trend indicators
 */

interface PremiumMetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  subtext?: string;
  loading?: boolean;
  delay?: number;
}

export function PremiumMetricCard({
  title,
  value,
  icon: Icon,
  trend,
  subtext,
  loading = false,
  delay = 0,
}: PremiumMetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group"
    >
      <Card className="relative bg-white/90  border-green-200/60 shadow-lg hover:shadow-xl transition-all overflow-hidden">
        {/* Gradient background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6 relative">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            {title}
          </h3>
          <motion.div 
            className="p-2 rounded-xl transition-all duration-300 shadow-md"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <div className="bg-gradient-to-br from-green-400 to-teal-500 shadow-lg shadow-green-200/50">
              <Icon className="h-4 w-4 text-white" />
            </div>
          </motion.div>
        </CardHeader>
        
        <CardContent className="relative p-6 pt-0">
          {loading ? (
            <div className="h-8 w-28 rounded-lg bg-gray-100 animate-pulse" />
          ) : (
            <>
              <div className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                {value}
              </div>
              {trend && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                    trend.direction === "up" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  )}
                >
                  {trend.direction === "up" ? "↗" : "↘"}
                  {Math.abs(trend.value)}%
                </motion.div>
              )}
              {subtext && (
                <p className="text-xs text-gray-500 font-semibold mt-2">
                  {subtext}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * PREMIUM HEADER
 * 
 * Enhanced page header with gradient background and animations
 */

interface PremiumHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function PremiumHeader({
  title,
  description,
  icon: Icon,
  action,
}: PremiumHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 via-teal-600 to-cyan-700 p-8 shadow-2xl shadow-green-200"
    >
      <div className="absolute inset-0 bg-white/10 " />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="p-4 rounded-2xl bg-white/20  shadow-lg">
              <Icon className="h-10 w-10 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            {description && (
              <p className="text-green-100 font-medium">{description}</p>
            )}
          </div>
        </div>
        {action && (
          <div className="relative z-10">
            {action}
          </div>
        )}
      </div>
    </motion.div>
  );
}
