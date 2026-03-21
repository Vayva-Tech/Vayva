'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, ChefHat } from 'lucide-react';
/**
 * KitchenChat Component
 *
 * Real-time chat for kitchen staff with:
 * - Station-specific channels
 * - Quick message templates
 * - Typing indicators
 * - Audio alerts integration
 */
export function KitchenChat({ storeId, stationId, userId, userName }) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    // Quick message templates for kitchen
    const quickMessages = [
        '🔥 Behind!',
        '⏰ Need expo!',
        '✅ 86\'d item',
        '📋 Order up!',
        '⚠️ Allergy alert!',
        '🔄 Remake needed',
    ];
    /**
     * Scroll to bottom when new messages arrive
     */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    /**
     * Send message via WebSocket
     */
    const sendMessage = (msg) => {
        if (!msg.trim())
            return;
        const newMessage = {
            id: `msg_${Date.now()}`,
            storeId,
            stationId,
            userId,
            userName,
            message: msg,
            timestamp: Date.now(),
            type: 'text',
        };
        setMessages(prev => [...prev, newMessage]);
        // Broadcast via WebSocket (would integrate with real backend)
        window.dispatchEvent(new CustomEvent('kds:chat-message', { detail: newMessage }));
        setMessage('');
    };
    /**
     * Handle typing indicator
     */
    const handleTyping = () => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        // Emit typing event
        window.dispatchEvent(new CustomEvent('kds:typing', {
            storeId,
            stationId,
            userId,
            userName,
        }));
        typingTimeoutRef.current = setTimeout(() => {
            // Stop typing indicator after 2 seconds
        }, 2000);
    };
    /**
     * Listen for incoming messages
     */
    useEffect(() => {
        const handleMessage = (event) => {
            const msg = event.detail;
            if (msg.storeId === storeId && (!stationId || msg.stationId === stationId)) {
                setMessages(prev => [...prev, msg]);
            }
        };
        const handleTypingUser = (event) => {
            const { userId: typingUserId, userName: typingUserName } = event.detail;
            if (typingUserId !== userId) {
                setTypingUsers(prev => [...prev.filter(id => id !== typingUserId), typingUserName]);
                // Clear typing indicator after 2 seconds
                setTimeout(() => {
                    setTypingUsers(prev => prev.filter(name => name !== typingUserName));
                }, 2000);
            }
        };
        window.addEventListener('kds:chat-message', handleMessage);
        window.addEventListener('kds:typing', handleTypingUser);
        return () => {
            window.removeEventListener('kds:chat-message', handleMessage);
            window.removeEventListener('kds:typing', handleTypingUser);
        };
    }, [storeId, stationId, userId]);
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    return (_jsx("div", { className: "fixed bottom-4 right-4 z-50", children: !isOpen ? (_jsxs("button", { onClick: () => setIsOpen(true), className: "p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors", children: [_jsx(MessageSquare, { className: "h-6 w-6" }), messages.length > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center", children: messages.length }))] })) : (
        /* Chat Window */
        _jsxs("div", { className: "w-80 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden", children: [_jsxs("div", { className: "bg-blue-600 text-white p-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ChefHat, { className: "h-5 w-5" }), _jsx("span", { className: "font-semibold", children: "Kitchen Chat" }), typingUsers.length > 0 && (_jsxs("span", { className: "text-xs text-blue-200", children: [typingUsers.join(', '), " typing..."] }))] }), _jsx("button", { onClick: () => setIsOpen(false), className: "text-blue-200 hover:text-white", children: "\u2715" })] }), _jsxs("div", { className: "h-64 overflow-y-auto p-3 space-y-2 bg-gray-50", children: [messages.map((msg) => (_jsxs("div", { className: `flex flex-col ${msg.userId === userId ? 'items-end' : 'items-start'}`, children: [_jsx("div", { className: `max-w-[80%] px-3 py-2 rounded-lg ${msg.userId === userId
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-900'}`, children: msg.type === 'alert' ? (_jsxs("div", { className: "flex items-center gap-1 text-red-600 font-semibold", children: ["\u26A0\uFE0F ", msg.message] })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-sm", children: msg.message }), _jsx("p", { className: `text-xs mt-1 ${msg.userId === userId ? 'text-blue-200' : 'text-gray-500'}`, children: formatTime(msg.timestamp) })] })) }), msg.userId !== userId && (_jsx("span", { className: "text-xs text-gray-500 mt-1 ml-1", children: msg.userName }))] }, msg.id))), _jsx("div", { ref: messagesEndRef })] }), _jsx("div", { className: "p-2 bg-gray-100 border-t border-gray-200", children: _jsx("div", { className: "flex flex-wrap gap-1 mb-2", children: quickMessages.map((quickMsg) => (_jsx("button", { onClick: () => sendMessage(quickMsg), className: "px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors", children: quickMsg }, quickMsg))) }) }), _jsxs("div", { className: "p-3 bg-white border-t border-gray-200 flex gap-2", children: [_jsx("input", { type: "text", value: message, onChange: (e) => {
                                setMessage(e.target.value);
                                handleTyping();
                            }, onKeyPress: (e) => {
                                if (e.key === 'Enter') {
                                    sendMessage(message);
                                }
                            }, placeholder: "Type a message...", className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("button", { onClick: () => sendMessage(message), disabled: !message.trim(), className: "p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: _jsx(Send, { className: "h-5 w-5" }) })] })] })) }));
}
