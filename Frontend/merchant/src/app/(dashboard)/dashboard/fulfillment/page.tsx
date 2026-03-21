"use client";

import { motion } from "framer-motion";
import { redirect } from "next/navigation";

export default function FulfillmentIndexPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-center h-64"
    >
      <div className="text-center">
        <p className="text-gray-700">Redirecting...</p>
      </div>
    </motion.div>
  );
}
