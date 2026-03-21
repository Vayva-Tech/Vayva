// @ts-nocheck
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
import { Loader2, CreditCard, Building2, Repeat, Calendar, CheckCircle, Copy } from "lucide-react";
import { apiJson } from "@/lib/api-client-shared";
import { formatCurrency } from "@vayva/shared";

interface SubscriptionOption {
  id: string;
  name: string;
  description: string;
  monthlyAmount: number;
  threeMonthAmount: number;
  features: string[];
}

const subscriptionPlans: SubscriptionOption[] = [
  {
    id: "starter",
    name: "Starter Plan",
    description: "For new businesses",
    monthlyAmount: 5000,
    threeMonthAmount: 15000,
    features: ["Up to 100 products", "Basic analytics", "Email support"],
  },
  {
    id: "pro",
    name: "Pro Plan",
    description: "For growing businesses",
    monthlyAmount: 15000,
    threeMonthAmount: 45000,
    features: ["Unlimited products", "Advanced analytics", "Priority support", "Affiliate system"],
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    description: "For large operations",
    monthlyAmount: 50000,
    threeMonthAmount: 150000,
    features: ["Everything in Pro", "Dedicated account manager", "Custom integrations", "White-label"],
  },
];

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
}

export default function SubscriptionPaymentPage() {
  const searchParams = useSearchParams();
  const preselectedPlan = searchParams.get("plan") || "pro";
  
  const [selectedPlan, setSelectedPlan] = useState(preselectedPlan);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card-recurring");
  const [duration, setDuration] = useState<"monthly" | "three_month">("monthly");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);

  const currentPlan = subscriptionPlans.find((p) => p.id === selectedPlan) || subscriptionPlans[1];
  const amount = duration === "three_month" ? currentPlan.threeMonthAmount : currentPlan.monthlyAmount;

  const handlePayment = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiJson<PaymentResponse>("/api/subscriptions/initiate", {
        method: "POST",
        body: JSON.stringify({
          planId: selectedPlan,
          amount,
          email,
          phone,
          paymentMethod,
          duration,
        }),
      });

      if (response.success) {
        setPaymentResult(response);
        
        // Redirect to Paystack checkout (card + bank transfer)
        if (response.authorization_url) {
          window.location.href = response.authorization_url;
        }
      } else {
        alert(response.message || "Payment initiation failed");
      }
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
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-gray-500">Choose monthly or 3 months</p>
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
            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid md:grid-cols-3 gap-4">
              {subscriptionPlans.map((plan) => (
                <div key={plan.id}>
                  <RadioGroupItem
                    value={plan.id}
                    id={plan.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={plan.id}
                    className={`block p-6 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold text-lg mb-1">{plan.name}</div>
                    <div className="text-sm text-gray-500 mb-3">{plan.description}</div>
                    <div className="text-2xl font-bold mb-2">
                      {formatCurrency(duration === "three_month" ? plan.threeMonthAmount : plan.monthlyAmount, "NGN")}
                      <span className="text-sm font-normal text-gray-500">/{duration === "three_month" ? "3 months" : "month"}</span>
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
              ))}
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
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
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
                    <span className="text-2xl font-bold">{formatCurrency(amount, "NGN")}</span>
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-lg"
                  onClick={handlePayment}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay Now
                    </>
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
