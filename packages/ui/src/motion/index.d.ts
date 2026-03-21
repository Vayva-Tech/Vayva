import { motion, AnimatePresence } from "framer-motion";
export declare const fadeIn: {
    initial: {
        opacity: number;
        translateY: string;
    };
    animate: {
        opacity: number;
        translateY: string;
    };
    exit: {
        opacity: number;
        translateY: string;
    };
    transition: {
        duration: number;
        ease: string;
    };
};
export declare const scaleIn: {
    initial: {
        opacity: number;
        scale: number;
    };
    animate: {
        opacity: number;
        scale: number;
    };
    exit: {
        opacity: number;
        scale: number;
    };
    transition: {
        duration: number;
        ease: string;
    };
};
export declare const hoverLift: {
    scale: number;
    y: number;
    transition: {
        duration: number;
        ease: string;
    };
};
export declare const tapScale: {
    scale: number;
    transition: {
        duration: number;
    };
};
export { motion, AnimatePresence };
