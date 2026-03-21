"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";

export interface HubModule {
  id: string;
  title: string;
  description: string;
  icon: Icon;
  href: string;
  color:
    | "blue"
    | "green"
    | "amber"
    | "purple"
    | "red"
    | "emerald"
    | "cyan"
    | "orange"
    | "pink"
    | "indigo"
    | "violet"
    | "rose"
    | "sky";
}

const HUB_COLOR_STYLES: Record<HubModule["color"], { bg: string; icon: string }> = {
  blue: { bg: "bg-green-500/10", icon: "text-green-500" },
  green: { bg: "bg-status-success/10", icon: "text-status-success" },
  emerald: { bg: "bg-status-success/10", icon: "text-status-success" },
  amber: { bg: "bg-status-warning/10", icon: "text-status-warning" },
  purple: { bg: "bg-green-50-purple/10", icon: "text-green-600-purple" },
  red: { bg: "bg-status-danger/10", icon: "text-status-danger" },
  cyan: { bg: "bg-green-50-cyan/10", icon: "text-green-600-cyan" },
  orange: { bg: "bg-status-warning/10", icon: "text-status-warning" },
  pink: { bg: "bg-green-50-pink/10", icon: "text-green-600-pink" },
  indigo: { bg: "bg-green-50-indigo/10", icon: "text-green-600-indigo" },
  rose: { bg: "bg-status-danger/10", icon: "text-status-danger" },
  violet: { bg: "bg-green-50-purple/10", icon: "text-green-600-purple" },
  sky: { bg: "bg-green-500/10", icon: "text-green-500" },
};

interface HubCardProps {
  module: HubModule;
}

export function HubCard({ module }: HubCardProps) {
  const router = useRouter();
  const Icon = module.icon;
  const colorStyles = HUB_COLOR_STYLES[module.color];

  return (
    <Card
      className="cursor-pointer hover:shadow-md hover:border-green-500/20 transition-all duration-200 group h-full"
      onClick={() => router.push(module.href)}
      role="link"
      tabIndex={0}
      onKeyDown={(e: any) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(module.href);
        }
      }}
      aria-label={`${module.title}: ${module.description}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div 
            className={`p-2.5 rounded-lg ${colorStyles.bg}`}
            aria-hidden="true"
          >
            <Icon className={`h-5 w-5 ${colorStyles.icon}`} />
          </div>
          <ArrowRight 
            className="h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors" 
            aria-hidden="true"
          />
        </div>
        <CardTitle className="text-base mt-3">{module.title}</CardTitle>
        <CardDescription className="text-sm">
          {module.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

interface HubGridProps {
  modules: HubModule[];
  columns?: 1 | 2 | 3 | 4;
}

export function HubGrid({ modules, columns = 3 }: HubGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <nav 
      className={`grid ${gridCols[columns]} gap-4`}
      aria-label="Module navigation"
    >
      {modules.map((module) => (
        <HubCard key={module.id} module={module} />
      ))}
    </nav>
  );
}
