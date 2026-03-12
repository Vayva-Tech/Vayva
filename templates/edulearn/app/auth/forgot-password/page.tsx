"use client";

import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password reset logic here
    console.log("Password reset requested", { email });
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-gray-500 mt-1">
            {isSubmitted 
              ? "Check your email for reset instructions" 
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Email sent!</h2>
            <p className="text-gray-500 mb-6">
              We&apos;ve sent a password reset link to <strong>{email}</strong>. 
              Please check your inbox and follow the instructions.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => setIsSubmitted(false)}
                className="w-full btn-secondary"
              >
                Try another email
              </button>
              <Link href="/auth/login">
                <button className="w-full btn-primary">
                  Back to login
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full btn-primary py-3">
                Send Reset Link
              </button>
            </form>

            <Link 
              href="/auth/login"
              className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>

            {/* Help */}
            <div className="mt-8 p-4 bg-gray-100 rounded-xl">
              <h3 className="font-medium text-gray-900 mb-2 text-sm">Need help?</h3>
              <p className="text-sm text-gray-600 mb-3">
                If you&apos;re having trouble resetting your password, contact our support team.
              </p>
              <Link 
                href="/support" 
                className="text-sm text-gray-900 hover:underline font-medium"
              >
                Contact Support →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
