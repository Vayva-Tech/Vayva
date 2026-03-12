"use client";

import React, { useState, useEffect, useRef } from "react";
import { logger } from "@vayva/shared";
import { Button, Input } from "@vayva/ui";
import {
  Spinner as Loader2,
  User,
  Warning as AlertTriangle,
  FloppyDisk as Save,
  ArrowLeft,
} from "@phosphor-icons/react/ssr";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardPageHeader,
} from "@/components/ui/DashboardCard";
import { cn } from "@/lib/utils";

import { apiJson } from "@/lib/api-client-shared";

interface ProfileResponse {
  data: {
    user: {
      firstName?: string;
      lastName?: string;
      email: string;
      phone?: string;
    };
  };
}

export default function ProfileSettingsPage() {
  const { merchant } = useAuth();
  const isPaidPlan = (() => {
    const v = String((merchant as any)?.plan || "")
      .trim()
      .toLowerCase();

    return (
      v === "starter" ||
      v === "pro" ||
      v === "growth" ||
      v === "business" ||
      v === "enterprise" ||
      v === "professional" ||
      v === "premium"
    );
  })();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const initialProfileRef = useRef({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const isDirty =
    profile.firstName !== initialProfileRef.current?.firstName ||
    profile.lastName !== initialProfileRef.current?.lastName ||
    profile.phone !== initialProfileRef.current?.phone;

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await apiJson<ProfileResponse>("/api/auth/merchant/me");
        if (data?.data?.user) {
          const u = data.data?.user;
          const loaded = {
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            email: u.email || "",
            phone: u.phone || "",
          };
          setProfile(loaded);
          initialProfileRef.current = loaded;
        }
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.error("[LOAD_PROFILE_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
        toast.error(_errMsg || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    void loadProfile();
  }, []);

  useUnsavedChanges(isDirty);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiJson<{ success: boolean }>("/api/settings/profile", {
        method: "POST",
        body: JSON.stringify(profile),
      });
      initialProfileRef.current = { ...profile };
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAVE_PROFILE_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <DashboardPageHeader title="Profile" subtitle="Settings" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back Link */}
      <Link
        href="/dashboard/settings/overview"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      <DashboardPageHeader
        title="Profile"
        subtitle="Manage your personal information"
        action={
          <Button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={cn(
              "rounded-xl gap-2",
              isDirty
                ? "bg-slate-900 hover:bg-slate-800"
                : "bg-slate-300 cursor-not-allowed"
            )}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        }
      />

      {/* Personal Information */}
      <DashboardCard>
        <DashboardCardHeader
          title="Personal Information"
          icon={User}
        />
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-slate-600"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target?.value })
                }
                placeholder="Enter your first name"
                className="border-slate-200 focus:border-slate-900 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-slate-600"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target?.value })
                }
                placeholder="Enter your last name"
                className="border-slate-200 focus:border-slate-900 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-slate-600"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-slate-50 border-slate-200 rounded-xl text-slate-500"
            />
            <p className="text-xs text-slate-400">
              Email cannot be changed from this page
            </p>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-slate-600"
            >
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target?.value })
              }
              placeholder="Enter your phone number"
              className="border-slate-200 focus:border-slate-900 rounded-xl"
            />
          </div>
        </div>
      </DashboardCard>

      {/* Danger Zone */}
      <DashboardCard className="border-red-100 bg-red-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-100 text-red-600">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900">Danger Zone</h3>
            <p className="text-xs text-red-600/70">
              Irreversible actions for your account
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50/50">
          <div>
            <h4 className="font-medium text-sm text-red-900">Delete Account</h4>
            <p className="text-xs text-red-600/80 mt-0.5">
              Permanently delete your account and all data
            </p>
          </div>
          <Link href="/dashboard/account/edit">
            <Button
              variant="outline"
              className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-100 border-red-200 text-xs"
            >
              Manage in Account
            </Button>
          </Link>
        </div>
      </DashboardCard>
    </div>
  );
}
