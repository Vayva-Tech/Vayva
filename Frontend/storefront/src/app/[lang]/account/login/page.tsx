"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { StoreShell } from "@/components/StoreShell";
import { Button } from "@vayva/ui";
import { User, LockKey as Lock, ArrowRight, Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import Link from "next/link";

export default function LoginPage(): React.JSX.Element {
  const { store } = useStore();
  const router = useRouter();
  const params = useParams();
  const lang = (params.lang as string) || "en";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: store?.id,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      // Success: API sets httpOnly cookie. We just set local state for UI.
      localStorage.setItem("vayva_user", JSON.stringify(data.customer));
      router.push(`/${lang}/account`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!store) return <></>;

  return (
    <StoreShell>
      <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-noise bg-background/40 backdrop-blur-sm">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Log in to {store.name}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href={`/${lang}/account/register`}
              className="font-medium text-black hover:text-gray-800 underline transition-colors"
            >
              create an account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="glass-panel py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 relative overflow-hidden">
            {/* Decorative Gradient Blob */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none"></div>

            <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 animate-shake">
                  <span>⚠️</span> {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-black focus:border-black sm:text-sm py-3 transition-shadow"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                    className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-black focus:border-black sm:text-sm py-3 transition-shadow"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-black hover:text-gray-800"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed h-auto"
                  aria-label={isLoading ? "Signing in" : "Sign in"}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      Sign in <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {process.env.NODE_ENV !== "production" && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-background/70 backdrop-blur-xl text-gray-500">
                      Dev Credentials
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-center text-xs text-gray-400">
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">
                    demo@vayva.ng
                  </span>{" "}
                  /{" "}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">
                    demo
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
