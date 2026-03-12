"use client";

import { Input, Select } from "@vayva/ui";
import React from "react";
import { NIGERIAN_STATES } from "@/lib/i18n/addressNG";
import { COPY } from "@/lib/i18n/copy";

interface AddressInputNGProps {
      value: any;
      onChange: (val: any) => void;
      errors?: any;
}

export function AddressInputNG({
  value,
  onChange,
  errors,
}: AddressInputNGProps) {
  const handleChange = (field: string, val: string) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase text-text-tertiary mb-1">
          Address Line 1
        </label>
        <Input value={value?.addressLine1 || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChange("addressLine1", e.target.value)
          }
          className="w-full border border-border bg-background px-4 h-12 rounded-xl text-sm focus:outline-none focus:border-vayva-green focus:ring-2 focus:ring-vayva-green/20"
          placeholder="123 Street Name"
        />
        {errors?.addressLine1 && (
          <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase text-text-tertiary mb-1">
            {COPY.STATE_LABEL}
          </label>
          <Select
            value={value?.state || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleChange("state", e.target.value)
            }
            className="w-full border border-border bg-background px-4 h-12 rounded-xl text-sm focus:outline-none focus:border-vayva-green focus:ring-2 focus:ring-vayva-green/20"
          >
            <option value="">Select State</option>
            {NIGERIAN_STATES.map((s: string) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          {errors?.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-text-tertiary mb-1">
            {COPY.LGA_LABEL}
          </label>
          <Input value={value?.city || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("city", e.target.value)
            }
            className="w-full border border-border bg-background px-4 h-12 rounded-xl text-sm focus:outline-none focus:border-vayva-green focus:ring-2 focus:ring-vayva-green/20"
            placeholder="e.g. Ikeja"
          />
          {errors?.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-text-tertiary mb-1">
          {COPY.LANDMARK_LABEL} <span className="text-red-500">*</span>
        </label>
        <Input value={value?.landmark || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChange("landmark", e.target.value)
          }
          className="w-full border border-border bg-background px-4 h-12 rounded-xl text-sm focus:outline-none focus:border-vayva-green focus:ring-2 focus:ring-vayva-green/20"
          placeholder={COPY.LANDMARK_PLACEHOLDER}
        />
        {errors?.landmark && (
          <p className="text-red-500 text-xs mt-1">{errors.landmark}</p>
        )}
      </div>
    </div>
  );
}
