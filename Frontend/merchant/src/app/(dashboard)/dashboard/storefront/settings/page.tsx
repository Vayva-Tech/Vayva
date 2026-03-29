"use client";

import { useState, useEffect } from "react";
import { Button, Input, Label, Select } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";
import {
  Buildings as Store,
  CreditCard,
  Receipt,
  Envelope as Mail,
  Palette,
  Shield,
  Check,
  DeviceMobile as Smartphone,
} from "@phosphor-icons/react/ssr";

interface CheckoutSettings {
  requirePhone: boolean;
  requireEmail: boolean;
  guestCheckout: boolean;
  saveCards: boolean;
  requireTerms: boolean;
  termsUrl: string;
  privacyUrl: string;
  customCss: string;
  brandColor: string;
  logoUrl: string;
  faviconUrl: string;
  receiptEmailTemplate: string;
  sendReceiptEmail: boolean;
  sendReceiptWhatsApp: boolean;
  enableOrderTracking: boolean;
  enableGuestReviews: boolean;
}

export default function StorefrontSettingsPage() {
  const [settings, setSettings] = useState<CheckoutSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"checkout" | "receipts" | "branding">("checkout");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await apiJson<{ settings: CheckoutSettings }>("/storefront/settings");
      setSettings(data.settings || getDefaultSettings());
    } catch (error) {
      logger.error("[STOREFRONT_SETTINGS_FETCH_ERROR]", { error });
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSettings = (): CheckoutSettings => ({
    requirePhone: true,
    requireEmail: true,
    guestCheckout: true,
    saveCards: true,
    requireTerms: true,
    termsUrl: "",
    privacyUrl: "",
    customCss: "",
    brandColor: "#22C55E",
    logoUrl: "",
    faviconUrl: "",
    receiptEmailTemplate: "default",
    sendReceiptEmail: true,
    sendReceiptWhatsApp: false,
    enableOrderTracking: true,
    enableGuestReviews: true,
  });

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await apiJson("/storefront/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Storefront</h1>
            <p className="text-gray-500">Checkout, receipts & branding</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          className="bg-vayva-green text-white hover:bg-vayva-green/90 font-bold"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-white  rounded-xl border border-gray-200 p-1 inline-flex gap-1">
        {([
          { id: "checkout", label: "Checkout", icon: CreditCard },
          { id: "receipts", label: "Receipts", icon: Receipt },
          { id: "branding", label: "Branding", icon: Palette },
        ] as const).map((t) => (
          <Button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === t.id
                ? "bg-black text-white"
                : "text-gray-500 hover:text-gray-900 hover:bg-white"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </Button>
        ))}
      </div>

      {/* Checkout Settings */}
      {activeTab === "checkout" && (
        <div className="bg-white  rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Checkout Configuration
          </h2>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Required Fields
            </h3>

            <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-white">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Require Phone Number</p>
                  <p className="text-sm text-gray-700">
                    Phone is mandatory for delivery
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.requirePhone}
                onChange={(e) =>
                  setSettings({ ...settings, requirePhone: e.target.checked })
                }
                className="w-5 h-5 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-white">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium">Require Email</p>
                  <p className="text-sm text-gray-700">
                    Email is mandatory for receipts
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.requireEmail}
                onChange={(e) =>
                  setSettings({ ...settings, requireEmail: e.target.checked })
                }
                className="w-5 h-5 rounded"
              />
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Payment Options
            </h3>

            <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-white">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Guest Checkout</p>
                  <p className="text-sm text-gray-700">
                    Allow checkout without account
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.guestCheckout}
                onChange={(e) =>
                  setSettings({ ...settings, guestCheckout: e.target.checked })
                }
                className="w-5 h-5 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-white">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-violet-500" />
                <div>
                  <p className="font-medium">Save Cards</p>
                  <p className="text-sm text-gray-700">
                    Allow customers to save payment methods
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.saveCards}
                onChange={(e) =>
                  setSettings({ ...settings, saveCards: e.target.checked })
                }
                className="w-5 h-5 rounded"
              />
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Legal Requirements
            </h3>

            <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-white">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium">Require Terms Acceptance</p>
                  <p className="text-sm text-gray-700">
                    Show terms checkbox before payment
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.requireTerms}
                onChange={(e) =>
                  setSettings({ ...settings, requireTerms: e.target.checked })
                }
                className="w-5 h-5 rounded"
              />
            </label>

            {settings.requireTerms && (
              <div className="grid grid-cols-2 gap-4 pl-12">
                <div className="space-y-2">
                  <Label>Terms of Service URL</Label>
                  <Input
                    value={settings.termsUrl}
                    onChange={(e) =>
                      setSettings({ ...settings, termsUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Privacy Policy URL</Label>
                  <Input
                    value={settings.privacyUrl}
                    onChange={(e) =>
                      setSettings({ ...settings, privacyUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Receipt Settings */}
      {activeTab === "receipts" && (
        <div className="bg-white  rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Receipt Configuration
          </h2>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Receipt Delivery
            </h3>

            <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-white">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Send Email Receipt</p>
                  <p className="text-sm text-gray-700">
                    Automatic email after purchase
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.sendReceiptEmail}
                onChange={(e) =>
                  setSettings({ ...settings, sendReceiptEmail: e.target.checked })
                }
                className="w-5 h-5 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-white">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Send WhatsApp Receipt</p>
                  <p className="text-sm text-gray-700">
                    WhatsApp message with receipt
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.sendReceiptWhatsApp}
                onChange={(e) =>
                  setSettings({ ...settings, sendReceiptWhatsApp: e.target.checked })
                }
                className="w-5 h-5 rounded"
              />
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Receipt Features
            </h3>

            <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-white">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-violet-500" />
                <div>
                  <p className="font-medium">Order Tracking Link</p>
                  <p className="text-sm text-gray-700">
                    Include tracking URL in receipts
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableOrderTracking}
                onChange={(e) =>
                  setSettings({ ...settings, enableOrderTracking: e.target.checked })
                }
                className="w-5 h-5 rounded"
              />
            </label>

            <div className="space-y-2">
              <Label>Email Template</Label>
              <Select
                value={settings.receiptEmailTemplate}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSettings({ ...settings, receiptEmailTemplate: e.target.value })
                }
              >
                <option value="default">Default Template</option>
                <option value="minimal">Minimal</option>
                <option value="detailed">Detailed (with product images)</option>
                <option value="branded">Branded (with logo)</option>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Branding Settings */}
      {activeTab === "branding" && (
        <div className="bg-white  rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Branding & Appearance
          </h2>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Visual Identity
            </h3>

            <div className="space-y-2">
              <Label>Brand Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.brandColor}
                  onChange={(e) =>
                    setSettings({ ...settings, brandColor: e.target.value })
                  }
                  className="w-12 h-12 rounded-lg border cursor-pointer"
                />
                <Input
                  value={settings.brandColor}
                  onChange={(e) =>
                    setSettings({ ...settings, brandColor: e.target.value })
                  }
                  placeholder="#22C55E"
                  className="w-32 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input
                value={settings.logoUrl}
                onChange={(e) =>
                  setSettings({ ...settings, logoUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Favicon URL</Label>
              <Input
                value={settings.faviconUrl}
                onChange={(e) =>
                  setSettings({ ...settings, faviconUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Custom CSS
            </h3>
            <div className="space-y-2">
              <Label>Additional Styles</Label>
              <textarea
                value={settings.customCss}
                onChange={(e) =>
                  setSettings({ ...settings, customCss: e.target.value })
                }
                placeholder="/* Add custom CSS here */"
                className="w-full h-32 p-3 rounded-lg border border-gray-200 bg-white font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Advanced: Use to customize checkout appearance
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
