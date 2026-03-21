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
    className="p-5 bg-white  border border-gray-100  hover:shadow-lg transition-shadow duration-300 group rounded-2xl"
  >
    <div className="flex justify-between items-start mb-3">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </div>
      <div className="p-2 bg-white rounded-xl group-hover:bg-green-500 transition-colors">
        <Icon
          name={icon || "Activity"}
          size={16}
          className="text-gray-400 group-hover:text-white"
        />
      </div>
    </div>
    <div className="text-3xl font-bold text-gray-900">
      {loading ? (
        <div className="h-8 w-24 bg-white rounded-xl animate-pulse" />
      ) : (
        (value ?? "—")
      )}
    </div>
  </motion.div>
);
