"use client";

import { Button, Icon, IconName } from "@vayva/ui";
import { motion } from "framer-motion";
import Link from "next/link";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  actionIcon?: IconName;
}

export function EmptyState({
  icon = "PlusCircle",
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
  actionIcon = "PlusCircle",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-[300px] shrink-0 items-center justify-center rounded-md border border-dashed text-center"
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100"
        >
          <Icon name={icon} className="h-10 w-10 text-gray-500" />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.25 }}
          className="mt-4 text-lg font-semibold"
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.25 }}
          className="mb-4 mt-2 text-sm text-gray-500"
        >
          {description}
        </motion.p>

        {actionLabel &&
          (actionHref || actionOnClick) &&
          (actionHref ? (
            <Link href={actionHref}>
              <Button>
                <Icon name={actionIcon} className="mr-2 h-4 w-4" />
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button onClick={actionOnClick}>
              <Icon name={actionIcon} className="mr-2 h-4 w-4" />
              {actionLabel}
            </Button>
          ))}
      </div>
    </motion.div>
  );
}
