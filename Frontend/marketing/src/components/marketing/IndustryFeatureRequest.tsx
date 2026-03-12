"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button, Input, Label } from "@vayva/ui";
import { Lightbulb, Send, CheckCircle, AlertCircle } from "lucide-react";

interface IndustryFeatureRequestProps {
  industry: string;
}

export function IndustryFeatureRequest({ industry }: IndustryFeatureRequestProps): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [feature, setFeature] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !feature) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/feature-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          feature,
          industry,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feature request");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[28px] border-2 border-emerald-200 bg-emerald-50/50 p-8 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Thank you!</h3>
        <p className="text-slate-600">
          Your feature request for {industry} has been received. We&apos;ll review it and keep you updated.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative"
    >
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[28px] border-2 border-emerald-200/60" />
      <div className="relative rounded-[28px] border-2 border-slate-900/10 bg-white/90 backdrop-blur p-8 shadow-[0_20px_50px_rgba(15,23,42,0.1)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-[0_10px_25px_rgba(16,185,129,0.25)]">
            <Lightbulb className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Request a Feature</h3>
            <p className="text-sm text-slate-500">Help us build the perfect tools for {industry}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <div>
            <Label htmlFor="feature-email" className="text-slate-700">Email address</Label>
            <Input
              id="feature-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
              className="mt-1.5 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="feature-request" className="text-slate-700">What feature would help your {industry.toLowerCase()} business?</Label>
            <textarea
              id="feature-request"
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
              placeholder="Describe the feature you'd like to see..."
              rows={4}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none resize-none"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !email || !feature}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 font-semibold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Submit Request
              </span>
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
