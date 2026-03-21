'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { logger } from "@vayva/shared";
const ALERT_SOUNDS = {
    urgent: '/sounds/kds-urgent.mp3',
    overdue: '/sounds/kds-overdue.mp3',
    bump: '/sounds/kds-bump.mp3',
    chat: '/sounds/kds-chat.mp3',
    '86-item': '/sounds/kds-86.mp3',
};
const ALERT_PATTERNS = {
    urgent: { duration: 1000, pattern: [200, 100, 200, 100, 200] }, // Triple beep
    overdue: { duration: 2000, pattern: [500, 200, 500, 200, 500] }, // Long urgent beeps
    bump: { duration: 500, pattern: [300] }, // Single pleasant beep
    chat: { duration: 400, pattern: [200, 100, 200] }, // Double beep
    '86-item': { duration: 800, pattern: [400, 150, 400] }, // Warning tone
};
/**
 * AudioAlertManager Component
 *
 * Manages audio alerts for kitchen operations
 * Uses Web Audio API for precise control
 */
export function AudioAlertManager({ storeId, enabled = true }) {
    const audioContextRef = useRef(null);
    const isEnabledRef = useRef(enabled);
    const lastAlertTimeRef = useRef(new Map());
    const [isMuted, setIsMuted] = React.useState(false);
    // Initialize AudioContext
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);
    // Update ref when enabled prop changes
    useEffect(() => {
        isEnabledRef.current = enabled;
    }, [enabled]);
    /**
     * Play synthesized beep pattern
     */
    const playBeepPattern = useCallback((alertType) => {
        if (!isEnabledRef.current || isMuted || !audioContextRef.current)
            return;
        const now = audioContextRef.current.currentTime;
        const pattern = ALERT_PATTERNS[alertType];
        pattern.pattern.forEach((duration, index) => {
            const oscillator = audioContextRef.current.createOscillator();
            const gainNode = audioContextRef.current.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);
            // Different frequencies for different alert types
            const frequency = alertType === 'overdue' ? 880 : // A5
                alertType === 'urgent' ? 660 : // E5
                    alertType === '86-item' ? 440 : // A4
                        523.25; // C5
            oscillator.frequency.value = frequency;
            oscillator.type = 'square';
            const startTime = now + pattern.pattern.slice(0, index).reduce((a, b) => a + b / 1000, 0);
            gainNode.gain.setValueAtTime(0.1, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration / 1000);
            oscillator.start(startTime);
            oscillator.stop(startTime + duration / 1000);
        });
    }, [isMuted]);
    /**
     * Play audio file (fallback for complex sounds)
     */
    const playAudioFile = useCallback((alertType) => {
        if (!isEnabledRef.current || isMuted)
            return;
        const audio = new Audio(ALERT_SOUNDS[alertType]);
        audio.volume = 0.5;
        audio.play().catch(console.error);
    }, [isMuted]);
    /**
     * Trigger alert with rate limiting
     */
    const triggerAlert = useCallback((alertType, force = false) => {
        const now = Date.now();
        const lastAlert = lastAlertTimeRef.current.get(alertType) || 0;
        // Rate limit: max once per 3 seconds for same alert type
        if (!force && now - lastAlert < 3000) {
            return;
        }
        lastAlertTimeRef.current.set(alertType, now);
        // Try synthesized sounds first, fall back to audio files
        playBeepPattern(alertType);
        // Optionally also play audio file for richer sounds
        if (alertType === 'urgent' || alertType === 'overdue') {
            setTimeout(() => playAudioFile(alertType), 100);
        }
    }, [playBeepPattern, playAudioFile]);
    /**
     * Listen for WebSocket audio alerts
     */
    useEffect(() => {
        if (!storeId)
            return;
        const handleAudioAlert = (event) => {
            const { type } = event.detail;
            triggerAlert(type);
        };
        window.addEventListener('kds-audio-alert', handleAudioAlert);
        return () => {
            window.removeEventListener('kds-audio-alert', handleAudioAlert);
        };
    }, [storeId, triggerAlert]);
    /**
     * Toggle mute
     */
    const toggleMute = () => {
        setIsMuted(!isMuted);
        // Also persist preference
        localStorage.setItem('kds-mute', String(!isMuted));
    };
    // Load mute preference on mount
    useEffect(() => {
        const savedMute = localStorage.getItem('kds-mute');
        if (savedMute !== null) {
            setIsMuted(savedMute === 'true');
        }
    }, []);
    return (_jsx("button", { onClick: toggleMute, className: `p-2 rounded-lg transition-colors ${isMuted
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`, title: isMuted ? 'Unmute alerts' : 'Mute alerts', children: isMuted ? (_jsx(VolumeX, { className: "h-5 w-5" })) : (_jsx(Volume2, { className: "h-5 w-5" })) }));
}
/**
 * Hook to trigger audio alerts from components
 */
export function useAudioAlert() {
    const triggerAlert = (alertType, force = false) => {
        window.dispatchEvent(new CustomEvent('kds-audio-alert', {
            detail: { type: alertType },
        }));
    };
    return { triggerAlert };
}
