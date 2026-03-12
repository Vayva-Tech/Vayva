import React from "react";
import { Icon } from "@vayva/ui";

type RiskLevel = "Low" | "Medium" | "High";

interface RiskChipProps {
  level: RiskLevel;
  showIcon?: boolean;
}

const RISK_CONFIG: Record<
  RiskLevel,
  { bg: string; text: string; border: string; icon: string; iconColor: string }
> = {
  Low: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    icon: "CheckCircle",
    iconColor: "text-emerald-400",
  },
  Medium: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/20",
    icon: "AlertTriangle",
    iconColor: "text-yellow-400",
  },
  High: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    icon: "AlertOctagon",
    iconColor: "text-red-400",
  },
};

export function RiskChip({ level, showIcon = true }: RiskChipProps) {
  const config = RISK_CONFIG[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold uppercase tracking-wider ${config.bg} ${config.text} ${config.border}`}
    >
      {showIcon && (
        <Icon name={config.icon} size={14} className={config.iconColor} />
      )}
      {level} Risk
    </span>
  );
}
