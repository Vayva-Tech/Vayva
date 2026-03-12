import * as React from "react";

import Link from "next/link";

import { cn } from "../utils";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";

export type PageBreadcrumb = {
  label: string;
  href?: string;
};

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: PageBreadcrumb[];
  leadingIcon?: IconName;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: IconName;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: IconName;
  };
  rightSlot?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  leadingIcon,
  primaryAction,
  secondaryAction,
  rightSlot,
  className,
}: PageHeaderProps): React.JSX.Element {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary"
        >
          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={`${b.label}-${idx}`}>
              {b.href ? (
                <Link
                  href={b.href}
                  className="hover:text-text-secondary transition-colors"
                >
                  {b.label}
                </Link>
              ) : (
                <span className="text-text-secondary">{b.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && (
                <span className="text-text-tertiary">/</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          {leadingIcon && (
            <div className="h-12 w-12 rounded-2xl bg-status-success/10 border border-border flex items-center justify-center shrink-0">
              <Icon
                name={leadingIcon}
                className="text-status-success"
                size={22}
              />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-text-primary truncate">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-text-secondary max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
          {rightSlot}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="rounded-xl"
            >
              {secondaryAction.icon && (
                <Icon name={secondaryAction.icon} size={16} />
              )}
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button onClick={primaryAction.onClick} className="rounded-xl">
              {primaryAction.icon && (
                <Icon name={primaryAction.icon} size={16} />
              )}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
