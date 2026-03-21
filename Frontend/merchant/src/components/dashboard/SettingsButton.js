'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SettingsPanel } from '../settings-panel';
import { Settings } from 'lucide-react';
export function SettingsButton({ className }) {
    const [showSettings, setShowSettings] = useState(false);
    return (_jsxs(_Fragment, { children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowSettings(true), className: className, title: "Settings", children: [_jsx(Settings, { className: "h-4 w-4 mr-2" }), "Settings"] }), showSettings && (_jsx(SettingsPanel, { onClose: () => setShowSettings(false) }))] }));
}
