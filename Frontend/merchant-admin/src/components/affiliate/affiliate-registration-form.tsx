"use client";

import { useState } from "react";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, Building2, CreditCard, CheckCircle } from "lucide-react";

// Common Nigerian banks with Paystack codes
const NIGERIAN_BANKS = [
  { code: "057", name: "Zenith Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "035", name: "Wema Bank" },
  { code: "058", name: "Guaranty Trust Bank (GTB)" },
  { code: "214", name: "First City Monument Bank (FCMB)" },
  { code: "044", name: "Access Bank" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "070", name: "Fidelity Bank Nigeria" },
  { code: "076", name: "Polaris Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "304", name: "Stanbic Mobile Money" },
  { code: "305", name: "Paycom (Opay)" },
  { code: "307", name: "EcoMobile" },
  { code: "309", name: "Mkudi" },
  { code: "311", name: "Parkway-ReadyCash" },
  { code: "312", name: "Stanbic Mobile Money" },
  { code: "315", name: "GTBank Mobile Money" },
  { code: "318", name: "Fidelity Mobile" },
  { code: "319", name: "Paga" },
  { code: "322", name: "Zenith Mobile" },
  { code: "323", name: "Access Money" },
  { code: "401", name: "Aso Savings and Loans" },
  { code: "408", name: "New Prudential Bank" },
  { code: "502", name: "Kuda Bank" },
  { code: "503", name: "Palmpay" },
  { code: "505", name: "Moniepoint" },
  { code: "999", name: "NIP Virtual Bank" },
];

interface AffiliateRegistrationFormProps {
  storeId: string;
  onSuccess?: () => void;
}

export function AffiliateRegistrationForm({ storeId, onSuccess }: AffiliateRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bankCode: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    customCode: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.bankCode) {
      newErrors.bankCode = "Bank selection is required";
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d{10}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = "Account number must be 10 digits";
    }

    if (!formData.accountName.trim()) {
      newErrors.accountName = "Account name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBankChange = (value: string) => {
    const bank = NIGERIAN_BANKS.find((b) => b.code === value);
    setFormData((prev) => ({
      ...prev,
      bankCode: value,
      bankName: bank?.name || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/affiliate/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          bankCode: formData.bankCode,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          accountName: formData.accountName,
          customCode: formData.customCode || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        toast({
          title: "Registration Successful",
          description: "Your affiliate application has been submitted for review.",
        });
        onSuccess?.();
      } else {
        toast({
          title: "Registration Failed",
          description: data.error || "Failed to register affiliate",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error("[Affiliate Registration] Error:", { error });
      toast({
        title: "Error",
        description: "Failed to submit registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Application Submitted!</h3>
          <p className="text-muted-foreground max-w-md">
            Thank you for registering as an affiliate. Your application is under review and you&apos;ll
            receive an email once approved.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Your referral code: <strong className="text-foreground">{formData.customCode || "Will be assigned"}</strong>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Affiliate Registration
        </CardTitle>
        <CardDescription>
          Register as an affiliate and earn commissions by referring customers. Commission payouts
          are made directly to your bank account via Paystack.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              Personal Information
            </h4>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08012345678"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customCode">Custom Referral Code (Optional)</Label>
                <Input
                  id="customCode"
                  placeholder="e.g., JOHN2024"
                  value={formData.customCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customCode: e.target.value.toUpperCase(),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  A unique code will be assigned if not provided
                </p>
              </div>
            </div>
          </div>

          {/* Bank Account Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Bank Account for Payouts
            </h4>

            <div className="space-y-2">
              <Label htmlFor="bank">
                Bank <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.bankCode}
                onValueChange={handleBankChange}
              >
                <SelectTrigger
                  id="bank"
                  className={errors.bankCode ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {NIGERIAN_BANKS.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bankCode && (
                <p className="text-sm text-red-500">{errors.bankCode}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">
                  Account Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="accountNumber"
                  placeholder="10-digit account number"
                  maxLength={10}
                  value={formData.accountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData((prev) => ({ ...prev, accountNumber: value }));
                  }}
                  className={errors.accountNumber ? "border-red-500" : ""}
                />
                {errors.accountNumber && (
                  <p className="text-sm text-red-500">{errors.accountNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">
                  Account Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="accountName"
                  placeholder="Name on bank account"
                  value={formData.accountName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accountName: e.target.value,
                    }))
                  }
                  className={errors.accountName ? "border-red-500" : ""}
                />
                {errors.accountName && (
                  <p className="text-sm text-red-500">{errors.accountName}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <CreditCard className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Your bank account will be verified with Paystack for secure commission payouts.
                Minimum payout threshold is ₦5,000. Payouts are processed within 24-48 hours.
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
