// @ts-nocheck
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Icon } from "@vayva/ui";
import { OTPInput } from "@/components/ui/OTPInput";
import { AuthService } from "@/services/auth";
import { SplitAuthLayout } from "@/components/auth/SplitAuthLayout";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@vayva/shared";
import Link from "next/link";
import type { User, MerchantContext } from "@vayva/shared/types";

interface VerifyOtpResponse {
  token: string;
  user: User;
  merchant?: MerchantContext | null;
}

const VerifyContent = () => {
  // const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const otpFromQuery = searchParams.get("otp") || "";
  const method = (searchParams.get("method") as "EMAIL" | "WHATSAPP") || "EMAIL";
  const maskedPhone = searchParams.get("maskedPhone") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (process.env?.NODE_ENV === "production") return;
    if (!otpFromQuery || otpFromQuery.length !== 6) return;
    setOtp(otpFromQuery);
    handleVerify(otpFromQuery);
  }, [otpFromQuery]);

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
      const response = await AuthService.verifyOTP(email, otpValue, selectedMethod);

      if (!response.success || !response.token) {
        throw new Error("Invalid verification code");
      }

      if (!response.user) {
        throw new Error("Missing user from verification response");
      }

      const { token, user, merchant } = response;
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
      title="Verify your account"
      subtitle={
        method === "WHATSAPP" && maskedPhone
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
          <button
            type="button"
            onClick={() => {
              setSelectedMethod("EMAIL");
              if (canResend) handleResend();
            }}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
              selectedMethod === "EMAIL"
                ? "border-black bg-black/5"
                : "border-studio-border hover:border-black/30"
            }`}
          >
            <Envelope className={`w-5 h-5 ${selectedMethod === "EMAIL" ? "text-black" : "text-gray-400"}`} />
            <span className={`text-sm font-medium ${selectedMethod === "EMAIL" ? "text-black" : "text-gray-500"}`}>
              Email
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedMethod("WHATSAPP");
              if (canResend) handleResend();
            }}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
              selectedMethod === "WHATSAPP"
                ? "border-black bg-black/5"
                : "border-studio-border hover:border-black/30"
            }`}
          >
            <WhatsappLogo className={`w-5 h-5 ${selectedMethod === "WHATSAPP" ? "text-black" : "text-gray-400"}`} />
            <span className={`text-sm font-medium ${selectedMethod === "WHATSAPP" ? "text-black" : "text-gray-500"}`}>
              WhatsApp
            </span>
          </button>
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
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${method === "WHATSAPP" ? "bg-green-500/10" : "bg-black/5"}`}>
          <Icon name={method === "WHATSAPP" ? "ChatCircle" : "Mail"} className={`w-8 h-8 ${method === "WHATSAPP" ? "text-green-600" : "text-black"}`} />
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
            className="text-sm text-gray-900 hover:text-black font-medium pl-0 pr-0"
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
        className="w-full !bg-black !text-white hover:!bg-black/90 !rounded-xl !h-12"
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
          "Verify account"
        )}
      </Button>

      {/* Help Text */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-xs text-gray-400">
          Didn't receive the code?{method === "EMAIL" && " Check your spam folder or"}{" "}
          <Button
            variant="link"
            onClick={handleResend}
            disabled={!canResend || resendLoading}
            className="text-gray-900 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed font-medium pl-0 pr-0 h-auto"
          >
            {resendLoading ? "sending..." : "request a new one"}
          </Button>
        </p>
        <p className="text-xs text-gray-400">
          Wrong {method === "WHATSAPP" ? "phone number" : "email"}?{" "}
          <Link
            href={`/signup${email ? `?email=${encodeURIComponent(email)}` : ""}`}
            className="text-gray-900 hover:text-black font-medium underline"
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
