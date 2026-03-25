"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { Gift, X, DollarSign, Users, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AffiliateWidgetProps {
  variant?: "floating" | "footer" | "inline";
  position?: "bottom-right" | "bottom-left";
}

/**
 * AffiliateWidget
 * 
 * A promotional widget to encourage customers to join the affiliate program.
 * Can be displayed as:
 * - Floating button (bottom corner)
 * - Footer section
 * - Inline banner
 */
export function AffiliateWidget({ 
  variant = "floating", 
  position = "bottom-right" 
}: AffiliateWidgetProps) {
  const { store } = useStore();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isDismissed) return null;

  // Floating variant - compact button that expands on hover/click
  if (variant === "floating") {
    return (
      <div 
        className={`fixed ${position === "bottom-right" ? "right-4" : "left-4"} bottom-4 z-50`}
      >
        {isExpanded ? (
          <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 p-4 w-80 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <Button 
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <h3 className="font-bold text-lg mb-1">Earn with {store?.name}</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share our products and earn 10% commission on every sale you refer!
            </p>
            <div className="space-y-2">
              <Link href="/affiliate/join">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Become an Affiliate
                </Button>
              </Link>
              <Link href="/affiliate/dashboard">
                <Button variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  My Affiliate Dashboard
                </Button>
              </Link>
            </div>
            <Button 
              onClick={() => setIsDismissed(true)}
              className="w-full text-center text-xs text-gray-400 mt-3 hover:text-gray-600"
            >
              Dismiss
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsExpanded(true)}
            className="group flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Gift className="w-5 h-5" />
            <span className="font-medium">Earn Money</span>
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Button>
        )}
      </div>
    );
  }

  // Footer variant - compact inline section
  if (variant === "footer") {
    return (
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Become an Affiliate Partner</h3>
              <p className="text-purple-200 text-sm">
                Share {store?.name} with your audience and earn commissions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/affiliate/join">
              <Button className="bg-white text-purple-900 hover:bg-purple-50">
                <DollarSign className="w-4 h-4 mr-2" />
                Join Program
              </Button>
            </Link>
            <Link href="/affiliate/dashboard">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Users className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant - for embedding in pages
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Join Our Affiliate Program</h3>
          <p className="text-gray-600 text-sm mb-4">
            Love our products? Share them with your friends and followers and earn 
            10% commission on every sale. It&apos;s free to join!
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/affiliate/join">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                <DollarSign className="w-4 h-4 mr-2" />
                Apply Now
              </Button>
            </Link>
            <Link href="/affiliate/dashboard">
              <Button size="sm" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                My Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * AffiliateBadge
 * Small badge to display in product pages or checkout
 */
export function AffiliateBadge() {
  return (
    <Link 
      href="/affiliate/join"
      className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 bg-purple-50 px-2 py-1 rounded-full transition-colors"
    >
      <Gift className="w-3 h-3" />
      <span>Earn 10% by sharing</span>
    </Link>
  );
}

/**
 * ShareAndEarnButton
 * Button for customers to share products and earn
 */
interface ShareAndEarnButtonProps {
  productId?: string;
  productName?: string;
  className?: string;
}

export function ShareAndEarnButton({ 
  productId: _productId, 
  productName,
  className = "" 
}: ShareAndEarnButtonProps) {
  const { store } = useStore();
  const [showModal, setShowModal] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: productName || store?.name || "Check this out!",
      text: `I found this on ${store?.name}. Use my link to get it!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed
        console.warn("Share cancelled");
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setShowModal(true);
      setTimeout(() => setShowModal(false), 2000);
    }
  };

  return (
    <>
      <Button
        onClick={handleShare}
        className={`inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors ${className}`}
      >
        <Gift className="w-4 h-4" />
        <span>Share & Earn</span>
      </Button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg animate-in fade-out duration-500">
            Link copied to clipboard!
          </div>
        </div>
      )}
    </>
  );
}

