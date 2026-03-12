"use client";

import { logger } from "@vayva/shared";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FloppyDisk as Save,
  Trash as Trash2,
  Shield,
  House as Building,
  User,
  Spinner as Loader2,
  Warning as AlertTriangle,
} from "@phosphor-icons/react/ssr";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button, Input, cn } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

import { FileUpload } from "@/components/ui/FileUpload";

interface MerchantProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  industry: string;
  taxId?: string;
  avatarUrl?: string;
}

import { apiJson } from "@/lib/api-client-shared";

function FormSection({
  icon,
  iconColor,
  title,
  description,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      className="rounded-[24px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card"
    >
      <div className="p-6 pb-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl", iconColor)}>{icon}</div>
          <div>
            <h3 className="text-base font-bold text-text-primary">{title}</h3>
            <p className="text-xs text-text-tertiary">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </motion.div>
  );
}

function SensitiveField({
  id,
  label,
  type = "text",
  value,
  onChangeRequest,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChangeRequest: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-medium text-text-secondary"
      >
        {label}
        <Shield className="h-3 w-3 text-amber-500" />
      </Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type={type}
          value={value}
          readOnly
          className="flex-1 bg-background/30 border-border/40"
        />
        <Button
          variant="outline"
          onClick={onChangeRequest}
          className="rounded-xl border-border/60 font-medium text-xs hover:border-primary/30"
        >
          Change
        </Button>
      </div>
      <p className="text-[11px] text-amber-600/80 font-medium">
        Requires OTP verification
      </p>
    </div>
  );
}

