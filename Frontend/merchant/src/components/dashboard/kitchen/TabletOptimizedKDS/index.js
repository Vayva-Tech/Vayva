'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ActiveTicketsByStation } from './ActiveTicketsByStation';
import { KitchenStatus } from './KitchenStatus';
import { StationWorkload } from './StationWorkload';
import { EightySixBoard } from './EightySixBoard';
import { ChefHat, Maximize2, Minimize2 } from 'lucide-react';
/**
 * TabletOptimizedKDS Component
 *
 * Tablet-optimized full-screen KDS view with:
 * - Larger touch targets (56px minimum)
 * - Simplified navigation
 * - High contrast mode
 * - One-handed operation support
 * - Landscape orientation optimized
 */
export function TabletOptimizedKDS() {
    const [currentTheme, setCurrentTheme] = useState('fire');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeView, setActiveView] = useState('tickets');
    const themeClasses = {
        fire: 'kitchen-theme-fire',
        steel: 'kitchen-theme-steel',
        'chef-green': 'kitchen-theme-chef-green',
        midnight: 'kitchen-theme-midnight',
        brigade: 'kitchen-theme-brigade',
    };
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        }
        else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };
    return (_jsxs("div", { className: `${themeClasses[currentTheme]} min-h-screen bg-kds-background`, children: [_jsx("header", { className: "border-b border-kds-card-border bg-kds-card-bg backdrop-blur-sm sticky top-0 z-40", children: _jsx("div", { className: "px-6 py-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-kds-primary/20 rounded-lg", children: _jsx(ChefHat, { className: "h-8 w-8 text-kds-primary" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-kds-text-primary", children: "KDS" }), _jsx("p", { className: "text-xs text-kds-text-secondary", children: "Tablet View" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("select", { value: currentTheme, onChange: (e) => setCurrentTheme(e.target.value), className: "px-3 py-2 bg-kds-card-bg border border-kds-card-border text-kds-text-primary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kds-primary", children: [_jsx("option", { value: "fire", children: "\uD83D\uDD25 Fire" }), _jsx("option", { value: "steel", children: "\uD83C\uDFED Steel" }), _jsx("option", { value: "chef-green", children: "\uD83D\uDC68\u200D\uD83C\uDF73 Green" }), _jsx("option", { value: "midnight", children: "\uD83C\uDF19 Midnight" }), _jsx("option", { value: "brigade", children: "\uD83D\uDD34 Brigade" })] }), _jsx("button", { onClick: toggleFullscreen, className: "p-2 text-kds-text-secondary hover:text-kds-text-primary transition-colors", title: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen', children: isFullscreen ? (_jsx(Minimize2, { className: "h-6 w-6" })) : (_jsx(Maximize2, { className: "h-6 w-6" })) })] })] }) }) }), _jsx("nav", { className: "fixed bottom-0 left-0 right-0 bg-kds-card-bg border-t border-kds-card-border safe-area-inset-bottom z-40", children: _jsxs("div", { className: "grid grid-cols-4 gap-2 px-4 py-2", children: [_jsxs("button", { onClick: () => setActiveView('tickets'), className: `flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${activeView === 'tickets'
                                ? 'bg-kds-primary text-white'
                                : 'text-kds-text-secondary hover:bg-kds-hover'}`, children: [_jsx("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }) }), _jsx("span", { className: "text-xs font-medium", children: "Tickets" })] }), _jsxs("button", { onClick: () => setActiveView('status'), className: `flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${activeView === 'status'
                                ? 'bg-kds-primary text-white'
                                : 'text-kds-text-secondary hover:bg-kds-hover'}`, children: [_jsx("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) }), _jsx("span", { className: "text-xs font-medium", children: "Status" })] }), _jsxs("button", { onClick: () => setActiveView('stations'), className: `flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${activeView === 'stations'
                                ? 'bg-kds-primary text-white'
                                : 'text-kds-text-secondary hover:bg-kds-hover'}`, children: [_jsx("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" }) }), _jsx("span", { className: "text-xs font-medium", children: "Stations" })] }), _jsxs("button", { onClick: () => setActiveView('86'), className: `flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${activeView === '86'
                                ? 'bg-kds-primary text-white'
                                : 'text-kds-text-secondary hover:bg-kds-hover'}`, children: [_jsx("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }), _jsx("span", { className: "text-xs font-medium", children: "86 Board" })] })] }) }), _jsxs("main", { className: "px-6 pb-24 pt-4 min-h-[calc(100vh-140px)]", children: [activeView === 'tickets' && (_jsx("div", { className: "space-y-4", children: _jsx(ActiveTicketsByStation, { designCategory: currentTheme, industry: "food", planTier: "pro" }) })), activeView === 'status' && (_jsxs("div", { className: "space-y-4", children: [_jsx(KitchenStatus, { designCategory: currentTheme, industry: "food", planTier: "pro" }), _jsx(StationWorkload, { designCategory: currentTheme, industry: "food", planTier: "pro" })] })), activeView === 'stations' && (_jsx("div", { className: "space-y-4", children: _jsx(StationWorkload, { designCategory: currentTheme, industry: "food", planTier: "pro" }) })), activeView === '86' && (_jsx("div", { className: "space-y-4", children: _jsx(EightySixBoard, { designCategory: currentTheme, industry: "food", planTier: "pro" }) }))] }), _jsx("style", { jsx: true, global: true, children: `
        @media (min-width: 768px) {
          button {
            min-height: 56px;
            min-width: 56px;
          }
          
          select {
            min-height: 48px;
          }
        }
      ` })] }));
}
