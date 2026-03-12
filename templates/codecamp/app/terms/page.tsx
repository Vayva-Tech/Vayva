"use client";

import { Code, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2024</p>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-400 mb-6">
              By accessing or using CodeCamp, you agree to be bound by these Terms of Service.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Use of Service</h2>
            <p className="text-gray-400 mb-6">
              CodeCamp provides an online learning platform for coding and technology education. 
              You must be at least 13 years old to use our services.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Account Registration</h2>
            <p className="text-gray-400 mb-6">
              You are responsible for maintaining the security of your account and password. 
              CodeCamp cannot and will not be liable for any loss or damage from your failure 
              to comply with this security obligation.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Payment Terms</h2>
            <p className="text-gray-400 mb-6">
              Some features require payment. By subscribing to a paid plan, you agree to pay 
              all applicable fees. You may cancel your subscription at any time, but no refunds 
              will be provided for partial months.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Content Ownership</h2>
            <p className="text-gray-400 mb-6">
              Code content you submit remains yours. By submitting code to our platform, you 
              grant us the right to store, display, and process it for the purpose of providing 
              our educational services.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Prohibited Activities</h2>
            <p className="text-gray-400 mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-400 mb-6 space-y-2">
              <li>Use the platform for illegal activities</li>
              <li>Share account credentials with others</li>
              <li>Attempt to circumvent our security measures</li>
              <li>Upload malicious code or content</li>
              <li>Harass or abuse other users</li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Termination</h2>
            <p className="text-gray-400 mb-6">
              We may terminate or suspend your account for violations of these terms. 
              Upon termination, your access to the platform will cease immediately.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. Contact</h2>
            <p className="text-gray-400">
              Questions? Contact us at legal@codecamp.com
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
