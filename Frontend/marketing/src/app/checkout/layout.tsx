import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Checkout | Vayva",
  description: "Complete your Vayva subscription purchase securely.",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      {/* Green Gradient Blur Background - subtle on white */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Top-left gradient */}
        <div 
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.1) 40%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        {/* Bottom-right gradient */}
        <div 
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.08) 40%, transparent 70%)',
            filter: 'blur(120px)',
          }}
        />
      </div>

      {/* Minimal Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image 
              src="/vayva-logo-official.svg" 
              alt="Vayva" 
              width={100} 
              height={32}
              className="h-7 w-auto"
            />
          </Link>
          
          <div className="text-sm text-slate-500">
            Powered by Paystack
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 py-8 sm:py-12">
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 bg-white border-t border-slate-200 py-6">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>© 2026 Vayva. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/legal/privacy" className="hover:text-slate-700 transition-colors">Privacy</Link>
              <Link href="/legal/terms" className="hover:text-slate-700 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-slate-700 transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
