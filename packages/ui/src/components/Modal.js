import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "./Icon";
import { cn } from "../utils";
import { Button } from "./Button";
export const Modal = ({ isOpen, onClose, title, children, className, }) => {
    return (_jsx(AnimatePresence, { children: isOpen && (_jsx(_Fragment, { children: _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose, className: "fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors", children: _jsxs(motion.div, { initial: { scale: 0.95, opacity: 0, y: 10 }, animate: { scale: 1, opacity: 1, y: 0 }, exit: { scale: 0.95, opacity: 0, y: 10 }, onClick: (e) => e.stopPropagation(), className: cn("bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]", className), children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-100", children: [_jsx("h3", { className: "font-bold text-lg text-gray-900", children: title }), _jsx(Button, { onClick: onClose, variant: "ghost", size: "icon", className: "w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100", children: _jsx(Icon, { name: "X", size: 18 }) })] }), _jsx("div", { className: "p-6 overflow-y-auto", children: children })] }) }) })) }));
};
