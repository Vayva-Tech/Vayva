/**
 * Campaign Create Form Component
 * Platform-specific campaign creation forms
 */

"use client";

import React, { useState } from "react";
import { formatCurrency } from "@vayva/shared";
import {
  Button,
  Input,
  Label,
} from "@vayva/ui";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Target,
  Wallet,
  Calendar,
  Users,
  Sparkle,
  Upload,
} from "@phosphor-icons/react";
import type { AdPlatform, CampaignCreateInput, CampaignObjective } from "@/types/ad-platforms";
import { PLATFORM_CONFIGS } from "@/services/ad-platforms/hub";

interface CampaignCreateFormProps {
  platform: AdPlatform;
  onSubmit: (data: CampaignCreateInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const OBJECTIVES: { value: CampaignObjective; label: string; description: string }[] = [
  { value: "awareness", label: "Brand Awareness", description: "Reach people who are most likely to remember your ads" },
  { value: "traffic", label: "Traffic", description: "Send people to your website or app" },
  { value: "engagement", label: "Engagement", description: "Get more post engagements, page likes, or event responses" },
  { value: "leads", label: "Leads", description: "Collect leads for your business" },
  { value: "sales", label: "Sales", description: "Find people likely to purchase your products" },
  { value: "app_installs", label: "App Installs", description: "Get people to install your app" },
  { value: "conversions", label: "Conversions", description: "Drive valuable actions on your website or app" },
];

export function CampaignCreateForm({
  platform,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CampaignCreateFormProps) {
  const [step, setStep] = useState<"objective" | "settings" | "targeting" | "creative">("objective");
  const [formData, setFormData] = useState<CampaignCreateInput>({
    platform,
    name: "",
    objective: "sales",
    budget: { type: "daily", amount: 10000 }, // ₦10,000 default
    schedule: { startDate: new Date().toISOString().split("T")[0] },
    targeting: {},
    creatives: [],
  });

  const platformConfig = PLATFORM_CONFIGS[platform];

  const handleObjectiveSelect = (objective: CampaignObjective) => {
    setFormData((prev: any) => ({ ...prev, objective }));
    setStep("settings");
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Create Campaign</h2>
          <p className="text-sm text-muted-foreground">
            {platformConfig.name} • {OBJECTIVES.find((o: any) => o.value === formData.objective)?.label}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 text-sm">
        {["objective", "settings", "targeting", "creative"].map((s: any, i: number) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : i < ["objective", "settings", "targeting", "creative"].indexOf(step)
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < ["objective", "settings", "targeting", "creative"].indexOf(step) ? "✓" : i + 1}
            </div>
            <span className={step === s ? "font-medium" : "text-muted-foreground capitalize"}>
              {s}
            </span>
            {i < 3 && <span className="text-muted-foreground mx-1">→</span>}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === "objective" && (
        <ObjectiveStep onSelect={handleObjectiveSelect} />
      )}

      {step === "settings" && (
        <SettingsStep
          formData={formData}
          onChange={setFormData}
          onNext={() => setStep("targeting")}
          onBack={() => setStep("objective")}
        />
      )}

      {step === "targeting" && (
        <TargetingStep
          formData={formData}
          onChange={setFormData}
          onNext={() => setStep("creative")}
          onBack={() => setStep("settings")}
        />
      )}

      {step === "creative" && (
        <CreativeStep
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onBack={() => setStep("targeting")}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

function ObjectiveStep({
  onSelect,
}: {
  onSelect: (objective: CampaignObjective) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {OBJECTIVES.map((obj) => (
        <Card
          key={obj.value}
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => onSelect(obj.value)}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{obj.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {obj.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SettingsStep({
  formData,
  onChange,
  onNext,
  onBack,
}: {
  formData: CampaignCreateInput;
  onChange: (data: CampaignCreateInput) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const dailyBudget = formData.budget.type === "daily" 
    ? formData.budget.amount 
    : Math.round(formData.budget.amount / 30);
  const monthlyEstimate = dailyBudget * 30;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Campaign Budget
        </CardTitle>
        <CardDescription>
          Set your budget. You&apos;ll be billed directly by {formData.platform}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Estimate Summary */}
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Daily Budget:</span>
            <span className="font-medium">{formatCurrency(dailyBudget, "NGN")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated Monthly:</span>
            <span className="font-medium">{formatCurrency(monthlyEstimate, "NGN")}</span>
          </div>
          <p className="text-xs text-muted-foreground pt-2 border-t">
            You&apos;ll pay {formData.platform} directly. We don&apos;t charge extra fees.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Campaign Name</Label>
          <Input
            placeholder="e.g., Summer Sale 2024"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange({ ...formData, name: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Budget Type</Label>
            <Select
              value={formData.budget.type}
              onValueChange={(value: any) =>
                onChange({
                  ...formData,
                  budget: { ...formData.budget, type: value as "daily" | "lifetime" },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Budget</SelectItem>
                <SelectItem value="lifetime">Lifetime Budget</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.budget.type === "daily" ? "Spend this amount per day" : "Total campaign spend limit"}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Amount (₦)</Label>
            <Input
              type="number"
              min={1000}
              step={1000}
              value={formData.budget.amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...formData,
                  budget: {
                    ...formData.budget,
                    amount: parseInt(e.target.value) || 0,
                  },
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Min: ₦1,000 • Billed in {formData.platform === "google" ? "USD" : "local currency"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={formData.schedule.startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...formData,
                  schedule: { ...formData.schedule, startDate: e.target.value },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>End Date (Optional)</Label>
            <Input
              type="date"
              value={formData.schedule.endDate || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...formData,
                  schedule: {
                    ...formData.schedule,
                    endDate: e.target.value || undefined,
                  },
                })
              }
            />
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext} disabled={!formData.name}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TargetingStep({
  formData,
  onChange,
  onNext,
  onBack,
}: {
  formData: CampaignCreateInput;
  onChange: (data: CampaignCreateInput) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState("audience");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Targeting
        </CardTitle>
        <CardDescription>
          Define who should see your ads
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <TabsContent value="audience" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Select audiences to target (custom audiences will appear here once connected)
            </p>
            <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">
              Connect your {formData.platform} account to access custom audiences
            </div>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Age Min</Label>
                <Input
                  type="number"
                  min={13}
                  max={65}
                  placeholder="18"
                  value={formData.targeting?.ageMin || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onChange({
                      ...formData,
                      targeting: {
                        ...formData.targeting,
                        ageMin: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Age Max</Label>
                <Input
                  type="number"
                  min={13}
                  max={65}
                  placeholder="65+"
                  value={formData.targeting?.ageMax || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onChange({
                      ...formData,
                      targeting: {
                        ...formData.targeting,
                        ageMax: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={formData.targeting?.gender || "all"}
                  onValueChange={(value: any) =>
                    onChange({
                      ...formData,
                      targeting: { ...formData.targeting, gender: value as "male" | "female" | "all" },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Target specific locations (available after account connection)
            </p>
            <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">
              Location targeting requires a connected {formData.platform} account
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CreativeStep({
  formData,
  onSubmit,
  onBack,
  isSubmitting,
}: {
  formData: CampaignCreateInput;
  onChange: (data: CampaignCreateInput) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkle className="h-5 w-5" />
          Creative
        </CardTitle>
        <CardDescription>
          Upload your ad creative or use product images
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-muted rounded-lg p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">Upload Creative</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop images or videos, or click to browse
          </p>
          <Button variant="outline">Select Files</Button>
        </div>

        <div className="space-y-2">
          <Label>Headline</Label>
          <Input placeholder="Enter ad headline" />
        </div>

        <div className="space-y-2">
          <Label>Body Text</Label>
          <textarea
            className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm"
            placeholder="Enter ad body text"
          />
        </div>

        <div className="space-y-2">
          <Label>Call to Action</Label>
          <Select defaultValue="shop_now">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shop_now">Shop Now</SelectItem>
              <SelectItem value="learn_more">Learn More</SelectItem>
              <SelectItem value="sign_up">Sign Up</SelectItem>
              <SelectItem value="buy_now">Buy Now</SelectItem>
              <SelectItem value="get_offer">Get Offer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Campaign"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
