"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { LOCALES } from "@/data/locales";
import { X, MapPin } from "lucide-react";
import { Button } from "@vayva/ui";
export function AddressModal({ lang, isOpen, onClose, onSave, }) {
    const t = LOCALES[lang].account.addresses.form;
    // Form State
    const [title, setTitle] = useState("");
    const [city, setCity] = useState("İstanbul");
    const [district, setDistrict] = useState("");
    const [neighborhood, setNeighborhood] = useState("");
    const [address, setAddress] = useState("");
    const [notes, setNotes] = useState("");
    if (!isOpen)
        return null;
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            title,
            city,
            district,
            neighborhood,
            address,
            notes,
            isDefault: false,
        });
        // Reset
        setTitle("");
        setDistrict("");
        setNeighborhood("");
        setAddress("");
        setNotes("");
        onClose();
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "absolute inset-0 bg-black/40 backdrop-blur-sm", onClick: onClose }), _jsxs("div", { className: "bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10", children: [_jsxs("h2", { className: "text-lg font-bold flex items-center gap-2", children: [_jsx(MapPin, { size: 20 }), t.titleAdd] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-full transition-colors h-auto", "aria-label": "Close address modal", children: _jsx(X, { size: 20 }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "address-title", className: "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2", children: t.titleLabel }), _jsx("input", { id: "address-title", required: true, type: "text", value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Ev, \u0130\u015F, Annemler...", className: "w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "address-city", className: "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2", children: t.city }), _jsxs("select", { id: "address-city", value: city, onChange: (e) => setCity(e.target.value), className: "w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-medium", children: [_jsx("option", { value: "\u0130stanbul", children: "\u0130stanbul" }), _jsx("option", { value: "Ankara", children: "Ankara" }), _jsx("option", { value: "\u0130zmir", children: "\u0130zmir" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "address-district", className: "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2", children: t.district }), _jsx("input", { id: "address-district", required: true, type: "text", value: district, onChange: (e) => setDistrict(e.target.value), className: "w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "address-neighborhood", className: "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2", children: t.neighborhood }), _jsx("input", { id: "address-neighborhood", required: true, type: "text", value: neighborhood, onChange: (e) => setNeighborhood(e.target.value), className: "w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "address-details", className: "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2", children: t.address }), _jsx("textarea", { id: "address-details", required: true, rows: 3, value: address, onChange: (e) => setAddress(e.target.value), className: "w-full p-3 bg-gray-50 border border-gray-100 rounded-xl resize-none" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "address-notes", className: "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2", children: t.notes }), _jsx("input", { id: "address-notes", type: "text", value: notes, onChange: (e) => setNotes(e.target.value), className: "w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" })] }), _jsxs("div", { className: "pt-4 flex gap-3", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: onClose, className: "flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-xl h-auto", "aria-label": "Cancel", children: t.cancel }), _jsx(Button, { type: "submit", className: "flex-1 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors h-auto", "aria-label": "Save address", children: t.save })] })] })] })] }));
}
