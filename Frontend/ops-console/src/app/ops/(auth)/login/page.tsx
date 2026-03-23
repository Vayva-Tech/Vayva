"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ShieldCheck, 
  Spinner as Loader2, 
  Eye, 
  EyeSlash as EyeOff, 
  WarningCircle as AlertCircle, 
  LockKey as Lock, 
  Shield,
  ArrowRight
} from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { FormField, FormInput } from "@/components/ops/Form";
import Image from "next/image";

function LoginContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isProd = process.env.NODE_ENV === "production";
  const envLabel = isProd ? "PRODUCTION" : "STAGING";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ops/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          mfaCode: requiresMfa ? mfaCode : undefined,
        }),
      });

      // Guard against non-JSON responses (e.g. HTML error pages)
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          res.status >= 500
            ? "Server error — please try again in a moment."
            : `Unexpected response (${res.status}). Please refresh and try again.`
        );
      }

      const data = await res.json();

      if (!res.ok && res.status !== 202) {
        // Extract error message from standardized error response
        const errorMessage = data?.error?.message || data?.error || "Invalid credentials";
        throw new Error(typeof errorMessage === 'string' ? errorMessage : String(errorMessage));
      }

      // MFA required - show MFA input
      if (data.requiresMfa) {
        setRequiresMfa(true);
        setTempToken(data.tempToken);
        setLoading(false);
        return;
      }

      const next = searchParams.get("next");
      let destination = "/ops";

      if (next) {
        if (next.startsWith("/ops") && !next.includes("//")) {
          destination = next;
        }
      }

      router.push(destination);
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px]">
      {/* Logo & Branding */}
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Image
            src="/vayva-logo-official.svg"
            alt="Vayva"
            width={48}
            height={33}
            className="object-contain"
          />
          <div className="flex flex-col">
            <h2 className="text-slate-900 text-lg font-bold tracking-tight">
              Vayva Ops
            </h2>
            <p className="text-slate-500 text-xs font-medium tracking-wide uppercase">
              Internal Platform
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isProd
              ? "bg-red-100 text-red-700 border border-red-200"
              : "bg-amber-100 text-amber-700 border border-amber-200"
          }`}
        >
          {envLabel}
        </span>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                {requiresMfa ? "Two-Factor Authentication" : "Welcome back"}
              </h1>
            </div>
          </div>
          <p className="text-sm text-slate-500 ml-[52px]">
            {requiresMfa 
              ? "Enter the 6-digit code from your authenticator app" 
              : "Sign in to access the operations dashboard"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="px-8 pt-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2.5">
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* MFA Info Banner */}
        {requiresMfa && (
          <div className="px-8 pt-6">
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2.5">
              <Shield className="shrink-0 mt-0.5" size={16} />
              <span>Additional security verification required for this account.</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="px-8 py-6 space-y-5">
          {!requiresMfa ? (
            <>
              <FormField
                label="Email address"
                htmlFor="ops-email"
                required
              >
                <FormInput
                  id="ops-email"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  placeholder="ops@vayva.ng"
                  className="w-full h-11 px-4 rounded-xl bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 hover:border-slate-300 transition-colors"
                />
              </FormField>

              <FormField
                label="Password"
                htmlFor="ops-password"
                required
              >
                <div className="relative">
                  <FormInput
                    id="ops-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                    placeholder="••••••••••"
                    className="w-full h-11 px-4 pr-11 rounded-xl bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 hover:border-slate-300 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </FormField>
            </>
          ) : (
            <FormField
              label="Authentication code"
              htmlFor="ops-mfa"
              required
            >
              <FormInput
                id="ops-mfa"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={mfaCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                disabled={loading}
                autoComplete="one-time-code"
                placeholder="000000"
                autoFocus
                className="w-full h-11 px-4 rounded-xl bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 text-center tracking-[0.5em] font-mono text-lg"
              />
              <p className="text-xs text-slate-400 mt-2 text-center">
                Open your authenticator app to view the 6-digit code
              </p>
            </FormField>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98] transition-all"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <span>{requiresMfa ? "Verify Code" : "Sign In"}</span>
                <ArrowRight size={16} />
              </>
            )}
          </Button>

          {requiresMfa && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setRequiresMfa(false);
                setMfaCode("");
                setTempToken(null);
              }}
              disabled={loading}
              className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-sm"
            >
              Back to sign in
            </Button>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Lock size={12} className="text-slate-400" />
            <p className="text-[11px] text-slate-400">
              Secured with 256-bit encryption
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} Vayva
          </p>
        </div>
      </div>

      {/* Help text */}
      <p className="text-center text-xs text-slate-400 mt-6">
        Having trouble? Contact{" "}
        <a href="mailto:ops@vayva.ng" className="text-emerald-600 hover:text-emerald-700 hover:underline">
          ops@vayva.ng
        </a>
      </p>
    </div>
  );
}

export default function OpsLoginPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