export default function AccountEditPage() {
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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [formData, setFormData] = useState<MerchantProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    businessAddress: "",
    businessPhone: "",
    industry: "",
    taxId: "",
    avatarUrl: "",
  });

  const [otpDialog, setOtpDialog] = useState({
    open: false,
    field: "" as "email" | "phone" | "businessPhone" | "",
    newValue: "",
    otp: "",
    sendingOtp: false,
    verifyingOtp: false,
    resendTimer: 0,
    canResend: true,
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    confirmation: "",
    deleting: false,
  });

  const [fieldChangeDialog, setFieldChangeDialog] = useState({
    open: false,
    field: "" as "email" | "phone" | "businessPhone" | "",
    value: "",
  });

  useEffect(() => {
    void fetchProfile();
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpDialog.resendTimer > 0) {
      interval = setInterval(() => {
        setOtpDialog((prev) => ({
          ...prev,
          resendTimer: prev.resendTimer - 1,
          canResend: prev.resendTimer <= 1,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpDialog.resendTimer]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiJson<MerchantProfile>("/api/account/profile");
      if (data) {
        setProfile(data);
        setFormData(data);
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_PROFILE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const isSensitiveField = (field: string) => {
    return ["email", "phone", "businessPhone"].includes(field);
  };

  const handleFieldChange = (field: keyof MerchantProfile, value: string) => {
    if (
      isSensitiveField(field) &&
      profile &&
      value !== profile[field as keyof MerchantProfile]
    ) {
      setOtpDialog({
        open: true,
        field: field as "email" | "phone" | "businessPhone",
        newValue: value,
        otp: "",
        sendingOtp: false,
        verifyingOtp: false,
        resendTimer: 0,
        canResend: true,
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const sendOtp = async () => {
    if (!otpDialog.canResend) return;
    setOtpDialog({ ...otpDialog, sendingOtp: true, canResend: false });
    try {
      await apiJson<{ success: boolean }>("/api/account/otp/send", {
        method: "POST",
        body: JSON.stringify({
          field: otpDialog.field,
          newValue: otpDialog.newValue,
        }),
      });
      toast.success(`OTP sent to ${profile?.email}`);
      setOtpDialog((prev) => ({ ...prev, resendTimer: 30 }));
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SEND_OTP_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error("Failed to send code");
      setOtpDialog((prev) => ({ ...prev, canResend: true }));
    } finally {
      setOtpDialog((prev) => ({ ...prev, sendingOtp: false }));
    }
  };

  const verifyOtpAndUpdate = async () => {
    if (!otpDialog.otp || otpDialog.otp?.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setOtpDialog({ ...otpDialog, verifyingOtp: true });
    try {
      await apiJson<{ success: boolean }>("/api/account/otp/verify", {
        method: "POST",
        body: JSON.stringify({
          field: otpDialog.field,
          newValue: otpDialog.newValue,
          otp: otpDialog.otp,
        }),
      });
      setFormData({ ...formData, [otpDialog.field]: otpDialog.newValue });
      setProfile((prev) =>
        prev ? { ...prev, [otpDialog.field]: otpDialog.newValue } : null,
      );
      toast.success("Field updated successfully");
      setOtpDialog({
        open: false,
        field: "",
        newValue: "",
        otp: "",
        sendingOtp: false,
        verifyingOtp: false,
        resendTimer: 0,
        canResend: true,
      });
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[VERIFY_OTP_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error("Invalid code");
    } finally {
      setOtpDialog({ ...otpDialog, verifyingOtp: false });
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await apiJson<{ success: boolean }>("/api/account/profile", {
        method: "PATCH",
        body: JSON.stringify(formData),
      });
      toast.success("Profile updated successfully");
      router.push("/dashboard/account");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAVE_PROFILE_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteDialog.confirmation !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setDeleteDialog({ ...deleteDialog, deleting: true });
    try {
      await apiJson<{ success: boolean }>("/api/account/deletion", {
        method: "POST",
      });
      toast.success("Account deletion initiated. You will be logged out.");
      setTimeout(() => {
        window.location.href = "/signin";
      }, 2000);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DELETE_ACCOUNT_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to schedule deletion");
      setDeleteDialog({ ...deleteDialog, deleting: false });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="relative space-y-8 max-w-3xl mx-auto pb-20">
      {/* Live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {loading && <p>Loading profile...</p>}
      </div>

      <Breadcrumbs />
      {/* OTP Verification Dialog */}
      <Dialog
        open={otpDialog.open}
        onOpenChange={(open: boolean) =>
          !otpDialog.verifyingOtp && setOtpDialog({ ...otpDialog, open })
        }
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              Verify Your Identity
            </DialogTitle>
            <DialogDescription>
              For security, we need to verify this change. An OTP will be sent
              to your registered email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <strong>Changing:</strong>{" "}
                {otpDialog.field === "email"
                  ? "Email Address"
                  : otpDialog.field === "phone"
                    ? "Phone Number"
                    : "Business Phone"}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                <strong>New Value:</strong> {otpDialog.newValue}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp">Enter 6-Digit OTP</Label>
              <Input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otpDialog.otp}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setOtpDialog({
                    ...otpDialog,
                    otp: e.target?.value.replace(/\D/g, ""),
                  })
                }
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            {otpDialog.canResend ? (
              <Button
                variant="outline"
                onClick={sendOtp}
                disabled={otpDialog.sendingOtp || otpDialog.verifyingOtp}
                className="rounded-xl"
              >
                {otpDialog.sendingOtp ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Resend OTP
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled
                className="rounded-xl opacity-60"
              >
                Resend in {otpDialog.resendTimer}s
              </Button>
            )}
            <Button
              onClick={verifyOtpAndUpdate}
              disabled={otpDialog.verifyingOtp || otpDialog.otp?.length !== 6}
              className="rounded-xl"
            >
              {otpDialog.verifyingOtp ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Verify & Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open: boolean) =>
          !deleteDialog.deleting && setDeleteDialog({ ...deleteDialog, open })
        }
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Account Permanently?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data will be permanently
              deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="delete-confirm">
              Type &quot;DELETE&quot; to confirm
            </Label>
            <Input
              id="delete-confirm"
              value={deleteDialog.confirmation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDeleteDialog({
                  ...deleteDialog,
                  confirmation: e.target?.value,
                })
              }
              placeholder="DELETE"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({
                  open: false,
                  confirmation: "",
                  deleting: false,
                })
              }
              disabled={deleteDialog.deleting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteDialog.deleting}
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              {deleteDialog.deleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Field Change Dialog - replaces native prompt() */}
      <Dialog
        open={fieldChangeDialog.open}
        onOpenChange={(open: boolean) =>
          setFieldChangeDialog({ ...fieldChangeDialog, open })
        }
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              Change {fieldChangeDialog.field === "email" ? "Email Address" : fieldChangeDialog.field === "phone" ? "Phone Number" : "Business Phone"}
            </DialogTitle>
            <DialogDescription>
              Enter the new value. You will need to verify this change with an OTP.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-value">
                New {fieldChangeDialog.field === "email" ? "Email Address" : fieldChangeDialog.field === "phone" ? "Phone Number" : "Business Phone"}
              </Label>
              <Input
                id="new-value"
                type={fieldChangeDialog.field === "email" ? "email" : "tel"}
                value={fieldChangeDialog.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFieldChangeDialog({
                    ...fieldChangeDialog,
                    value: e.target?.value,
                  })
                }
                placeholder={fieldChangeDialog.field === "email" ? "you@example.com" : "+234..."}
                className="border-border/40"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setFieldChangeDialog({
                  open: false,
                  field: "",
                  value: "",
                })
              }
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (fieldChangeDialog.value.trim()) {
                  setFieldChangeDialog({ ...fieldChangeDialog, open: false });
                  handleFieldChange(fieldChangeDialog.field as keyof MerchantProfile, fieldChangeDialog.value.trim());
                }
              }}
              disabled={!fieldChangeDialog.value.trim()}
              className="rounded-xl"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Green gradient blur background */}
      {isPaidPlan && (
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/account" />
          <div>
            <div className="text-sm text-text-secondary">Account</div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary tracking-tight">
              Edit Account
            </h1>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl h-11 px-6 font-bold shadow-card"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Personal Information */}
      <FormSection
        icon={<User className="h-4 w-4" />}
        iconColor="bg-blue-500/10 text-blue-600"
        title="Personal Information"
        description="Your name, avatar, and contact details"
        delay={0}
      >
        {/* Avatar Upload */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-background/30 border border-border/40">
          <div className="flex-1">
            <Label className="text-sm font-medium text-text-secondary mb-2 block">
              Profile Photo
            </Label>
            <FileUpload
              value={formData.avatarUrl || ""}
              onChange={(url: string) => setFormData({ ...formData, avatarUrl: url })}
              purpose="USER_AVATAR"
              accept="image/jpeg,image/png,image/webp"
              maxSizeMB={2}
              label="Upload Photo"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="firstName"
              className="text-sm font-medium text-text-secondary"
            >
              First Name
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, firstName: e.target?.value })
              }
              className="border-border/40"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="lastName"
              className="text-sm font-medium text-text-secondary"
            >
              Last Name
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, lastName: e.target?.value })
              }
              className="border-border/40"
            />
          </div>
        </div>
        <SensitiveField
          id="email"
          label="Email Address"
          type="email"
          value={formData.email}
          onChangeRequest={() =>
            setFieldChangeDialog({ open: true, field: "email", value: "" })
          }
        />
        <SensitiveField
          id="phone"
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChangeRequest={() =>
            setFieldChangeDialog({ open: true, field: "phone", value: "" })
          }
        />
      </FormSection>

      {/* Business Information */}
      <FormSection
        icon={<Building className="h-4 w-4" />}
        iconColor="bg-purple-500/10 text-purple-600"
        title="Business Information"
        description="Your store and business details"
        delay={0.05}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="businessName"
              className="text-sm font-medium text-text-secondary"
            >
              Business Name
            </Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, businessName: e.target?.value })
              }
              className="border-border/40"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="industry"
              className="text-sm font-medium text-text-secondary"
            >
              Industry
            </Label>
            <Input
              id="industry"
              value={formData.industry}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, industry: e.target?.value })
              }
              className="border-border/40"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="businessAddress"
            className="text-sm font-medium text-text-secondary"
          >
            Business Address
          </Label>
          <Input
            id="businessAddress"
            value={formData.businessAddress}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, businessAddress: e.target?.value })
            }
            className="border-border/40"
          />
        </div>
        <SensitiveField
          id="businessPhone"
          label="Business Phone"
          type="tel"
          value={formData.businessPhone}
          onChangeRequest={() =>
            setFieldChangeDialog({ open: true, field: "businessPhone", value: "" })
          }
        />
        <div className="space-y-1.5">
          <Label
            htmlFor="taxId"
            className="text-sm font-medium text-text-secondary"
          >
            Tax ID (Optional)
          </Label>
          <Input
            id="taxId"
            value={formData.taxId || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, taxId: e.target?.value })
            }
            placeholder="Enter tax identification number"
            className="border-border/40"
          />
        </div>
      </FormSection>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
        className="rounded-[24px] border border-red-200/60 bg-red-50/30 backdrop-blur-xl shadow-card"
      >
        <div className="p-6 pb-4 border-b border-red-200/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-900">Danger Zone</h3>
              <p className="text-xs text-red-700/70">
                Irreversible actions that affect your account
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 rounded-xl border border-red-200/60 bg-red-50/50">
            <div>
              <h4 className="font-bold text-sm text-red-900">Delete Account</h4>
              <p className="text-xs text-red-700/80 mt-0.5">
                Permanently delete your account and all data
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({
                  open: true,
                  confirmation: "",
                  deleting: false,
                })
              }
              className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-100 border-red-300 font-bold text-xs"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
