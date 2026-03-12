"use client";

import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2024</p>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              By using HopeRise&apos;s website and services, you agree to these Terms of Service.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Donations</h2>
            <p className="text-gray-600 mb-6">
              All donations are final and non-refundable unless otherwise required by law. 
              Donations are tax-deductible to the extent allowed by law. You will receive 
              a receipt for tax purposes.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Volunteer Participation</h2>
            <p className="text-gray-600 mb-6">
              Volunteers participate at their own risk. HopeRise is not responsible for 
              personal injury, loss, or damage that may occur during volunteer activities. 
              Volunteers must follow all safety guidelines and instructions provided.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Use of Content</h2>
            <p className="text-gray-600 mb-6">
              All content on this website, including images, videos, and stories, is the 
              property of HopeRise or used with permission. You may not reproduce, distribute, 
              or use our content for commercial purposes without written consent.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Code of Conduct</h2>
            <p className="text-gray-600 mb-4">Users of our platform agree to:</p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Treat all community members with respect</li>
              <li>Not engage in harassment or discrimination</li>
              <li>Not use our platform for illegal activities</li>
              <li>Not impersonate others or provide false information</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Limitation of Liability</h2>
            <p className="text-gray-600 mb-6">
              HopeRise shall not be liable for any indirect, incidental, or consequential 
              damages arising from the use of our website or participation in our programs.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Contact</h2>
            <p className="text-gray-600">
              Questions about these terms? Contact legal@hoperise.org
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
