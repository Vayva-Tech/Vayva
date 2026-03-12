"use client";

import React from "react";
import { NIGERIAN_STATES } from "@/lib/i18n/addressNG";
import { COPY } from "@/lib/i18n/copy";

interface AddressInputNGProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (val: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
          Address Line 1
        </label>
        <input
          value={value?.addressLine1 || ""}
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          onChange={(e: any) =>
            handleChange(
              "addressLine1",
              (e as React.ChangeEvent<HTMLInputElement>).target.value,
            )
          }
          className="w-full border p-2 rounded"
          placeholder="123 Street Name"
        />
        {errors?.addressLine1 && (
          <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
            {COPY.STATE_LABEL}
          </label>
          <select
            value={value?.state || ""}
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            onChange={(e: any) =>
              handleChange(
                "state",
                (e as React.ChangeEvent<HTMLInputElement>).target.value,
              )
            }
            className="w-full border p-2 rounded bg-white"
          >
            <option value="">Select State</option>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {NIGERIAN_STATES.map((s: any) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors?.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
            {COPY.LGA_LABEL}
          </label>
          <input
            value={value?.city || ""}
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            onChange={(e: any) =>
              handleChange(
                "city",
                (e as React.ChangeEvent<HTMLInputElement>).target.value,
              )
            }
            className="w-full border p-2 rounded"
            placeholder="e.g. Ikeja"
          />
          {errors?.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
          {COPY.LANDMARK_LABEL} <span className="text-red-500">*</span>
        </label>
        <input
          value={value?.landmark || ""}
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          onChange={(e: any) =>
            handleChange(
              "landmark",
              (e as React.ChangeEvent<HTMLInputElement>).target.value,
            )
          }
          className="w-full border p-2 rounded"
          placeholder={COPY.LANDMARK_PLACEHOLDER}
        />
        {errors?.landmark && (
          <p className="text-red-500 text-xs mt-1">{errors.landmark}</p>
        )}
      </div>
    </div>
  );
}
