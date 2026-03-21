"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@vayva/ui";
import { urls } from "@vayva/shared";

export function TermsClient() {
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
              Terms of Service
            </h1>
            <p className="text-gray-500">
              Last updated: December 25, 2024
            </p>
          </div>

          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Agreement to Terms
              </h2>
              <p className="text-gray-500 leading-relaxed">
                By accessing and using Vayva ("the Platform"), you agree to be
                bound by these Terms of Service. If you do not agree to these
                terms, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Platform Description
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Vayva is a multi-vendor e-commerce platform that enables sellers
                to create online stores, manage products, process orders, and
                receive payments. We provide the technology infrastructure while
                sellers are responsible for their own products and customer
                service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Seller Obligations
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                As a seller on Vayva, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-500">
                <li>
                  Provide accurate information about your business and products
                </li>
                <li>
                  Complete KYC verification with valid BVN/NIN and
                  identification documents
                </li>
                <li>
                  Maintain accurate product listings with correct prices and
                  descriptions
                </li>
                <li>
                  Fulfill orders promptly and provide good customer service
                </li>
                <li>
                  Comply with all applicable Nigerian laws and regulations
                </li>
                <li>Not sell prohibited or illegal items</li>
                <li>Maintain the security of your account credentials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Payments and Fees
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    4.1 Payment Processing
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    All payments are processed through Paystack. By using our
                    platform, you agree to Paystack's terms and conditions.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    4.2 Platform Fees
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    Vayva charges a commission on each successful transaction.
                    Current fees will be communicated during onboarding and may
                    be updated with 30 days notice.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    4.3 Payouts
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    Sellers can request payouts to their verified bank accounts.
                    Payouts are subject to KYC verification and may be held for
                    security or compliance reasons.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Prohibited Activities
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                You may not use Vayva to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-500">
                <li>Sell counterfeit, stolen, or illegal products</li>
                <li>Engage in fraudulent activities or money laundering</li>
                <li>Violate intellectual property rights</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated tools to scrape or collect data</li>
                <li>Manipulate reviews or ratings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Account Suspension and Termination
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                We reserve the right to suspend or terminate your account if:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-500">
                <li>You violate these Terms of Service</li>
                <li>You engage in fraudulent or illegal activities</li>
                <li>Your account shows suspicious activity</li>
                <li>You fail to complete KYC verification</li>
                <li>Required by law or regulatory authorities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Intellectual Property
              </h2>
              <p className="text-gray-500 leading-relaxed">
                The Vayva platform, including its design, features, and content,
                is owned by Vayva and protected by intellectual property laws.
                You may not copy, modify, or distribute our platform without
                permission. Sellers retain ownership of their product content
                but grant us a license to display it on our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Liability and Disclaimers
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    8.1 Platform Availability
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    We strive to maintain 99.9% uptime but do not guarantee
                    uninterrupted access to the platform.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    8.2 Seller Responsibility
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    Sellers are solely responsible for their products, customer
                    service, and compliance with laws. Vayva is not liable for
                    seller actions or product quality.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    8.3 Limitation of Liability
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    Vayva's liability is limited to the fees paid by you in the
                    past 12 months. We are not liable for indirect, incidental,
                    or consequential damages.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Dispute Resolution
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Any disputes arising from these terms will be resolved through
                arbitration in Lagos, Nigeria, in accordance with Nigerian law.
                You agree to attempt mediation before pursuing legal action.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Changes to Terms
              </h2>
              <p className="text-gray-500 leading-relaxed">
                We may update these Terms of Service from time to time. We will
                notify you of significant changes via email or platform
                notification. Continued use of the platform after changes
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                11. Governing Law
              </h2>
              <p className="text-gray-500 leading-relaxed">
                These Terms of Service are governed by the laws of the Federal
                Republic of Nigeria. Any legal proceedings must be brought in
                the courts of Lagos, Nigeria.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                12. Contact Information
              </h2>
              <p className="text-gray-500 leading-relaxed">
                For questions about these Terms of Service, please contact us
                at:
              </p>
              <div className="mt-4 p-4 bg-white  rounded-lg border border-gray-100">
                <p className="text-gray-900 font-medium">{`Email: legal@${urls.storefrontRoot()}`}</p>
                <p className="text-gray-500 mt-2">
                  Address: Lagos, Nigeria
                </p>
              </div>
            </section>

            <section className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Acceptance
              </h2>
              <p className="text-gray-500 leading-relaxed">
                By creating an account and using Vayva, you acknowledge that you
                have read, understood, and agree to be bound by these Terms of
                Service and our Privacy Policy.
              </p>
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
