"use client";

import { useOnboarding } from "../OnboardingContext";
import { Button, Input, Label, Select } from "@vayva/ui";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Heart, Target, Users, CurrencyDollar as DollarSign } from "@phosphor-icons/react/ssr";

export default function NonprofitSetupStep() {
  const { nextStep, prevStep, updateData, state, isSaving } = useOnboarding();
  const [nonprofitConfig, setNonprofitConfig] = useState({
    enableCampaigns: true,
    enableDonations: true,
    enableVolunteers: true,
    enableGrants: false,
    organizationType: "ngo",
    registrationNumber: "",
    causeCategories: [] as string[],
    donationGoal: "1000000",
    ...(state as any).nonprofitConfig,
  });

  const handleNext = () => {
    updateData({ nonprofitConfig } as any);
    nextStep();
  };

  const causeOptions = [
    "Education",
    "Healthcare",
    "Poverty Alleviation",
    "Environment",
    "Youth Empowerment",
    "Women's Rights",
    "Disaster Relief",
    "Arts & Culture",
  ];

  const toggleCause = (cause: string) => {
    const updated = nonprofitConfig.causeCategories.includes(cause)
      ? nonprofitConfig.causeCategories.filter((c: any) => c !== cause)
      : [...nonprofitConfig.causeCategories, cause];
    setNonprofitConfig({ ...nonprofitConfig, causeCategories: updated });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <Heart className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold">Nonprofit Organization Setup</h2>
        <p className="text-gray-500">
          Configure your fundraising and volunteer management
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Organization Type
          </Label>
          <Select
            value={nonprofitConfig.organizationType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setNonprofitConfig({ ...nonprofitConfig, organizationType: e.target.value })
            }
          >
            <option value="ngo">NGO (Non-Governmental Organization)</option>
            <option value="charity">Charity Foundation</option>
            <option value="religious">Religious Organization</option>
            <option value="educational">Educational Institution</option>
            <option value="healthcare">Healthcare Organization</option>
            <option value="community">Community Association</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Registration Number (CAC/NGO Board)</Label>
          <Input
            value={nonprofitConfig.registrationNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNonprofitConfig({ ...nonprofitConfig, registrationNumber: e.target.value })
            }
            placeholder="e.g., CAC/IT/12345"
          />
        </div>

        <div className="space-y-2">
          <Label>Primary Cause Categories</Label>
          <div className="grid grid-cols-2 gap-2">
            {causeOptions.map((cause) => (
              <label key={cause} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={nonprofitConfig.causeCategories.includes(cause)}
                  onChange={() => toggleCause(cause)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{cause}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Annual Fundraising Goal (₦)
          </Label>
          <Input
            type="number"
            value={nonprofitConfig.donationGoal}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNonprofitConfig({ ...nonprofitConfig, donationGoal: e.target.value })
            }
            placeholder="1000000"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={nonprofitConfig.enableCampaigns}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNonprofitConfig({ ...nonprofitConfig, enableCampaigns: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span>Enable Fundraising Campaigns</span>
          </Label>
          <p className="text-sm text-gray-500 ml-6">
            Create and manage fundraising campaigns with goals and deadlines
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={nonprofitConfig.enableDonations}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNonprofitConfig({ ...nonprofitConfig, enableDonations: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span>Enable Online Donations</span>
          </Label>
          <p className="text-sm text-gray-500 ml-6">
            Accept one-time and recurring donations online
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={nonprofitConfig.enableVolunteers}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNonprofitConfig({ ...nonprofitConfig, enableVolunteers: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Enable Volunteer Management
            </span>
          </Label>
          <p className="text-sm text-gray-500 ml-6">
            Track volunteers, shifts, and activities
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={nonprofitConfig.enableGrants}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNonprofitConfig({ ...nonprofitConfig, enableGrants: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span>Enable Grant Tracking</span>
          </Label>
          <p className="text-sm text-gray-500 ml-6">
            Track grant applications, funding, and compliance
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} disabled={isSaving}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={isSaving}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
