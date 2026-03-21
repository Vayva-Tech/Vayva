"use client";

import { useOnboarding } from "../OnboardingContext";
import { Button, Input, Label, Select } from "@vayva/ui";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Building, FileText, CreditCard, Clipboard } from "@phosphor-icons/react/ssr";

export default function B2BSetupStep() {
  const { nextStep, prevStep, updateData, state, isSaving } = useOnboarding();
  const [b2bConfig, setB2bConfig] = useState({
    enableQuotes: true,
    enableCreditAccounts: true,
    enableRequisitions: true,
    defaultCreditLimit: "100000",
    defaultPaymentTerms: "net_30",
    requireApproval: true,
    ...(state as any).b2bConfig,
  });

  const handleNext = () => {
    updateData({ b2bConfig } as any);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <Building className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold">B2B Wholesale Setup</h2>
        <p className="text-gray-500">
          Configure your wholesale business settings
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Default Credit Limit (₦)</Label>
          <Input
            type="number"
            value={b2bConfig.defaultCreditLimit}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setB2bConfig({ ...b2bConfig, defaultCreditLimit: e.target.value })
            }
            placeholder="100000"
          />
          <p className="text-sm text-gray-500">
            Maximum credit amount for new B2B customers
          </p>
        </div>

        <div className="space-y-2">
          <Label>Default Payment Terms</Label>
          <Select
            value={b2bConfig.defaultPaymentTerms}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setB2bConfig({ ...b2bConfig, defaultPaymentTerms: e.target.value })
            }
          >
            <option value="net_15">Net 15</option>
            <option value="net_30">Net 30</option>
            <option value="net_45">Net 45</option>
            <option value="net_60">Net 60</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={b2bConfig.enableQuotes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setB2bConfig({ ...b2bConfig, enableQuotes: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Enable B2B Quotes
            </span>
          </Label>
          <p className="text-sm text-gray-500 ml-6">
            Create and send price quotes to wholesale customers
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={b2bConfig.enableCreditAccounts}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setB2bConfig({ ...b2bConfig, enableCreditAccounts: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Enable Credit Accounts
            </span>
          </Label>
          <p className="text-sm text-gray-500 ml-6">
            Offer credit terms to qualified B2B customers
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={b2bConfig.enableRequisitions}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setB2bConfig({ ...b2bConfig, enableRequisitions: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span className="flex items-center gap-2">
              <Clipboard className="w-4 h-4" />
              Enable Purchase Requisitions
            </span>
          </Label>
          <p className="text-sm text-gray-500 ml-6">
            Allow customers to submit bulk purchase requests
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={b2bConfig.requireApproval}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setB2bConfig({ ...b2bConfig, requireApproval: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span>Require approval for new B2B accounts</span>
          </Label>
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
