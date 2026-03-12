"use client";

import Link from "next/link";
import { logger } from "@vayva/shared";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button, cn } from "@vayva/ui";
import {
  Sparkle as Sparkles,
  InstagramLogo as Instagram,
  Robot as Bot,
  Lock,
  CheckCircle,
  ChatCircleText as MessageSquare,
  Lightning as Zap,
  TrendUp,
  Info,
  ArrowRight,
  X,
  QrCode,
  ArrowCounterClockwise as RefreshCw,
  Shield,
} from "@phosphor-icons/react/ssr";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";

type SocialStatus = {
  connected: boolean;
  account: string | null;
};

type WhatsAppStatus = {
  connected: boolean;
  phoneNumber: string | null;
};

import { apiJson } from "@/lib/api-client-shared";

interface WhatsappInstanceResponse {
  base64?: string;
  qrcode?: string;
}

interface SocialStatusResponse {
  connected: boolean;
  account: string | null;
}

interface WhatsappStatusResponse {
  connected: boolean;
  phoneNumber?: string | null;
}

export default function SocialsStep(): React.JSX.Element {
  const { nextStep, prevStep, isSaving } = useOnboarding();
  const [ig, setIg] = useState<SocialStatus | null>(null);
  const [igLoading, setIgLoading] = useState(false);
  const [igBusy, setIgBusy] = useState(false);
  const [wa, setWa] = useState<WhatsAppStatus | null>(null);
  const [waLoading, setWaLoading] = useState(false);
  const [waQr, setWaQr] = useState<string | null>(null);
  const [waConnecting, setWaConnecting] = useState(false);
  const [showWhatsAppSetup, setShowWhatsAppSetup] = useState(false);

  const [waBusy, setWaBusy] = useState(false);

  const igConnectHref = useMemo(() => {
    const url = new URL(
      "/api/socials/instagram/connect",
      window.location.origin,
    );
    url.searchParams.set("returnTo", "/onboarding?step=socials");
    return url.pathname + url.search;
  }, []);

  const generateWhatsAppQr = async () => {
    await initiateWhatsApp();
  };

  const initiateWhatsApp = async () => {
    setWaConnecting(true);
    setWaQr(null);
    try {
      await apiJson<{ success: boolean }>("/api/whatsapp/instance", {
        method: "POST",
      });
      const data = await apiJson<WhatsappInstanceResponse>(
        "/api/whatsapp/instance",
      );
      const qr = data.base64 || data.qrcode || null;
      if (qr) {
        setWaQr(qr);
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[WA_INIT_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error("Failed to start WhatsApp session");
    } finally {
      setWaConnecting(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const checkStatus = async () => {
      // Check Instagram status
      setIgLoading(true);
      try {
        const data = await apiJson<SocialStatusResponse>(
          "/api/socials/instagram/status",
          { signal: controller.signal },
        );
        setIg({
          connected: Boolean(data.connected),
          account: data.account ?? null,
        });
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          logger.warn("[IG_STATUS_CHECK_ERROR]", {
            error: _errMsg,
            app: "merchant",
          });
        }
      } finally {
        setIgLoading(false);
      }

      // Check WhatsApp status
      setWaLoading(true);
      try {
        const data = await apiJson<WhatsappStatusResponse>(
          "/api/wa-agent/status",
          { signal: controller.signal },
        );
        setWa({
          connected: Boolean(data.connected),
          phoneNumber: data.phoneNumber ?? null,
        });
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          logger.warn("[WA_STATUS_CHECK_ERROR]", {
            error: _errMsg,
            app: "merchant",
          });
        }
      } finally {
        setWaLoading(false);
      }
    };

    void checkStatus();
    return () => controller.abort();
  }, []);

  const disconnectInstagram = async () => {
    setIgBusy(true);
    try {
      await apiJson<{ success: boolean }>("/api/socials/instagram/disconnect", {
        method: "POST",
      });
      const refreshed = await apiJson<SocialStatusResponse>(
        "/api/socials/instagram/status",
      );
      setIg({
        connected: Boolean(refreshed.connected),
        account: refreshed.account ?? null,
      });
      toast.success("Instagram disconnected");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DISCONNECT_IG_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to disconnect Instagram");
    } finally {
      setIgBusy(false);
    }
  };

  const disconnectWhatsApp = async () => {
    setWaBusy(true);
    try {
      await apiJson<{ success: boolean }>("/api/wa-agent/disconnect", {
        method: "POST",
      });
      const refreshed = await apiJson<WhatsappStatusResponse>(
        "/api/wa-agent/status",
      );
      setWa({
        connected: Boolean(refreshed.connected),
        phoneNumber: refreshed.phoneNumber ?? null,
      });
      toast.success("WhatsApp disconnected");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DISCONNECT_WA_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to disconnect WhatsApp");
    } finally {
      setWaBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-2 shadow-lg">
          <Sparkles size={24} className="text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">
          Connect Your Socials
        </h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          Let AI handle customer conversations on Instagram and WhatsApp. Close
          sales while you sleep.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Instagram Card */}
        <div className="bg-background border-2 border-border rounded-[32px] p-6 space-y-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-bl-[100px] pointer-events-none" />

          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3.5 rounded-2xl shadow-xl">
              <Instagram size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-text-primary text-xl tracking-tight">
                Instagram DMs
              </h3>
              <p className="text-sm text-text-tertiary font-medium">
                AI-powered auto-replies
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-text-secondary font-medium">
              <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center">
                <Bot size={14} className="text-purple-600" />
              </div>
              <span>Smart auto-replies to inquiries</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-secondary font-medium">
              <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center">
                <Lock size={14} className="text-purple-600" />
              </div>
              <span>Secure Meta API integration</span>
            </div>
          </div>

          {ig?.connected ? (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50/50 border border-green-100 px-4 py-3 rounded-2xl">
                <CheckCircle size={18} />
                <span>Connected: {ig.account || "Instagram"}</span>
              </div>
              <Button
                variant="outline"
                onClick={disconnectInstagram}
                disabled={igBusy || igLoading || isSaving}
                className="w-full h-12 rounded-2xl font-bold border-2"
              >
                {igBusy ? "Disconnecting..." : "Disconnect Account"}
              </Button>
            </div>
          ) : (
            <Link
              href={igConnectHref}
              aria-disabled={igLoading || isSaving}
              className={cn(
                "block pt-2",
                (igLoading || isSaving) && "pointer-events-none",
              )}
            >
              <Button
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 font-black text-lg rounded-2xl shadow-xl shadow-purple-500/20 transition-all active:scale-[0.98]"
                disabled={igLoading || isSaving}
              >
                {igLoading ? "Checking..." : "Connect Instagram"}
              </Button>
            </Link>
          )}
        </div>

        {/* WhatsApp Card */}
        <div className="bg-background border-2 border-border rounded-[32px] p-6 space-y-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-bl-[100px] pointer-events-none" />

          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3.5 rounded-2xl shadow-xl">
              <MessageSquare size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-text-primary text-xl tracking-tight">
                WhatsApp Biz
              </h3>
              <p className="text-sm text-text-tertiary font-medium">
                Conversational commerce
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-text-secondary font-medium">
              <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center">
                <Zap size={14} className="text-green-600" />
              </div>
              <span>Convert chats to orders instantly</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-secondary font-medium">
              <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendUp size={14} className="text-green-600" />
              </div>
              <span>Scale support without more staff</span>
            </div>
          </div>

          {wa?.connected ? (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50/50 border border-green-100 px-4 py-3 rounded-2xl">
                <CheckCircle size={18} />
                <span>Connected: {wa.phoneNumber || "WhatsApp"}</span>
              </div>
              <Button
                variant="outline"
                onClick={disconnectWhatsApp}
                disabled={waBusy || waLoading || isSaving}
                className="w-full h-12 rounded-2xl font-bold border-2"
              >
                {waBusy ? "Disconnecting..." : "Disconnect WhatsApp"}
              </Button>
            </div>
          ) : (
            <div className="pt-2">
              <Button
                className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 font-black text-lg rounded-2xl shadow-xl shadow-green-500/20 transition-all active:scale-[0.98]"
                disabled={waLoading || isSaving}
                onClick={() => setShowWhatsAppSetup(true)}
              >
                {waLoading ? "Checking..." : "Connect WhatsApp"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-100">
          <Info size={20} className="text-blue-600" />
        </div>
        <div className="text-sm">
          <p className="font-bold text-blue-900 mb-1">How AI Chat Works</p>
          <p className="text-blue-700/80 leading-relaxed">
            Our AI monitor messages and helps respond to inquiries
            automatically. You stay in control and can take over anytime.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isSaving}
          className="h-14 px-8 rounded-2xl border-2 font-bold hover:bg-white/40 transition-all"
        >
          Back
        </Button>
        <Button
          onClick={() => nextStep()}
          disabled={isSaving}
          className="flex-1 h-14 bg-vayva-green hover:bg-vayva-green/90 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-500/20 transition-all active:scale-[0.98]"
        >
          Continue to Finance <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      <p className="text-xs font-bold text-text-tertiary text-center uppercase tracking-widest">
        Optional: Can be skipped and connected later
      </p>

      {/* WhatsApp Setup Modal */}
      {showWhatsAppSetup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowWhatsAppSetup(false)}
        >
          <div
            className="bg-background rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-background/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <MessageSquare size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      Connect WhatsApp Business
                    </h3>
                    <p className="text-sm text-white/80">Using Evolution API</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowWhatsAppSetup(false)}
                  className="text-white/80 hover:text-white h-8 w-8"
                >
                  <X size={24} />
                </Button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Instructions */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <Info
                    size={20}
                    className="text-blue-600 flex-shrink-0 mt-0.5"
                  />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-2">How to Connect</p>
                    <ol className="space-y-2 list-decimal list-inside text-blue-700">
                      <li>
                        Scan the QR code below with your WhatsApp Business app
                      </li>
                      <li>Your WhatsApp will be connected via Evolution API</li>
                      <li>
                        AI will start monitoring and responding to messages
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-border rounded-2xl p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-64 h-64 bg-white/40 rounded-2xl flex items-center justify-center border-2 border-dashed border-border">
                    {waQr ? (
                      <img
                        src={waQr}
                        alt="WhatsApp QR Code"
                        className="w-56 h-56 object-contain"
                      />
                    ) : (
                      <div className="text-center space-y-2">
                        <QrCode
                          size={64}
                          className="text-text-tertiary mx-auto"
                        />
                        <p className="text-sm text-text-tertiary font-medium">
                          QR Code will appear here
                        </p>
                        <p className="text-xs text-text-tertiary">
                          Scan with WhatsApp Business
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow-lg"
                    onClick={generateWhatsAppQr}
                    disabled={waConnecting}
                  >
                    <RefreshCw size={16} className="mr-2" />
                    {waConnecting ? "Generating..." : "Generate QR Code"}
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-900">
                    <Shield size={16} className="text-green-600" />
                    <span>Secure Connection</span>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-900">
                    <Zap size={16} className="text-green-600" />
                    <span>Instant Setup</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t-2 border-border">
                <Button
                  variant="outline"
                  onClick={() => setShowWhatsAppSetup(false)}
                  className="flex-1 h-12 rounded-xl border-2"
                >
                  Skip for Now
                </Button>
                <Button
                  className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg"
                  onClick={() => setShowWhatsAppSetup(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
