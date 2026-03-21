"use client";

import React, { useState, useEffect, useRef } from "react";
import { logger } from "@vayva/shared";
import { toast } from "sonner";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  Storefront as Store,
  Envelope as Mail,
  Phone,
  Globe,
  Spinner as Loader2,
  FloppyDisk as Save,
  DeviceMobile as Smartphone,
  Clock,
  Lock,
  LockOpen as Unlock,
} from "@phosphor-icons/react/ssr";
import { Button, Input, Select, Textarea } from "@vayva/ui";
import { FileUpload } from "@/components/ui/FileUpload";

interface StoreProfile {
  name: string;
  slug: string;
  businessType: string;
  description: string;
  supportEmail: string;
  supportPhone: string;
  logoUrl: string;
  whatsappNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    landmark: string;
  };
  isActive: boolean;
  operatingHours: Record<
    string,
    {
      isClosed: boolean;
      open?: string;
      close?: string;
    }
  >;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

import { apiJson } from "@/lib/api-client-shared";

export default function StoreSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const initialProfileRef = useRef<StoreProfile | null>(null);

  const isDirty =
    profile && initialProfileRef.current
      ? JSON.stringify(profile) !== JSON.stringify(initialProfileRef.current)
      : false;

  useUnsavedChanges(isDirty);

  useEffect(() => {
    const controller = new AbortController();
    void fetchProfile(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  const fetchProfile = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const data = await apiJson<StoreProfile>("/api/account/store", {
        signal,
      });
      setProfile(data);
      initialProfileRef.current = data;
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      if (error instanceof DOMException && error.name === "AbortError") return;
      logger.warn("[FETCH_STORE_PROFILE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Could not load store profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      // Basic sanitization
      const sanitizedProfile = {
        ...profile,
        name: profile.name?.trim(),
        supportEmail: profile.supportEmail?.trim().toLowerCase(),
        supportPhone: profile.supportPhone?.trim(),
        whatsappNumber: profile.whatsappNumber?.trim(),
        address: {
          ...profile.address,
          street: profile.address?.street.trim(),
          city: profile.address?.city.trim(),
          state: profile.address?.state.trim(),
          country: profile.address?.country.trim(),
          landmark: profile.address?.landmark.trim(),
        },
      };

      await apiJson<{ success: boolean }>("/api/account/store", {
        method: "PUT",
        body: JSON.stringify(sanitizedProfile),
      });

      initialProfileRef.current = JSON.parse(JSON.stringify(profile)); // Deep copy

      toast.success("Store profile updated successfully");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.warn("[SAVE_STORE_PROFILE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl space-y-8">
      <Breadcrumbs />
      <div className="flex items-center gap-4">
        <BackButton
          href="/dashboard/settings/overview"
          label="Back to Settings"
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Store Settings
          </h1>
          <p className="text-gray-500">
            Manage your public store profile and contact information.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding Section */}
        <div className="bg-white  p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Store className="h-5 w-5 text-green-600" />
            Branding & Identity
          </h2>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Logo
              </label>
              <FileUpload
                value={profile.logoUrl}
                onChange={(url: string) => setProfile({ ...profile, logoUrl: url })}
                purpose="BRANDING_LOGO"
                accept="image/png,image/jpeg,image/webp"
                maxSizeMB={2}
                label="Upload Logo"
              />
              <p className="text-xs text-gray-500 mt-2">
                Max 2MB, PNG, JPG or WEBP
              </p>
            </div>

            <div className="flex-grow grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="store-name"
                  className="block text-sm font-medium text-gray-700 mb-1.5 text-left"
                >
                  Store Name
                </label>
                <Input id="store-name"
                  type="text"
                  placeholder="Enter your store name"
                  value={profile.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProfile({ ...profile, name: e.target?.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-100 focus:ring-2 focus:ring-green-500/50 focus:border-transparent outline-none transition-all text-gray-900"
                  required
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 text-left">
                  Store URL Slug
                </label>
                <div className="flex items-center gap-1 bg-white  px-3 py-2 rounded-lg border border-gray-100 text-gray-500 text-sm">
                  <Globe className="h-4 w-4" />
                  <span>vayva.store/</span>
                  <span className="font-medium text-gray-900">
                    {profile.slug}
                  </span>
                </div>
              </div>
              <div>
                <label
                  htmlFor="store-category"
                  className="block text-sm font-medium text-gray-700 mb-1.5 text-left"
                >
                  Business Category
                </label>
                <Select
                  id="store-category"
                  value={profile.businessType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setProfile({ ...profile, businessType: e.target?.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-100 focus:ring-2 focus:ring-green-500/50 outline-none text-gray-900"
                  disabled={saving}
                >
                  <option value="fashion">Fashion & Apparel</option>
                  <option value="electronics">Electronics</option>
                  <option value="beauty">Beauty & Personal Care</option>
                  <option value="food">Food & Groceries</option>
                  <option value="services">Professional Services</option>
                  <option value="general">General Retail</option>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="store-description"
              className="block text-sm font-medium text-gray-700 mb-1.5 text-left"
            >
              Short Description
            </label>
            <Textarea
              id="store-description"
              value={profile.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setProfile({ ...profile, description: e.target?.value })
              }
              rows={3}
              placeholder="A brief bio that appears on your store profile..."
              className="w-full px-3 py-2 rounded-lg border border-gray-100 focus:ring-2 focus:ring-green-500/50 outline-none text-gray-900 resize-none"
              disabled={saving}
            />
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white  p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Mail className="h-5 w-5 text-green-600" />
            Support & Communication
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="support-email"
                className="block text-sm font-medium text-gray-700 mb-1.5 text-left"
              >
                Support Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input id="support-email"
                  type="email"
                  placeholder="support@yourstore.com"
                  value={profile.supportEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProfile({ ...profile, supportEmail: e.target?.value })
                  }
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-100 focus:ring-2 focus:ring-green-500/50 outline-none text-gray-900"
                  required
                  disabled={saving}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="support-phone"
                className="block text-sm font-medium text-gray-700 mb-1.5 text-left"
              >
                Support Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input id="support-phone"
                  type="tel"
                  placeholder="+234..."
                  value={profile.supportPhone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProfile({ ...profile, supportPhone: e.target?.value })
                  }
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-100 focus:ring-2 focus:ring-green-500/50 outline-none text-gray-900"
                  disabled={saving}
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="whatsapp-number"
                className="block text-sm font-medium text-gray-700 mb-1.5 text-left"
              >
                Official WhatsApp Number (E.164)
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input id="whatsapp-number"
                  type="text"
                  placeholder="+234..."
                  value={profile.whatsappNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProfile({ ...profile, whatsappNumber: e.target?.value })
                  }
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-100 focus:ring-2 focus:ring-green-500/50 outline-none text-gray-900 font-mono"
                  disabled={saving}
                />
                <p className="mt-1 text-xs text-gray-500">
                  This number will be used for AI Agent responses and customer
                  contact.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Store Status Section */}
        <div className="bg-white  p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            {profile.isActive ? (
              <Unlock className="h-5 w-5 text-green-600" />
            ) : (
              <Lock className="h-5 w-5 text-red-500" />
            )}
            Store Status
          </h2>

          <div className="flex items-center justify-between p-4 bg-white  rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">
                {profile.isActive
                  ? "Store is Open"
                  : "Store is Closed (Maintenance Mode)"}
              </p>
              <p className="text-sm text-gray-500">
                {profile.isActive
                  ? "Customers can see your products and place orders."
                  : "Customers cannot place orders, but can still browse (if enabled)."}
              </p>
            </div>
            <Button
              type="button"
              variant={profile.isActive ? "outline" : "primary"}
              onClick={() =>
                setProfile({ ...profile, isActive: !profile.isActive })
              }
              className={
                profile.isActive
                  ? "border-red-500/20 text-red-500 hover:bg-red-500"
                  : "bg-green-500 hover:bg-green-50"
              }
              disabled={saving}
            >
              {profile.isActive ? "Stop Orders" : "Resume Orders"}
            </Button>
          </div>
        </div>

        {/* Operating Hours Section */}
        <div className="bg-white  p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            Operating Hours
          </h2>

          <div className="space-y-4">
            {DAYS.map((day: string) => {
              const hours = profile.operatingHours[day] || {
                isClosed: false,
                open: "08:00",
                close: "18:00",
              };
              return (
                <div
                  key={day}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 border-b border-gray-100 last:border-0"
                >
                  <div className="w-24 font-medium text-gray-700">{day}</div>
                  <div className="flex items-center gap-4 flex-grow sm:justify-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input type="checkbox"
                        checked={hours.isClosed}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const newHours = { ...profile.operatingHours };
                          newHours[day] = {
                            ...hours,
                            isClosed: e.target?.checked,
                          };
                          setProfile({ ...profile, operatingHours: newHours });
                        }}
                        className="rounded border-gray-100 text-green-600 focus:ring-green-500/50"
                        disabled={saving}
                      />
                      <span className="text-sm text-gray-500">Closed</span>
                    </label>

                    {!hours.isClosed && (
                      <div className="flex items-center gap-2">
                        <Input type="time"
                          value={hours.open || "08:00"}
                          aria-label={`${day} opening time`}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            const newHours = { ...profile.operatingHours };
                            newHours[day] = { ...hours, open: e.target?.value };
                            setProfile({
                              ...profile,
                              operatingHours: newHours,
                            });
                          }}
                          className="px-2 py-1 rounded border border-gray-100 text-sm outline-none focus:ring-1 focus:ring-green-500/50"
                          disabled={saving}
                        />
                        <span className="text-gray-500">-</span>
                        <Input type="time"
                          value={hours.close || "18:00"}
                          aria-label={`${day} closing time`}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            const newHours = { ...profile.operatingHours };
                            newHours[day] = { ...hours, close: e.target?.value };
                            setProfile({
                              ...profile,
                              operatingHours: newHours,
                            });
                          }}
                          className="px-2 py-1 rounded border border-gray-100 text-sm outline-none focus:ring-1 focus:ring-green-500/50"
                          disabled={saving}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            type="submit"
            disabled={saving}
            className="bg-green-500 hover:bg-green-500 text-white flex items-center gap-2 px-8"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
