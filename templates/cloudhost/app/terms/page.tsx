"use client";

import { Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CloudHost</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2024</p>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              By accessing or using CloudHost services, you agree to be bound by these Terms of Service. 
              Please read them carefully before using our platform.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-6">
              By accessing or using our services, you agree to these Terms of Service and all applicable 
              laws and regulations. If you do not agree with any of these terms, you are prohibited 
              from using or accessing this site.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Use License</h2>
            <p className="text-gray-600 mb-4">
              Permission is granted to temporarily use CloudHost services for personal or business 
              website hosting, subject to the following restrictions:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>You may not use the service for illegal activities</li>
              <li>You may not transmit malware or harmful code</li>
              <li>You may not attempt to gain unauthorized access to our systems</li>
              <li>You may not use excessive resources that impact other users</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Account Registration</h2>
            <p className="text-gray-600 mb-6">
              To access certain features, you must register for an account. You agree to provide 
              accurate information and maintain the security of your account credentials. You are 
              responsible for all activities that occur under your account.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Payment and Billing</h2>
            <p className="text-gray-600 mb-6">
              Some services require payment. By selecting a paid plan, you agree to pay all fees 
              in accordance with the pricing displayed. All payments are non-refundable unless 
              otherwise stated in our refund policy.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Service Availability</h2>
            <p className="text-gray-600 mb-6">
              We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. 
              We reserve the right to suspend service for maintenance or security updates. 
              Scheduled maintenance will be communicated in advance.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-600 mb-6">
              CloudHost shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages arising from your use of the service. Our liability is limited 
              to the amount you paid for the service in the 12 months preceding the incident.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Termination</h2>
            <p className="text-gray-600 mb-6">
              We may terminate or suspend your account immediately for violations of these terms. 
              Upon termination, your right to use the service will immediately cease.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Changes to Terms</h2>
            <p className="text-gray-600 mb-6">
              We reserve the right to modify these terms at any time. We will notify users of 
              significant changes via email or through the platform. Continued use of the service 
              after changes constitutes acceptance of the new terms.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Contact Information</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms of Service, please contact us at 
              legal@cloudhost.com
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          © 2024 CloudHost. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
