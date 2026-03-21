"use client";

import * as React from "react";
import { ICON_MAP } from "./icon-map";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
  color?: string;
  className?: string;
  /**
   * Accessibility role for the icon
   * - "img": Icon is decorative or conveys meaning (default)
   * - "presentation": Icon is purely decorative and should be hidden from screen readers
   * - "button": Icon acts as a button (use with aria-label)
   */
  role?: "img" | "presentation" | "button";
  /**
   * Accessible label for the icon (required when role="button" or when icon conveys meaning)
   */
  "aria-label"?: string;
}

export type IconName = string;

export const Icon = ({
  name,
  size = 24,
  className,
  role = "img",
  "aria-label": ariaLabel,
  ...props
}: IconProps): React.JSX.Element | null => {
  const normalizedName = name.toLowerCase();
  const IconComponent = ICON_MAP[normalizedName] || ICON_MAP[name];

  if (!IconComponent) return null;

  // If role is presentation, hide from screen readers
  if (role === "presentation") {
    return <IconComponent size={size} className={className} aria-hidden="true" focusable="false" {...props} />;
  }

  // If role is button or img with aria-label, provide proper accessibility
  return (
    <IconComponent
      size={size}
      className={className}
      role={role}
      aria-label={ariaLabel}
      {...props}
    />
  );
};
