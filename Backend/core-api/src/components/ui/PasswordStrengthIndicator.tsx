"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /\d/.test(p) },
  {
    label: "One special character",
    test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
];

export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password }) => {
  const metRequirements = requirements.filter((req) => req.test(password));
  const strength = metRequirements.length;

  const getStrengthLabel = () => {
    if (strength === 0) return "";
    if (strength <= 2) return "Weak";
    if (strength <= 4) return "Medium";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (strength <= 2) return "bg-status-danger";
    if (strength <= 4) return "bg-status-warning";
    return "bg-status-success";
  };

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-white/40 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              getStrengthColor(),
            )}
            style={{ width: `${(strength / requirements.length) * 100}%` }}
          />
        </div>
        {getStrengthLabel() && (
          <span
            className={cn(
              "text-xs font-medium",
              strength <= 2 && "text-status-danger",
              strength > 2 && strength <= 4 && "text-status-warning",
              strength === 5 && "text-status-success",
            )}
          >
            {getStrengthLabel()}
          </span>
        )}
      </div>

      <ul className="space-y-1">
        {requirements.map((req, index) => {
          const isMet = req.test(password);
          return (
            <li
              key={index}
              className={cn(
                "text-xs flex items-center gap-1.5 transition-colors",
                isMet ? "text-status-success" : "text-text-tertiary",
              )}
            >
              <span
                className={cn(
                  "w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px]",
                  isMet ? "bg-status-success text-white" : "bg-white/40",
                )}
              >
                {isMet && "✓"}
              </span>
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
