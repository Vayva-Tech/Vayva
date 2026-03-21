"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@vayva/ui";
import { urls } from "@vayva/shared";

export function PrivacyClient() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white  sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-green-500">
            Vayva
          </Link>
          <Link href="/signin">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-500">
              Last updated: December 25, 2024
            </p>
          </div>

          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Welcome to Vayva. We respect your privacy and are committed to
                protecting your personal data. This privacy policy will inform
                you about how we look after your personal data when you visit
                our platform and tell you about your privacy rights and how the
                law protects you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Information We Collect
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                We collect and process the following types of information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-500">
                <li>
                  <strong className="text-gray-900">Identity Data:</strong>{" "}
                  Name, email address, phone number
                </li>
                <li>
                  <strong className="text-gray-900">Financial Data:</strong>{" "}
                  Bank account details, BVN/NIN for KYC verification
                </li>
                <li>
                  <strong className="text-gray-900">
                    Transaction Data:
                  </strong>{" "}
                  Details about payments and transactions
                </li>
                <li>
                  <strong className="text-gray-900">Technical Data:</strong>{" "}
                  IP address, browser type, device information
                </li>
                <li>
                  <strong className="text-gray-900">Usage Data:</strong>{" "}
                  Information about how you use our platform
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                We use your personal data for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-500">
                <li>To provide and maintain our service</li>
                <li>To process your transactions and manage payments</li>
                <li>To verify your identity (KYC compliance)</li>
                <li>To send you important notifications about your account</li>
                <li>To improve our platform and user experience</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Data Security
              </h2>
              <p className="text-gray-500 leading-relaxed">
                We have implemented appropriate security measures to prevent
                your personal data from being accidentally lost, used, or
                accessed in an unauthorized way. We use industry-standard
                encryption and secure payment processing through Paystack.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Data Sharing
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                We may share your data with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-500">
                <li>
                  <strong className="text-gray-900">
                    Payment Processors:
                  </strong>{" "}
                  Paystack for payment processing
                </li>
                <li>
                  <strong className="text-gray-900">Email Service:</strong>{" "}
                  Resend for transactional emails
                </li>
                <li>
                  <strong className="text-gray-900">
                    Legal Authorities:
                  </strong>{" "}
                  When required by law
                </li>
              </ul>
              <p className="text-gray-500 leading-relaxed mt-4">
                We never sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Your Rights
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                Under Nigerian data protection laws, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-500">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Request transfer of your data</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Cookies
              </h2>
              <p className="text-gray-500 leading-relaxed">
                We use cookies and similar tracking technologies to track
                activity on our platform and hold certain information. You can
                instruct your browser to refuse all cookies or to indicate when
                a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Data Retention
              </h2>
              <p className="text-gray-500 leading-relaxed">
                We will retain your personal data only for as long as necessary
                for the purposes set out in this privacy policy. We will retain
                and use your data to comply with our legal obligations, resolve
                disputes, and enforce our agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Our service is not intended for anyone under the age of 18. We
                do not knowingly collect personal information from children
                under 18.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Changes to This Policy
              </h2>
              <p className="text-gray-500 leading-relaxed">
                We may update our privacy policy from time to time. We will
                notify you of any changes by posting the new privacy policy on
                this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                11. Contact Us
              </h2>
              <p>
                For privacy concerns, contact:{" "}
                <a
                  href={`mailto:privacy@${urls.storefrontRoot()}`}
                >{`privacy@${urls.storefrontRoot()}`}</a>
              </p>
              <p className="text-gray-500 leading-relaxed">
                If you have any questions about this privacy policy, please
                contact us at:
              </p>
              <div className="mt-4 p-4 bg-white  rounded-lg border border-gray-100">
                <p className="text-gray-900 font-medium">
                  {`Email: privacy@${urls.storefrontRoot()}`}
                </p>
                <p className="text-gray-500 mt-2">
                  Address: Lagos, Nigeria
                </p>
              </div>
            </section>
          </div>

          {/* Back to Home */}
          <div className="pt-8 border-t border-gray-100">
            <Link href="/">
              <Button variant="outline">← Back to Home</Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© 2024 Vayva. All rights reserved.</p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="hover:text-green-500 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-green-500 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="hover:text-green-500 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
