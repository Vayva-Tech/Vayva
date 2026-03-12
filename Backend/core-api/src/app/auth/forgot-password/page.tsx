"use client";

import { useState } from "react";
import { Button, Input, Icon } from "@vayva/ui";
import Link from "next/link";
import { VayvaLogo } from "@/components/VayvaLogo";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col pt-16 items-center">
      <Link href="/" className="mb-12">
        <VayvaLogo className="h-8" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-6"
      >
        {!isSubmitted ? (
          <>
            <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
            <p className="text-text-tertiary mb-8">
              Enter your email to receive recovery instructions.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  className="h-12"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
              <Icon name="Check" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Check your email</h2>
            <p className="text-text-tertiary mb-8">
              We've sent password reset instructions to <strong>{email}</strong>
              .
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsSubmitted(false)}
            >
              Use different email
            </Button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/signin"
            className="text-sm font-bold text-text-primary hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
