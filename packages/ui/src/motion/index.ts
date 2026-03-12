"use client";

import { motion, AnimatePresence } from "framer-motion";

export const fadeIn = {
  initial: { opacity: 0, translateY: "5px" },
  animate: { opacity: 1, translateY: "0px" },
  exit: { opacity: 0, translateY: "5px" },
  transition: { duration: 0.2, ease: "easeOut" },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2, ease: "easeOut" },
};

export const hoverLift = {
  scale: 1.02,
  y: -2,
  transition: { duration: 0.2, ease: "easeOut" },
};

export const tapScale = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

export { motion, AnimatePresence };
