"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { apiJson } from "@/lib/api-client-shared";
import {
  Gift,
  DollarSign,
  Users,
  TrendingUp,
  Check,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  RefreshCw,
} from "lucide-react";

interface AffiliateProgramInfo {
  commissionRate: number;
  commissionType: "percentage" | "fixed";
  minPayout: number;
  cookieDuration: number;
  description: string;
  benefits: string[];
}

export default function AffiliateJoinPage() {
  const { store } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    phone: "",
    fullName: "",
    website: "",
    socialMedia: "",
    marketingMethod: "",
    agreedToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Default program info - in production this would come from API
  const programInfo: AffiliateProgramInfo = {
    commissionRate: 10,
    commissionType: "percentage",
    minPayout: 1000,
    cookieDuration: 30,
    description: `Join the ${store?.name} affiliate program and earn commissions by sharing our products with your audience.`,
    benefits: [
      "Earn 10% commission on every sale",
      "30-day cookie duration",
      "Real-time tracking dashboard",
      "Monthly payouts via bank transfer",
      "Marketing materials provided",
      "Dedicated affiliate support",
    ],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiJson("/api/affiliate/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Application Submitted!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for applying to the {store?.name} affiliate program. 
                We&apos;ll review your application and get back to you within 24-48 hours.
              </p>
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => router.push("/")}
                >
                  Back to Store
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push("/account")}
                >
                  Go to My Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Join the {store?.name} Affiliate Program
          </h1>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Share amazing products with your audience and earn commissions on every sale
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <DollarSign className="w-5 h-5" />
              <span className="font-semibold">
                {programInfo.commissionType === "percentage" 
                  ? `${programInfo.commissionRate}% Commission` 
                  : `${programInfo.commissionRate} per Sale`}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">{programInfo.cookieDuration}-Day Cookie</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">Real-time Tracking</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Benefits Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Why Join Our Program?</h2>
            <div className="space-y-4">
              {programInfo.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                  </div>
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-purple-50 rounded-xl border border-purple-100">
              <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Trusted Program
              </h3>
              <p className="text-sm text-purple-700">
                Our affiliate program is designed to be fair and transparent. 
                You earn when your referrals make purchases, with a generous 
                {programInfo.cookieDuration}-day tracking window.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-purple-600">
                  {programInfo.commissionType === "percentage" 
                    ? `${programInfo.commissionRate}%` 
                    : formatCurrency(programInfo.commissionRate)}
                </p>
                <p className="text-sm text-gray-600">Commission</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-purple-600">
                  {programInfo.cookieDuration} days
                </p>
                <p className="text-sm text-gray-600">Cookie Life</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-purple-600">
                  ₦{programInfo.minPayout.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Min. Payout</p>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Apply to Become an Affiliate</CardTitle>
                <CardDescription>
                  Fill out the form below to join our affiliate program
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm({ ...form, fullName: e.target.value })
                      }
                      placeholder="Your full name"
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="your@email.com"
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="+234 800 000 0000"
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website / Blog (Optional)</Label>
                    <Input
                      id="website"
                      value={form.website}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm({ ...form, website: e.target.value })
                      }
                      placeholder="https://yourwebsite.com"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="socialMedia">Social Media Profile (Optional)</Label>
                    <Input
                      id="socialMedia"
                      value={form.socialMedia}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm({ ...form, socialMedia: e.target.value })
                      }
                      placeholder="@yourhandle or profile URL"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="marketingMethod">How do you plan to promote us? *</Label>
                    <textarea
                      id="marketingMethod"
                      value={form.marketingMethod}
                      onChange={(e) => setForm({ ...form, marketingMethod: e.target.value })}
                      placeholder="Tell us about your audience and how you plan to share our products..."
                      required
                      rows={4}
                      className="w-full mt-1.5 p-3 rounded-md border border-input bg-background text-sm"
                    />
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      checked={form.agreedToTerms}
                      onCheckedChange={(checked: boolean) => 
                        setForm({ ...form, agreedToTerms: checked as boolean })
                      }
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm font-normal leading-tight">
                      I agree to the affiliate program terms and conditions. 
                      I understand that commissions are paid only on completed sales 
                      and that I must follow ethical marketing practices.
                    </Label>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !form.agreedToTerms}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By applying, you agree to our Affiliate Terms of Service and Privacy Policy.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for currency formatting
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}
