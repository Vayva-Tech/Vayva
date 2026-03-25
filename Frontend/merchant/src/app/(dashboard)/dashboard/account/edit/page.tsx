"use client";
import { logger } from "@vayva/shared";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FloppyDisk as Save, Trash as Trash2, Shield, House as Building, User, Warning as AlertTriangle, Camera, CircleNotch as Loader2 } from "@phosphor-icons/react";
import { BackButton } from "@/components/ui/BackButton";
import { Button, Input, cn } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/FileUpload";
import { useAuth } from "@/context/AuthContext";
import { apiJson } from "@/lib/api-client-shared";

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
  const [profile, setProfile] = useState<MerchantProfile>({
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
      setProfile((prev) => ({ ...prev, [otpDialog.field]: otpDialog.newValue }));
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
        body: JSON.stringify(profile),
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
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Update your personal and business information</p>
        </div>
        <BackButton />
      </div>

      {/* Summary Widget */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-green-600 flex items-center justify-center text-white shadow-lg">
            <User size={32} weight="fill" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>
            <p className="text-sm text-gray-500">Manage your account details and preferences</p>
          </div>
        </div>
      </div>

      {/* Form Sections */}
      <div className="grid gap-6">
        {/* Personal Information */}
        <FormSection
          icon={<User size={20} />}
          iconColor="p-2 rounded-xl bg-blue-100 text-blue-600"
          title="Personal Information"
          description="Your name and contact details"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
              <Input id="firstName" value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} className="bg-white border-gray-200" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
              <Input id="lastName" value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} className="bg-white border-gray-200" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="bg-white border-gray-200" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
              <Input id="phone" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="bg-white border-gray-200" />
            </div>
          </div>
        </FormSection>

        {/* Business Information */}
        <FormSection
          icon={<Building size={20} />}
          iconColor="p-2 rounded-xl bg-green-100 text-green-600"
          title="Business Information"
          description="Your business details"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="businessName" className="text-sm font-medium text-gray-700">Business Name</Label>
              <Input id="businessName" value={profile.businessName} onChange={(e) => setProfile({...profile, businessName: e.target.value})} className="bg-white border-gray-200" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="industry" className="text-sm font-medium text-gray-700">Industry</Label>
              <select id="industry" value={profile.industry} onChange={(e) => setProfile({...profile, industry: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select industry</option>
                <option value="retail">Retail</option>
                <option value="restaurant">Restaurant</option>
                <option value="services">Services</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="businessAddress" className="text-sm font-medium text-gray-700">Business Address</Label>
              <Input id="businessAddress" value={profile.businessAddress} onChange={(e) => setProfile({...profile, businessAddress: e.target.value})} className="bg-white border-gray-200" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="businessPhone" className="text-sm font-medium text-gray-700">Business Phone</Label>
              <Input id="businessPhone" value={profile.businessPhone} onChange={(e) => setProfile({...profile, businessPhone: e.target.value})} className="bg-white border-gray-200" />
            </div>
          </div>
        </FormSection>

        {/* Avatar Upload */}
        <FormSection
          icon={<Camera size={20} />}
          iconColor="p-2 rounded-xl bg-purple-100 text-purple-600"
          title="Profile Photo"
          description="Upload a profile picture"
        >
          <div className="flex items-center gap-4">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                <User size={32} className="text-gray-400" />
              </div>
            )}
            <FileUpload
              accept="image/*"
              value={profile.avatarUrl || ""}
              onChange={(url) =>
                setProfile((p) => ({ ...p, avatarUrl: url }))
              }
              label="Upload photo"
              purpose="USER_AVATAR"
              maxSizeMB={5}
            />
          </div>
        </FormSection>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()} className="border-gray-200">Cancel</Button>
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-6 h-10 rounded-xl font-semibold">
          <Save size={18} className="mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// Updated FormSection without motion
function FormSection({
  icon,
  iconColor,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white">
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl", iconColor)}>{icon}</div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

// SensitiveField component remains the same
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
        className="flex items-center gap-2 text-sm font-medium text-gray-700"
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
          className="flex-1 bg-gray-50 border-gray-200"
        />
        <Button
          variant="outline"
          onClick={onChangeRequest}
          className="rounded-xl border-gray-200 font-medium text-xs hover:border-gray-300"
        >
          Change
        </Button>
      </div>
    </div>
  );
}
