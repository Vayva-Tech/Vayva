"use client";

import { Icon, type IconName } from "@vayva/ui";
import { motion } from "framer-motion";

export const StatWidget = ({
  title,
  value,
  loading,
  icon,
}: {
  title: string;
  value: string | number | null;
  loading?: boolean;
  icon?: IconName;
}) => (
  <motion.div
    whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
    className="p-5 bg-background/70 backdrop-blur-xl border border-border shadow-card hover:shadow-elevated transition-shadow duration-300 group rounded-2xl"
  >
    <div className="flex justify-between items-start mb-3">
      <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
        {title}
      </div>
      <div className="p-2 bg-background/30 rounded-xl group-hover:bg-primary transition-colors">
        <Icon
          name={icon || "Activity"}
          size={16}
          className="text-text-tertiary group-hover:text-text-inverse"
        />
      </div>
    </div>
    <div className="text-3xl font-bold text-text-primary">
      {loading ? (
        <div className="h-8 w-24 bg-background/30 rounded-xl animate-pulse" />
      ) : (
        (value ?? "—")
      )}
    </div>
  </motion.div>
);
