"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Icon, Label } from "@vayva/ui";
import { Envelope, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { OTPInput } from "@/components/ui/OTPInput";
import { AuthService } from "@/services/auth";
import { SplitAuthLayout } from "@/components/auth/SplitAuthLayout";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@vayva/shared";
import Link from "next/link";
import type { User, MerchantContext } from "@vayva/shared/types";

const VerifyContent = () => {
  const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";
  const otpFromQuery = searchParams?.get("otp") || "";
  const plan = searchParams?.get("plan") || null;
  const method =
    (searchParams?.get("method") as "EMAIL" | "WHATSAPP") || "EMAIL";
  const maskedPhone = searchParams?.get("maskedPhone") || "";

  const [selectedMethod, setSelectedMethod] = useState<"EMAIL" | "WHATSAPP">(
    method === "WHATSAPP" ? "WHATSAPP" : "EMAIL",
  );

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    setSelectedMethod(method === "WHATSAPP" ? "WHATSAPP" : "EMAIL");
  }, [method]);

  useEffect(() => {
    if (!email.trim()) {
      router.replace("/signin");
    }
  }, [email, router]);

  useEffect(() => {
    if (process.env?.NODE_ENV === "production") return;
    if (!email.trim()) return;
    if (!otpFromQuery || otpFromQuery.length !== 6) return;
    setOtp(otpFromQuery);
    handleVerify(otpFromQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dev-only auto-verify from query
  }, [otpFromQuery, email]);

  // Auto-focus first OTP input on mount
  useEffect(() => {
    const firstInput = document.querySelector(
      'input[aria-label="Digit 1"]',
    ) as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleVerify = async (otpValue: string) => {
    setLoading(true);
    setError(null);

    try {
      let rememberMe = false;
      try {
        rememberMe =
          typeof window !== "undefined" &&
          sessionStorage.getItem("vayva_auth_remember_me") === "1";
      } catch {
        /* ignore */
      }

      const response = await AuthService.verifyOTP(
        email,
        otpValue,
        selectedMethod,
        rememberMe,
      );

      if (!response.success || !response.token) {
        throw new Error("Invalid verification code");
      }

      if (!response.user) {
        throw new Error("Missing user from verification response");
      }

      try {
        sessionStorage.removeItem("vayva_auth_remember_me");
      } catch {
        /* ignore */
      }

      const { token, user, merchant } = response;
      
      // Store plan in sessionStorage for post-onboarding checkout redirect
      if (plan && ["pro", "pro_plus"].includes(plan)) {
        try {
          sessionStorage.setItem("vayva_post_onboarding_plan", plan);
          sessionStorage.setItem("vayva_post_onboarding_email", email);
        } catch {
          /* ignore storage errors */
        }
      }
      
      login(token, user as unknown as User, (merchant || null) as unknown as MerchantContext | null);
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[VERIFY_OTP_ERROR]", { error: _errMsg, app: "merchant" });
      setError(_errMsg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendLoading) return;

    setResendLoading(true);
    try {
      await AuthService.resendCode({ email, method: selectedMethod });
      setResendTimer(30);
      setCanResend(false);
      setError(null);
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[RESEND_OTP_ERROR]", { error: _errMsg, app: "merchant" });
      setError(_errMsg || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SplitAuthLayout
      stepIndicator="Step 2/2"
      title={
        plan && ["pro", "pro_plus"].includes(plan)
          ? `Verify & Activate Your ${plan === "pro" ? "Pro" : "Pro+"} Plan`
          : "Verify your account"
      }
      subtitle={
        plan && ["pro", "pro_plus"].includes(plan)
          ? "After verification, you'll complete a one-time business setup (15-20 min), then activate your paid plan."
          : method === "WHATSAPP" && maskedPhone
          ? `We sent a 6-digit code to ${maskedPhone}`
          : `We sent a 6-digit code to ${email || "your email"}`
      }
      showSignInLink
      leftVariant="support"
    >
      {/* Method Selection */}
      <div className="mb-6">
        <Label className="mb-3 block">Receive code via</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            onClick={() => {
              setSelectedMethod("EMAIL");
              if (canResend) handleResend();
            }}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
              selectedMethod === "EMAIL"
                ? "border-green-500 bg-green-500/5"
                : "border-gray-200 hover:border-green-200"
            }`}
          >
            <Envelope className={`w-5 h-5 ${selectedMethod === "EMAIL" ? "text-green-600" : "text-gray-400"}`} />
            <span className={`text-sm font-medium ${selectedMethod === "EMAIL" ? "text-gray-900" : "text-gray-500"}`}>
              Email
            </span>
          </Button>
          <Button
            type="button"
            onClick={() => {
              setSelectedMethod("WHATSAPP");
              if (canResend) handleResend();
            }}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
              selectedMethod === "WHATSAPP"
                ? "border-green-500 bg-green-500/5"
                : "border-gray-200 hover:border-green-200"
            }`}
          >
            <WhatsappLogo className={`w-5 h-5 ${selectedMethod === "WHATSAPP" ? "text-green-600" : "text-gray-400"}`} />
            <span className={`text-sm font-medium ${selectedMethod === "WHATSAPP" ? "text-gray-900" : "text-gray-500"}`}>
              WhatsApp
            </span>
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          {selectedMethod === "EMAIL"
            ? "We'll send the code to your email"
            : maskedPhone
            ? `We'll send the code to ${maskedPhone}`
            : "We'll send the code to your WhatsApp number"}
        </p>
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-500/10">
          <Icon name={method === "WHATSAPP" ? "ChatCircle" : "Mail"} className="w-8 h-8 text-green-600" />
        </div>
      </div>

      {/* OTP Input */}
      <div className="mb-6" data-testid="auth-verify-otp-container">
        {/* Live region for screen readers */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {error && <p role="alert">{error}</p>}
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl text-center">
            {error}
          </div>
        )}

        <OTPInput
          value={otp}
          onChange={setOtp}
          onComplete={handleVerify}
          disabled={loading}
          error={!!error}
        />
      </div>

      {/* Resend Code */}
      <div className="text-center mb-6">
        {canResend ? (
          <Button
            variant="link"
            onClick={handleResend}
            disabled={resendLoading}
            className="text-sm text-green-700 hover:text-green-800 font-medium pl-0 pr-0"
          >
            {resendLoading ? (
              <>
                <Icon name="Loader2" className="w-4 h-4 animate-spin mr-1" />
                Sending...
              </>
            ) : (
              "Resend code"
            )}
          </Button>
        ) : (
          <p className="text-sm text-gray-400">
            Resend code in {resendTimer}s
          </p>
        )}
      </div>

      {/* Verify Button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full rounded-xl h-12"
        onClick={() => handleVerify(otp)}
        disabled={loading || otp.length !== 6}
        data-testid="auth-verify-submit"
      >
        {loading ? (
          <>
            <Icon name="Loader2" className="w-5 h-5 animate-spin" />
            Verifying...
          </>
        ) : (
          plan && ["pro", "pro_plus"].includes(plan)
            ? `Verify & Continue to Setup`
            : "Verify account"
        )}
      </Button>

      {/* Skip to Checkout Option for Pro/Pro+ */}
      {plan && ["pro", "pro_plus"].includes(plan) && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-emerald-50 rounded-xl border border-purple-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Icon name="Lightning" className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-purple-900">
                Fast-Track Your Activation
              </h4>
              <p className="text-xs text-purple-700 mt-1">
                You can skip the business setup and activate your {plan === "pro" ? "Pro" : "Pro+"} plan now. 
                The setup can be completed later from your dashboard.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    router.push(`/checkout?plan=${plan}&email=${email}`);
                  }}
                  className="flex-1"
                >
                  ⚡ Skip to Payment & Activate Now
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    // User chooses to do setup first - they'll be redirected by auth context
                  }}
                  className="flex-1"
                >
                  Complete Setup First
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-xs text-gray-400">
          Didn't receive the code?{method === "EMAIL" && " Check your spam folder or"}{" "}
          <Button
            variant="link"
            onClick={handleResend}
            disabled={!canResend || resendLoading}
            className="text-green-700 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium pl-0 pr-0 h-auto"
          >
            {resendLoading ? "sending..." : "request a new one"}
          </Button>
        </p>
        <p className="text-xs text-gray-400">
          Wrong {method === "WHATSAPP" ? "phone number" : "email"}?{" "}
          <Link
            href={`/signup${email ? `?email=${encodeURIComponent(email)}` : ""}`}
            className="text-green-700 hover:text-green-800 font-medium underline"
          >
            Go back to update
          </Link>
        </p>
      </div>
    </SplitAuthLayout>
  );
};

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <SplitAuthLayout
          title="Verify your account"
          subtitle="Please wait"
          showSignInLink
          leftVariant="support"
        >
          <div className="flex justify-center py-12">
            <Icon
              name="Loader2"
              className="w-8 h-8 animate-spin text-gray-400"
            />
          </div>
        </SplitAuthLayout>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
