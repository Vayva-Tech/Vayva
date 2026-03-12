"use client";

import React, { useState } from "react";
import { Button } from "@vayva/ui";

export function NewsletterForm(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("submitting");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to subscribe");

      setStatus("success");
      setEmail("");
    } catch (error) {
      console.error("Newsletter error:", error);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-foreground font-bold text-lg mb-2">
          You're subscribed!
        </p>
        <p className="text-muted-foreground text-sm">
          Check your inbox for a confirmation email.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
    >
      <input
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={status === "submitting"}
        className="bg-muted/50 border border-border rounded-xl px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary flex-1 disabled:opacity-50"
      />
      <Button
        type="submit"
        disabled={status === "submitting"}
        className="bg-primary hover:bg-primary-hover text-white rounded-xl px-8 disabled:opacity-50"
      >
        {status === "submitting" ? "Subscribing..." : "Subscribe"}
      </Button>
      {status === "error" && (
        <p className="text-red-400 text-sm text-center sm:text-left w-full mt-2">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
