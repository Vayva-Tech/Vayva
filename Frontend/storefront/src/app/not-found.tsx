"use client";

import React from "react";
import NextLink from "next/link";
const Link = NextLink;
import { Button, Icon } from "@vayva/ui";

export default function NotFoundPage(): React.JSX.Element {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-12 relative flex justify-center">
          <div
            className="text-[180px] font-bold text-gray-50 leading-none select-none"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-background/70 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-black/5 flex items-center justify-center -rotate-12 border border-gray-100">
              <Icon name="Search" size={40} className="text-black" />
            </div>
          </div>
        </div>

        <h1
          className="text-4xl font-bold text-[#0B0B0B] mb-6 tracking-tight"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          Oops! Page not found.
        </h1>
        <p className="text-gray-500 mb-10 leading-relaxed">
          We couldn't find the page you're looking for. It might have been moved
          or doesn't exist anymore.
        </p>

        <div className="flex flex-col gap-4">
          <Link href="/">
            <Button className="w-full !h-14 !rounded-2xl !bg-black !text-white font-bold">
              Return to Homepage
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              variant="ghost"
              className="w-full !h-14 !rounded-2xl font-bold"
            >
              Contact Support
            </Button>
          </Link>
        </div>

        <div className="mt-16 pt-12 border-t border-gray-50 grid grid-cols-2 gap-4">
          <Link
            href="/policies/shipping"
            className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
          >
            Shipping Policy
          </Link>
          <Link
            href="/policies/returns"
            className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
          >
            Return Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
