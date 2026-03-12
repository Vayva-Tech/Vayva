"use client";

import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HopeRise</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2024</p>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              HopeRise is committed to protecting your privacy. This policy explains how we collect, 
              use, and safeguard your personal information.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Contact information (name, email, phone)</li>
              <li>Donation and payment information</li>
              <li>Volunteer application details</li>
              <li>Communication preferences</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Process donations and send receipts</li>
              <li>Communicate about our programs and impact</li>
              <li>Coordinate volunteer activities</li>
              <li>Comply with legal and regulatory requirements</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Donor Privacy</h2>
            <p className="text-gray-600 mb-6">
              We respect donor privacy. We do not sell, trade, or share your personal information 
              with third parties for marketing purposes. Donor lists are never shared or sold.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              Questions about privacy? Contact privacy@hoperise.org
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          © 2024 HopeRise. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
