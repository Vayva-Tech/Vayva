"use client";

import { Code, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navigation */}
      <nav className="border-b border-dark-700 bg-dark-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-primary-500">CodeCamp</Link>
            <Link href="/" className="text-gray-300 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2024</p>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-400 mb-6">
              At CodeCamp, we take your privacy seriously. This Privacy Policy describes how we collect, use, 
              and protect your personal information when you use our educational platform.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Information We Collect</h2>
            <p className="text-gray-400 mb-4">We collect information you provide directly to us, including:</p>
            <ul className="list-disc list-inside text-gray-400 mb-6 space-y-2">
              <li>Account information (name, email, password)</li>
              <li>Payment information (processed securely by our payment providers)</li>
              <li>Learning progress and course completions</li>
              <li>Communications with our support team</li>
              <li>Code submissions and project uploads</li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">How We Use Your Information</h2>
            <p className="text-gray-400 mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-400 mb-6 space-y-2">
              <li>Provide and personalize our educational services</li>
              <li>Track your learning progress and issue certificates</li>
              <li>Process your payments and manage your subscription</li>
              <li>Send you course updates and recommendations</li>
              <li>Improve our platform and create new content</li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Data Security</h2>
            <p className="text-gray-400 mb-6">
              We implement industry-standard security measures to protect your data. All data is encrypted 
              in transit using TLS and sensitive data is encrypted at rest.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Your Rights</h2>
            <p className="text-gray-400 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-400 mb-6 space-y-2">
              <li>Access and download your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Export your learning progress</li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-400">
              Questions about this Privacy Policy? Contact us at privacy@codecamp.com
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-700 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          © 2024 CodeCamp. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
