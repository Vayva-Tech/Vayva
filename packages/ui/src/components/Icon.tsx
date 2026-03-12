"use client";

import * as React from "react";
import { ICON_MAP } from "./icon-map";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
  color?: string;
  className?: string;
}

export type IconName = string;

export const Icon = ({
  name,
  size = 24,
  className,
  ...props
}: IconProps): React.JSX.Element | null => {
  const normalizedName = name.toLowerCase();
  const IconComponent = ICON_MAP[normalizedName] || ICON_MAP[name];

  if (!IconComponent) return null;

  return <IconComponent size={size} className={className} {...props} />;
};
