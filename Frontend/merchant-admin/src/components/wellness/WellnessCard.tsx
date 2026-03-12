"use client";

import { ReactNode } from "react";
import { Card } from "@vayva/ui";

interface WellnessCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export function WellnessCard({ title, children, className = "", headerAction }: WellnessCardProps) {
  return (
    <Card className={`rounded-xl shadow-lg border bg-card ${className}`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {headerAction}
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </Card>
  );
}