"use client";

import { useState, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { StoreShell } from "@/components/StoreShell";
import { Button } from "@vayva/ui";
import { LockKey as Lock, ArrowRight, Spinner as Loader2, Envelope as Mail, PencilSimple as PenTool } from "@phosphor-icons/react/ssr";
import Link from "next/link";

export default function RegisterPage(): React.JSX.Element {
  const { store } = useStore();
  const router = useRouter();
  const params = useParams();
  const lang = (params.lang as string) || "en";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: store?.id,
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // API sets httpOnly cookie.
      localStorage.setItem(
        "vayva_user",
        JSON.stringify(
          data.customer || {
            email: form.email,
            name: `${form.firstName} ${form.lastName}`,
          },
        ),
      );

      router.push(`/${lang}/account`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Registration failed");
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
            Join {store.name}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href={`/${lang}/account/login`}
              className="font-medium text-black hover:text-gray-800 underline transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="glass-panel py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 relative overflow-hidden">
            {/* Decorative Gradient Blob */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl pointer-events-none"></div>

            <form className="space-y-6 relative z-10" onSubmit={handleRegister}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 animate-shake">
                  <span>⚠️</span> {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="reg-first-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PenTool className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="reg-first-name"
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setForm({ ...form, firstName: e.target.value })
                      }
                      className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-black focus:border-black sm:text-sm py-3"
                      placeholder="Jane"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="reg-last-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      id="reg-last-name"
                      type="text"
                      required
                      value={form.lastName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setForm({ ...form, lastName: e.target.value })
                      }
                      className="block w-full border-gray-300 rounded-xl focus:ring-black focus:border-black sm:text-sm py-3 px-4"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-black focus:border-black sm:text-sm py-3"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={form.password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-black focus:border-black sm:text-sm py-3"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-confirm-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="reg-confirm-password"
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-black focus:border-black sm:text-sm py-3"
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed h-auto"
                  aria-label={isLoading ? "Creating account" : "Create account"}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      Create Account <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
