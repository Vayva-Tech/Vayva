"use client";

import { urls } from "@vayva/shared";
import React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export function GlobalFooter() {
  return (
    <footer className="bg-white text-gray-900 border-t border-gray-100">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Column 1 - Brand */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Logo size="sm" showText href="/" />
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Vayva is an operating system for businesses that sell on WhatsApp.
              We help African merchants turn conversations into orders,
              payments, deliveries, and reliable business records.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4">
              <a
                href="https://twitter.com/vayva"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors"
                aria-label="X (Twitter)"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
                  />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/vayva"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"
                  />
                  <circle
                    cx="4"
                    cy="4"
                    r="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </a>
              <a
                href="https://instagram.com/vayva"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="5"
                    ry="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"
                  />
                  <line
                    x1="17.5"
                    y1="6.5"
                    x2="17.51"
                    y2="6.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </a>
              <a
                href="https://facebook.com/vayva"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 - Product */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/how-vayva-works"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  How Vayva Works
                </Link>
              </li>
              <li>
                <Link
                  href="/features"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/templates"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  Templates
                </Link>
              </li>
              <li>
                <Link
                  href="/store-builder"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  Store Builder
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Company */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  About Vayva
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Support */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/help"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/status"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  System Status
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5 - Legal & Compliance */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Legal & Compliance
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/legal"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  Legal Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/acceptable-use"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  Acceptable Use
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/prohibited-items"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  Prohibited Items
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/refund-policy"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/kyc-safety"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  KYC & Safety
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookies"
                  className="text-sm text-gray-400 hover:text-green-500 transition-colors"
                >
                  Manage Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 pt-12 border-t border-gray-100">
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Stay updated.</h3>
            <p className="text-sm text-gray-400 mb-4">
              Product updates, operational insights, and platform announcements.
              No noise.
            </p>

            <div className="p-4 bg-white border border-gray-100 rounded text-sm text-gray-400">
              Newsletter updates are currently paused.
              <br />
              Contact{" "}
              <a
                href={`mailto:${urls.supportEmail()}`}
                className="text-green-500 hover:underline"
              >
                {urls.supportEmail()}
              </a>{" "}
              for inquiries.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2025 Vayva Inc. Built for Africa.
            </p>
            <div className="flex gap-6">
              <Link
                href="/legal/privacy"
                className="text-sm text-gray-400 hover:text-green-500 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/legal/terms"
                className="text-sm text-gray-400 hover:text-green-500 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
