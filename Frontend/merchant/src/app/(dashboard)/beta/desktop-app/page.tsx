"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiJson } from "@/lib/api-client-shared";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Monitor, Smartphone, Clock, ListChecks } from "lucide-react";
import { toast } from "sonner";

type Interest = "desktop" | "mobile" | "both";

export default function BetaDesktopAppPage() {
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState<Interest>("both");
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const me = await apiJson<{ email?: string; user?: { email?: string } }>("/me");
        const resolved = me.email ?? me.user?.email;
        if (!cancelled && resolved) setEmail(resolved);
      } catch {
        /* optional prefill */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiJson("/beta/desktop-app-waitlist", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), interest }),
      });
      setJoined(true);
      toast.success("You are on the waitlist. We will email you when apps are ready.");
    } catch {
      toast.error("Could not join the waitlist. Check your email and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardPageShell
        title="Native apps"
        description="Join the waitlist for desktop and mobile merchant apps"
        actions={
          <Badge variant="secondary" className="font-normal shrink-0">
            Beta · coming soon
          </Badge>
        }
      >
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <Clock className="h-6 w-6 text-amber-700 mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-950 mb-1">Coming soon</h3>
                <p className="text-sm text-amber-900/90">
                  Desktop and mobile apps are in active development. The web dashboard remains the
                  full-featured experience today. Add your email below to get notified at launch.
                </p>
              </div>
            </div>
          </motion.div>

          <Card className="border-gray-200 shadow-md max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListChecks className="h-5 w-5" />
                Waitlist
              </CardTitle>
              <CardDescription>
                We will only use this to tell you when native apps are available for your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {joined ? (
                <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  You are on the list. Thank you — watch your inbox for updates from Vayva.
                </p>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="waitlist-email">Work email</Label>
                    <Input
                      id="waitlist-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                    />
                  </div>
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium text-gray-900">I am most interested in</legend>
                    <div className="flex flex-col gap-2">
                      {(
                        [
                          { value: "desktop" as const, label: "Desktop (Windows & macOS)" },
                          { value: "mobile" as const, label: "Mobile (iOS & Android)" },
                          { value: "both" as const, label: "Both" },
                        ] as const
                      ).map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center gap-2 text-sm cursor-pointer rounded-lg border border-gray-200 px-3 py-2 has-[:checked]:border-green-500 has-[:checked]:bg-green-50/50"
                        >
                          <input
                            type="radio"
                            name="interest"
                            value={opt.value}
                            checked={interest === opt.value}
                            onChange={() => setInterest(opt.value)}
                            className="text-green-600"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
                    {submitting ? "Joining…" : "Join waitlist"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gray-200">
              <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-t-xl">
                <div className="flex items-center gap-3">
                  <Monitor className="h-8 w-8" />
                  <div>
                    <CardTitle className="text-white">Desktop</CardTitle>
                    <CardDescription className="text-gray-100">Offline-first workflows</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">
                  Faster bulk actions, local caching, and a focused window for day-to-day merchant
                  operations.
                </p>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-t-xl">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-8 w-8" />
                  <div>
                    <CardTitle className="text-white">Mobile</CardTitle>
                    <CardDescription className="text-gray-100">On the go</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">
                  Orders, notifications, and key metrics with the same permissions as the web
                  dashboard.
                </p>
              </CardContent>
            </Card>
          </div>

          <p className="text-xs text-gray-500 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Questions?{" "}
            <a href="mailto:support@vayva.ng" className="text-green-700 underline underline-offset-2">
              support@vayva.ng
            </a>
          </p>
        </div>
      </DashboardPageShell>
    </motion.div>
  );
}
