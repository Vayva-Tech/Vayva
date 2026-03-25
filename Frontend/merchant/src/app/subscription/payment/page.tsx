"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, CreditCard, Building2, Repeat, Calendar, CheckCircle } from "lucide-react";
import { formatCurrency } from "@vayva/shared";
import { PLANS, QUARTERLY_DISCOUNT_PERCENT, getQuarterlyTotalNgn } from "@/config/pricing";

interface SubscriptionOption {
  id: string;
  name: string;
  description: string;
  monthlyAmount: number;
  threeMonthAmount: number;
  features: string[];
}

const PAID_PLAN_KEYS = ["STARTER", "PRO", "PRO_PLUS"] as const;

function buildSubscriptionPlans(): SubscriptionOption[] {
  const paid = PAID_PLAN_KEYS.map((key) => {
    const p = PLANS.find((x) => x.key === key);
    if (!p) {
      throw new Error(`Missing plan config for ${key}`);
    }
    return {
      id: key.toLowerCase(),
      name: `${p.name} Plan`,
      description: p.tagline,
      monthlyAmount: p.monthlyAmount,
      threeMonthAmount: getQuarterlyTotalNgn(p.monthlyAmount),
      features: p.bullets,
    };
  });

  return [
    ...paid,
    {
      id: "enterprise",
      name: "Enterprise Plan",
      description: "Custom limits, integrations, and SLAs for large teams",
      monthlyAmount: 0,
      threeMonthAmount: 0,
      features: [
        "Custom catalog and order limits",
        "Dedicated success and engineering",
        "Custom integrations and white-label options",
        "SLA and security review",
      ],
    },
  ];
}

const subscriptionPlans = buildSubscriptionPlans();

type PaymentMethod = "card-recurring" | "card-onetime" | "virtual-account";

interface PaymentResponse {
  success: boolean;
  authorization_url?: string;
  reference?: string;
  virtualAccount?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
  };
  message?: string;
  error?: string;
}

const VALID_PLAN_IDS = new Set(subscriptionPlans.map((p) => p.id));

export default function SubscriptionPaymentPage() {
  const searchParams = useSearchParams();
  const planParam = searchParams?.get("plan") || "pro";
  const preselectedPlan = VALID_PLAN_IDS.has(planParam) ? planParam : "pro";

  const [selectedPlan, setSelectedPlan] = useState(preselectedPlan);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card-recurring");
  const [duration, setDuration] = useState<"monthly" | "three_month">("monthly");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);

  const currentPlan = subscriptionPlans.find((p) => p.id === selectedPlan) || subscriptionPlans[1];
  const amount = duration === "three_month" ? currentPlan.threeMonthAmount : currentPlan.monthlyAmount;
  const isEnterprise = selectedPlan === "enterprise" || amount <= 0;

  const handlePayment = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      alert("Please enter a valid email address");
      return;
    }

    if (!storeName.trim() || storeName.trim().length < 2) {
      alert("Please enter your business name");
      return;
    }

    if (!phone.trim() || phone.trim().length < 8) {
      alert("Please enter a valid phone number");
      return;
    }

    if (isEnterprise) {
      alert("Enterprise billing is arranged with our team. Please contact support or sales to continue.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/subscriptions/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          amount,
          email: email.trim(),
          phone: phone.trim(),
          storeName: storeName.trim(),
          paymentMethod,
          duration,
        }),
      });
      const response = (await res.json().catch(() => ({}))) as PaymentResponse;

      if (res.ok && response.success && response.authorization_url) {
        setPaymentResult(response);
        window.location.href = response.authorization_url;
        return;
      }

      const errText =
        (typeof response.message === "string" && response.message) ||
        (typeof response.error === "string" && response.error) ||
        `Payment initiation failed (${res.status})`;
      alert(errText);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-gray-600">Select a plan and payment method that works for you</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Plan Selection */}
          <div className="lg:col-span-2 space-y-6 max-w-full min-w-0">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-gray-500">
                        Choose monthly or 3 months ({QUARTERLY_DISCOUNT_PERCENT}% off vs three monthly payments)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={duration === "monthly" ? "text-sm font-medium" : "text-sm text-gray-500"}>Monthly</span>
                    <Switch
                      checked={duration === "three_month"}
                      onCheckedChange={(checked) => setDuration(checked ? "three_month" : "monthly")}
                    />
                    <span className={duration === "three_month" ? "text-sm font-medium" : "text-sm text-gray-500"}>3 months</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plan Cards */}
            <RadioGroup
              value={selectedPlan}
              onValueChange={setSelectedPlan}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
            >
              {subscriptionPlans.map((plan) => {
                const displayAmount =
                  plan.id === "enterprise"
                    ? null
                    : duration === "three_month"
                      ? plan.threeMonthAmount
                      : plan.monthlyAmount;
                return (
                <div key={plan.id}>
                  <RadioGroupItem
                    value={plan.id}
                    id={plan.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={plan.id}
                    className={`block p-6 rounded-lg border-2 cursor-pointer transition-all h-full ${
                      selectedPlan === plan.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold text-lg mb-1">{plan.name}</div>
                    <div className="text-sm text-gray-500 mb-3">{plan.description}</div>
                    <div className="text-2xl font-bold mb-2">
                      {displayAmount == null ? (
                        <span>Custom</span>
                      ) : (
                        formatCurrency(displayAmount, "NGN")
                      )}
                      {displayAmount != null ? (
                      <span className="text-sm font-normal text-gray-500">/{duration === "three_month" ? "3 months" : "month"}</span>
                      ) : null}
                    </div>
                    <ul className="text-sm space-y-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </Label>
                </div>
              );
              })}
            </RadioGroup>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose how you want to pay for your subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="card-recurring" className="flex items-center gap-2">
                      <Repeat className="h-4 w-4" />
                      Auto-Debit
                    </TabsTrigger>
                    <TabsTrigger value="card-onetime" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Card (One-time)
                    </TabsTrigger>
                    <TabsTrigger value="virtual-account" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Bank Transfer
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="card-recurring" className="mt-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Auto-Debit (Recommended):</strong> Your card will be charged automatically 
                        every {duration === "three_month" ? "3 months" : "month"}. You can cancel anytime. No late payments, no interruptions.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="card-onetime" className="mt-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <strong>One-time Card Payment:</strong> Pay once with your card. 
                        You'll need to manually renew when your subscription expires.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="virtual-account" className="mt-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        <strong>Bank Transfer:</strong> You will be redirected to Paystack to complete a bank transfer. 
                        Subscription activates once payment is received.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeName">Business name</Label>
                  <Input
                    id="storeName"
                    type="text"
                    placeholder="Your store or brand name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-medium">{currentPlan.name}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Billing</span>
                    <span className="font-medium">{duration === "three_month" ? "3 months" : "Monthly"}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium">
                      {paymentMethod === "card-recurring" && "Auto-Debit"}
                      {paymentMethod === "card-onetime" && "Card (One-time)"}
                      {paymentMethod === "virtual-account" && "Bank Transfer"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-4 border-t">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold">
                      {isEnterprise ? "Custom" : formatCurrency(amount, "NGN")}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-lg"
                  onClick={handlePayment}
                  disabled={isLoading || isEnterprise}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : isEnterprise ? (
                    "Contact sales"
                  ) : (
                    "Pay Now"
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By clicking Pay Now, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
