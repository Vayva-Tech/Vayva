import * as React from "react";

import { cn } from "../utils";
import { Card } from "./Card";

export interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({
  title,
  description,
  headerRight,
  children,
  className,
  ...props
}: SectionCardProps): React.JSX.Element {
  return (
    <Card className={cn("p-5 sm:p-6", className)} {...props}>
      {(title || description || headerRight) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-base font-semibold text-text-primary">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-text-secondary">{description}</p>
            )}
          </div>
          {headerRight && <div className="shrink-0">{headerRight}</div>}
        </div>
      )}
      {children}
    </Card>
  );
}
