"use client";

import { Tray as Inbox } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageEmptyProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function PageEmpty({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: PageEmptyProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-[300px] px-6",
        className,
      )}
    >
      <div className="flex flex-col items-center text-center max-w-md space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/[0.04]">
          <Icon className="h-7 w-7 text-text-tertiary" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
        {actionLabel &&
          (actionHref || onAction) &&
          (actionHref ? (
            <Link href={actionHref}>
              <Button>{actionLabel}</Button>
            </Link>
          ) : (
            <Button onClick={onAction}>{actionLabel}</Button>
          ))}
      </div>
    </div>
  );
}
