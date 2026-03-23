// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import {
  Building as Building2,
  Sparkle as Sparkles,
  ArrowRight,
  Envelope as Mail,
  CheckCircle as CheckCircle2,
} from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { Input } from "@vayva/ui";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { apiJson } from "@/lib/api-client-shared";

export default function IndustryDashboardsWaitlistPage() {
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !industry) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API endpoint when available
      await apiJson("/api/beta/industry-dashboards-waitlist", {
        method: "POST",
        body: JSON.stringify({ email, industry }),
      });

      setHasJoined(true);
      toast.success("You've joined the waitlist! We'll notify you when ready.");
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("[WAITLIST_JOIN_ERROR]", errMsg);
      toast.error("Failed to join waitlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50"
    >
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Breadcrumbs />
          <div className="flex items-center gap-4 mb-6">
            <BackButton href="/dashboard" label="Back to Dashboard" />
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500 text-white text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Coming Soon
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Industry-Specific Dashboards
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tailored analytics, metrics, and workflows designed specifically for your industry. 
            Get insights that matter most to your business.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <BenefitCard
            icon={<Building2 className="h-6 w-6" />}
            title="Industry Metrics"
            description="KPIs and metrics specific to your industry, not generic one-size-fits-all"
          />
          <BenefitCard
            icon={<Sparkles className="h-6 w-6" />}
            title="Smart Automation"
            description="Automated insights and alerts for what matters in your business"
          />
          <BenefitCard
            icon={<ArrowRight className="h-6 w-6" />}
            title="Tailored Workflows"
            description="Optimized workflows that match how your industry actually works"
          />
        </motion.div>

        {/* Waitlist Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          {hasJoined ? (
            <div className="bg-white/90  rounded-2xl shadow-lg border border-green-200/60 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                You're on the list!
              </h3>
              <p className="text-gray-600 mb-6">
                We'll notify you at <span className="font-medium">{email}</span> when industry-specific dashboards are ready.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setHasJoined(false);
                  setEmail("");
                  setIndustry("");
                }}
                className="rounded-xl"
              >
                Join with different email
              </Button>
            </div>
          ) : (
            <div className="bg-white/90  rounded-2xl shadow-lg border border-green-200/60 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Join the Waitlist
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to know when we launch industry-specific dashboards for your business.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="pl-10 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    required
                  >
                    <option value="">Select your industry</option>
                    <option value="retail">Retail</option>
                    <option value="fashion">Fashion & Apparel</option>
                    <option value="food">Food & Beverage</option>
                    <option value="services">Services</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="legal">Legal</option>
                    <option value="education">Education</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="automotive">Automotive</option>
                    <option value="events">Events</option>
                    <option value="travel">Travel & Hospitality</option>
                    <option value="nonprofit">Nonprofit</option>
                    <option value="creative">Creative Agency</option>
                    <option value="professional">Professional Services</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                >
                  {isSubmitting ? "Joining..." : "Join Waitlist"}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  We'll only email you about the launch. No spam, unsubscribe anytime.
                </p>
              </form>
            </div>
          )}
        </motion.div>

        {/* Current Dashboard Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-600">
            In the meantime, you have access to our{" "}
            <span className="font-medium text-green-600">Pro Dashboard</span>{" "}
            with comprehensive analytics and insights for all industries.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white/80  rounded-xl p-6 shadow-md border border-gray-200/60"
    >
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-teal-500 text-white flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </motion.div>
  );
}
