"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from "react";
import { cn } from "../utils";
import { X as XIcon } from "lucide-react";
import { Button } from "./Button";
export function Drawer({ isOpen, onClose, title, children, className, }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);
    if (!isOpen)
        return null;
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity", onClick: onClose }), _jsxs("div", { className: cn("fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50", "transform transition-transform duration-300 ease-in-out", "flex flex-col", className), children: [title && (_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b", children: [_jsx("h2", { className: "text-lg font-semibold", children: title }), _jsx(Button, { onClick: onClose, variant: "ghost", size: "icon", className: "hover:bg-gray-100", children: _jsx(XIcon, { className: "w-5 h-5" }) })] })), _jsx("div", { className: "flex-1 overflow-y-auto px-6 py-4", children: children })] })] }));
}
