"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "./Button";
export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    useEffect(() => {
        // Check if previously dismissed
        const ignored = localStorage.getItem("vayva_pwa_prompt_dismissed");
        if (ignored)
            return;
        // Check if running on iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(isIosDevice);
        // Check strict standalone mode
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone ||
            document.referrer.includes("android-app://");
        if (isStandalone) {
            return; // Already installed/running as app
        }
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show the prompt after a small delay to not annoy immediately
            setTimeout(() => setIsVisible(true), 1500);
        };
        window.addEventListener("beforeinstallprompt", handler);
        // For iOS, show if not standalone
        if (isIosDevice && !isStandalone) {
            // Optionally show instructions for iOS immediately or wait
            setTimeout(() => setIsVisible(true), 2000);
        }
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);
    const handleDismiss = () => {
        localStorage.setItem("vayva_pwa_prompt_dismissed", "true");
        setIsVisible(false);
    };
    const handleInstallClick = async () => {
        if (isIOS) {
            // iOS doesn't support programmatic install, show instructions
            alert("To install Vayva:\n1. Tap the Share button below\n2. Select 'Add to Home Screen'");
            // Don't dismiss permanently on iOS instruction click, maybe they failed. 
            // Or maybe we do? Let's just close for now.
            setIsVisible(false);
            return;
        }
        if (!deferredPrompt)
            return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setDeferredPrompt(null);
            setIsVisible(false);
            // Ideally track successful install
        }
    };
    if (!isVisible)
        return null;
    return (_jsx("div", { className: "fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500", children: _jsxs("div", { className: "bg-white rounded-xl shadow-2xl border border-gray-100 p-4 max-w-sm w-full flex items-start gap-4", children: [_jsx("div", { className: "bg-gray-900 w-12 h-12 rounded-lg flex items-center justify-center shrink-0 shadow-inner", children: _jsx("span", { className: "text-white font-bold text-xl", children: "V" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-bold text-gray-900 text-sm mb-1", children: "Install Vayva App" }), _jsx("p", { className: "text-xs text-gray-500 mb-3 leading-relaxed", children: "Install our web app for a faster, full-screen experience on your device." }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: handleInstallClick, size: "sm", className: "h-8 text-xs bg-[#22C55E] hover:bg-[#16A34A] text-white", children: [_jsx(Download, { className: "w-3 h-3 mr-1.5" }), isIOS ? "How to Install" : "Install App"] }), _jsx(Button, { onClick: handleDismiss, size: "sm", variant: "ghost", className: "h-8 text-xs text-gray-500 hover:text-gray-900", children: "Later" })] })] }), _jsx(Button, { onClick: handleDismiss, variant: "ghost", size: "icon", className: "text-gray-400 hover:text-gray-600 w-auto h-auto p-1", children: _jsx(X, { size: 16 }) })] }) }));
}
