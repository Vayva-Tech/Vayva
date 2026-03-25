"use client";

import React, { useState, useEffect, useCallback } from "react";
import * as motion from "framer-motion/client";
import { Skeleton } from "@/components/Skeleton";
import {
  IconX as X,
  IconDownload as Download,
  IconBrandWhatsapp as WhatsappLogo,
  IconCircleCheck as CheckCircle,
} from "@tabler/icons-react";
import { Button, Input } from "@vayva/ui";

interface LeadMagnetPopupProps {
  // Controlled by parent for exit-intent
  isOpen?: boolean;
  onClose?: () => void;
  // Or auto-trigger on exit intent
  triggerOnExit?: boolean;
}

const LEAD_MAGNET = {
  title: "Free Guide: WhatsApp to ₦1M",
  subtitle: "10 Hacks Nigerian Sellers Use in 2026",
  description: "Get the exact strategies top sellers in Lagos, Abuja & PH use to turn WhatsApp chats into consistent daily sales.",
  benefits: [
    "How to never lose an order in WhatsApp chaos",
    "3 messages that convert 3x better than 'How much?'",
    "The ₦0 startup checklist for online sellers",
    "Paystack tricks for faster payouts",
  ],
};

export function LeadMagnetPopup({ isOpen: controlledOpen, onClose, triggerOnExit = true }: LeadMagnetPopupProps): React.JSX.Element | null {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", whatsapp: "" });
  const [hasShown, setHasShown] = useState(false);

  // Handle exit intent
  useEffect(() => {
    if (!triggerOnExit || controlledOpen !== undefined) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10 && !hasShown && !localStorage.getItem("vayva-lead-magnet-shown")) {
        setIsVisible(true);
        setHasShown(true);
        localStorage.setItem("vayva-lead-magnet-shown", "true");
      }
    };

    // Also show after 60 seconds if not shown yet
    const timer = setTimeout(() => {
      if (!hasShown && !localStorage.getItem("vayva-lead-magnet-shown")) {
        setIsVisible(true);
        setHasShown(true);
        localStorage.setItem("vayva-lead-magnet-shown", "true");
      }
    }, 60000);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, [triggerOnExit, controlledOpen, hasShown]);

  // Handle controlled open state
  useEffect(() => {
    if (controlledOpen !== undefined) {
      setIsVisible(controlledOpen);
    }
  }, [controlledOpen]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        // Track conversion
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).gtag) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((window as unknown as Record<string, unknown>).gtag as (event: string, action: string, params: Record<string, string>) => void)("event", "lead_magnet_signup", {
            event_category: "conversion",
            event_label: "whatsapp_guide",
          });
        }
      } else {
        const data = await response.json();
        console.error("Newsletter signup failed:", data.error);
      }
    } catch (error) {
      console.error("Failed to submit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-background rounded-[40px] shadow-2xl max-w-lg w-full overflow-hidden"
      >
        {/* Close button */}
        <Button
          type="button"
          variant="ghost"
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors z-10 p-0"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </Button>

        {!isSubmitted ? (
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 mb-4">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-foreground mb-2">
                {LEAD_MAGNET.title}
              </h3>
              <p className="text-lg font-bold text-primary">{LEAD_MAGNET.subtitle}</p>
              <p className="text-sm text-muted-foreground mt-2">{LEAD_MAGNET.description}</p>
            </div>

            {/* Benefits */}
            <div className="space-y-2 mb-6">
              {LEAD_MAGNET.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g., Chioma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="chioma@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="08012345678"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 text-base font-bold rounded-xl bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Send Me The Free Guide
                  </span>
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              We respect your privacy. No spam — just value for Nigerian sellers.
            </p>
          </div>
        ) : (
          <div className="p-8 text-center">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton variant="circular" width="80px" height="80px" className="mx-auto mb-6" />
                <Skeleton className="w-48 h-8 mx-auto" />
                <TextSkeleton lines={2} />
              </div>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-2">Guide Sent! 🎉</h3>
                <p className="text-muted-foreground mb-6">
                  Check your email (and WhatsApp) for your free guide. Start implementing these hacks today!
                </p>
              </>
            )}
            <div className="flex flex-col gap-3">
              <a
                href="https://wa.me/2349160000000?text=Hi%20Vayva%2C%20I%20just%20downloaded%20the%20guide%20and%20want%20to%20learn%20more%20about%20the%20platform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
              >
                <WhatsappLogo className="w-5 h-5" />
                Chat With Us on WhatsApp
              </a>
              <Button variant="outline" onClick={handleClose} className="w-full">
                Close & Continue Browsing
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Inline lead magnet form for embedding in pages
export function LeadMagnetInline(): React.JSX.Element {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", whatsapp: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const data = await response.json();
        console.error("Newsletter signup failed:", data.error);
      }
    } catch (error) {
      console.error("Failed to submit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 to-emerald-500/10 rounded-[40px] p-8 md:p-12 border border-primary/20">
      {!isSubmitted ? (
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 mb-4">
              <Download className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase">Free Download</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-foreground mb-2">
              {LEAD_MAGNET.title}
            </h3>
            <p className="text-lg text-primary font-bold mb-2">{LEAD_MAGNET.subtitle}</p>
            <p className="text-sm text-muted-foreground">{LEAD_MAGNET.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              type="email"
              required
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              type="tel"
              required
              placeholder="WhatsApp Number"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 font-bold bg-gradient-to-r from-primary to-emerald-600"
            >
              {isLoading ? "Sending..." : "Get Free Guide"}
            </Button>
          </form>
        </div>
      ) : (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-black text-foreground mb-2">Guide Sent! 📧</h3>
          <p className="text-muted-foreground">Check your email and WhatsApp for your free guide!</p>
        </div>
      )}
    </div>
  );
}
