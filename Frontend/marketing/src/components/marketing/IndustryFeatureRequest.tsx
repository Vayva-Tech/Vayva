"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button, Input, Label } from "@vayva/ui";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

interface IndustryFeatureRequestProps {
  industry: string;
}

const categories = [
  { value: "feature-request", label: "Feature Request", description: "Request a new feature or improvement" },
  { value: "new-industry", label: "New Industry Support", description: "Request tools for my specific industry" },
  { value: "integration", label: "Integration Request", description: "Connect with another service or platform" },
  { value: "bug-report", label: "Bug Report", description: "Report an issue or problem" },
  { value: "feedback", label: "General Feedback", description: "Share your thoughts or suggestions" },
];

const industries = [
  "Retail", "Fashion & Clothing", "Food & Beverage", "Restaurant", "Beauty & Cosmetics",
  "Healthcare", "Professional Services", "Education", "Real Estate", "Automotive",
  "Entertainment", "Events & Ticketing", "Grocery & Supermarket", "Hotel & Hospitality",
  "Legal Services", "Marketplace", "Nightlife & Bar", "Non-Profit", "Travel & Tourism",
  "Wellness & Fitness", "Wholesale & Distribution", "Manufacturing", "Technology",
  "Media & Publishing", "Sports & Recreation", "Agriculture", "Construction",
  "Transportation & Logistics", "Financial Services", "Other"
];

export function IndustryFeatureRequest({ industry }: IndustryFeatureRequestProps): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [userIndustry, setUserIndustry] = useState(industry === "your business" ? "" : industry);
  const [category, setCategory] = useState("feature-request");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !note) return;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (note.length < 20) {
      setError("Please provide at least 20 characters of detail");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/feature-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          industry: userIndustry || industry,
          category,
          note,
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
      className="rounded-[28px] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm min-w-0"
    >
      <div className="grid md:grid-cols-2 gap-8 min-w-0">
        {/* Left side - Text content */}
        <div className="min-w-0">
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Need something for your industry or location?
          </h3>
          <h4 className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-4 pb-2 border-b-2 border-emerald-200 inline-block">
            We&apos;ll build it.
          </h4>
          <p className="text-slate-600 mb-4 leading-relaxed text-sm sm:text-base">
            Every industry and region has unique challenges. Tell us what your business needs, and our team will
            research, design, and build it. From fashion boutiques needing size charts to food vendors wanting
            kitchen displays—we listen, then we deliver.
          </p>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            This is how we&apos;ve built tools for agriculture exports, event ticketing, salon appointments, and auto
            parts inventory. Your request could be next.
          </p>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mt-6">Built with you, for you</p>
        </div>

        {/* Right side - Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 min-w-0">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="feature-email" className="text-slate-700 font-semibold">Email address*</Label>
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
            <Label htmlFor="feature-industry" className="text-slate-700 font-semibold">Your industry</Label>
            <select
              id="feature-industry"
              value={userIndustry}
              onChange={(e) => setUserIndustry(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="">Select your industry</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="feature-category" className="text-slate-700 font-semibold">What are you requesting?*</Label>
            <select
              id="feature-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none bg-white"
              required
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="feature-note" className="text-slate-700 font-semibold">Tell us more about your request*</Label>
            <textarea
              id="feature-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe what you need. What problem are you trying to solve? How would this help your business?"
              rows={5}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none resize-none"
              required
            />
            <p className="text-xs text-slate-500 mt-1.5">Minimum 20 characters</p>
          </div>

          <Button
            type="submit"
            disabled={loading || !email || !note}
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
