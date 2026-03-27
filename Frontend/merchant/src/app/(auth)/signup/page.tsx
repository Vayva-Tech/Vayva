"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { logger } from "@vayva/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth";
import { SplitAuthLayout } from "@/components/auth/SplitAuthLayout";
import { Button, Input, Label } from "@vayva/ui";
import { Eye, EyeSlash as EyeOff } from "@phosphor-icons/react/ssr";
import { PasswordStrengthIndicator } from "@/components/ui/PasswordStrengthIndicator";
import { PlanKey } from "@/config/pricing";

// Plan configuration
const PLANS = {
  starter: { name: "Starter", price: "₦25,000/mo", firstMonthFree: true },
  pro: { name: "Pro", price: "₦35,000/mo", firstMonthFree: false },
  pro_plus: { name: "Pro+", price: "₦50,000/mo", firstMonthFree: false },
} as const;

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") as PlanKey | null;
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(planParam || "starter");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Update plan from URL parameter
  useEffect(() => {
    if (planParam && ["starter", "pro", "pro_plus"].includes(planParam)) {
      setSelectedPlan(planParam);
    }
  }, [planParam]);

  // RFC 5322 compliant email validation
  const validateEmail = (value: string) => {
    if (!value) return "Email is required";
    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value)) {
      return "Enter a valid email address";
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      setError("Please agree to the Terms, Privacy Policy, and EULA.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Register user account and create store in single call - includes plan selection for database persistence
      const registration = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        businessName,
        plan: selectedPlan, // Send plan to backend for database persistence
      });
      
      // Redirect to verification for all plans
      // After verification, auth context will route to onboarding
      router.push(`/verify?email=${encodeURIComponent(email)}${selectedPlan ? `&plan=${selectedPlan}` : ""}`);
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[SIGNUP_ERROR]", { error: _errMsg, app: "merchant" });
      setError(_errMsg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SplitAuthLayout
      title={
        selectedPlan === "starter" 
          ? "Start your first month free" 
          : `Start with ${PLANS[selectedPlan].name}`
      }
      subtitle={
        selectedPlan === "starter"
          ? "No credit card required. Get 30 days free, then ₦25,000/month."
          : selectedPlan === "pro"
          ? "Pay ₦35,000/month to activate Pro features. 7-day trial included."
          : "Pay ₦50,000/month to activate Pro+ features. Maximum power unlocked."
      }
      showSignInLink
      leftVariant="signup"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Live region for screen readers */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {error && <p role="alert">{error}</p>}
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Plan Selection Display */}
        <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-emerald-50 to-purple-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Selected Plan</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{PLANS[selectedPlan].name}</p>
              <p className="text-sm text-slate-600">{PLANS[selectedPlan].price}</p>
            </div>
            {selectedPlan === "starter" && (
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                🎉 First Month Free
              </span>
            )}
            {selectedPlan !== "starter" && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                💳 Payment required
              </span>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            {(["starter", "pro", "pro_plus"] as const).map((planKey) => (
              <button
                key={planKey}
                type="button"
                onClick={() => setSelectedPlan(planKey)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  selectedPlan === planKey
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {PLANS[planKey].name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              placeholder="John"
              value={firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFirstName(e.target?.value)
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLastName(e.target?.value)
              }
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessName">Business name</Label>
          <Input
            id="businessName"
            placeholder="Your Business Name"
            value={businessName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setBusinessName(e.target?.value);
              if (!storeSlug) {
                setStoreSlug(generateSlug(e.target?.value));
              }
            }}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Business email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@business.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target?.value);
              if (emailError) setEmailError(null);
            }}
            onBlur={() => {
              const err = validateEmail(email);
              if (err) setEmailError(err);
            }}
            required
            data-testid="auth-signup-email"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : undefined}
            className={emailError ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}
          />
          {emailError && (
            <p id="email-error" className="text-xs text-red-600 mt-1" role="alert">
              {emailError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target?.value)
              }
              required
              data-testid="auth-signup-password"
              aria-describedby="password-strength"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 h-8 w-8"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </Button>
          </div>
          <div id="password-strength">
            <PasswordStrengthIndicator password={password} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target?.value)
              }
              required
              aria-describedby="password-match-error"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 h-8 w-8"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </Button>
          </div>
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <p
              id="password-match-error"
              className="text-xs text-red-600 mt-1"
              role="alert"
            >
              Passwords do not match
            </p>
          )}
        </div>

        <div className="flex items-start gap-3">
          <Input
            id="terms-agreement"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAgreedToTerms(e.target?.checked)
            }
            className="w-5 h-5 mt-0.5 rounded border-gray-100 text-green-500 focus:ring-green-500 cursor-pointer"
          />
          <label htmlFor="terms-agreement" className="text-sm text-gray-500 cursor-pointer">
            By creating an account, you agree to our{" "}
            <Link
              href="/legal/terms"
              className="text-gray-900 font-medium underline"
            >
              Terms
            </Link>
            ,{" "}
            <Link
              href="/legal/privacy"
              className="text-gray-900 font-medium underline"
            >
              Privacy
            </Link>
            , and{" "}
            <Link
              href="/legal/eula"
              className="text-gray-900 font-medium underline"
            >
              EULA
            </Link>
            .
          </label>
        </div>

        <Button
          type="submit"
          isLoading={loading}
          className="w-full h-12"
          data-testid="auth-signup-submit"
        >
          {loading 
            ? "Creating account..." 
            : selectedPlan === "starter"
            ? "Create account — First month free"
            : `Create account & pay ${PLANS[selectedPlan].price}`}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="text-gray-900 font-semibold transition-colors"
        >
          Sign in
        </Link>
      </div>
    </SplitAuthLayout>
  );
}
