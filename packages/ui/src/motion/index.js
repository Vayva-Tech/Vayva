"use client";
import { motion, AnimatePresence } from "framer-motion";
export const fadeIn = {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 5 },
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
    transition: { duration: 0.2 },
};
export const tapScale = {
    scale: 0.98,
    transition: { duration: 0.1 },
};
export { motion, AnimatePresence };
