import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@vayva/ui";
import { Calendar, Clock, CheckCircle, X } from "lucide-react";
export const ViewingModal = ({ isOpen, onClose, listingTitle, }) => {
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    if (!isOpen)
        return null;
    const dates = ["Mon, 12 Oct", "Tue, 13 Oct", "Wed, 14 Oct"];
    const times = ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"];
    const handleSubmit = (e) => {
        e.preventDefault();
        setStep(2);
        setTimeout(() => {
            onClose();
            setStep(1); // reset
        }, 3000);
    };
    if (step === 2) {
        return (_jsx("div", { className: "fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200", children: _jsxs("div", { className: "bg-background/70 backdrop-blur-xl rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl", children: [_jsx("div", { className: "w-20 h-20 bg-blue-50 text-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-6", children: _jsx(CheckCircle, { size: 40 }) }), _jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Request Sent!" }), _jsxs("p", { className: "text-gray-500 mb-6", children: ["The agent will contact you shortly to confirm your viewing for", " ", _jsx("span", { className: "font-bold text-gray-900", children: selectedDate }), " at", " ", _jsx("span", { className: "font-bold text-gray-900", children: selectedTime }), "."] }), _jsx(Button, { onClick: onClose, className: "text-sm font-bold text-gray-400 hover:text-gray-600", children: "Close" })] }) }));
    }
    return (_jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4", children: _jsxs("div", { className: "bg-background/70 backdrop-blur-xl rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200", children: [_jsxs("div", { className: "p-5 border-b border-gray-100 flex justify-between items-center bg-background/40 backdrop-blur-sm", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-bold text-lg text-gray-900", children: "Schedule Viewing" }), _jsx("p", { className: "text-xs text-gray-500 truncate max-w-[250px]", children: listingTitle })] }), _jsx(Button, { onClick: onClose, className: "p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500", children: _jsx(X, { size: 20 }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("label", { className: "block text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2", children: [_jsx(Calendar, { size: 14 }), " Select Date"] }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-2", children: dates.map((date) => (_jsx(Button, { type: "button", onClick: () => setSelectedDate(date), className: `px-4 py-2 rounded-lg border text-sm font-bold whitespace-nowrap transition-all ${selectedDate === date ? "border-[#2563EB] bg-blue-50 text-[#2563EB]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`, children: date }, date))) })] }), _jsxs("div", { className: "mb-8", children: [_jsxs("label", { className: "block text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2", children: [_jsx(Clock, { size: 14 }), " Select Time"] }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: times.map((time) => (_jsx(Button, { type: "button", onClick: () => setSelectedTime(time), className: `px-4 py-3 rounded-lg border text-sm font-bold transition-all ${selectedTime === time ? "border-[#2563EB] bg-blue-50 text-[#2563EB]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`, children: time }, time))) })] }), _jsxs("div", { className: "space-y-4 mb-8", children: [_jsx("input", { type: "text", placeholder: "Your Name", required: true, className: "w-full bg-background/40 backdrop-blur-sm border-transparent focus:bg-white/80 border focus:border-[#2563EB] rounded-lg px-4 py-3 text-sm focus:outline-none transition-all" }), _jsx("input", { type: "tel", placeholder: "Phone Number", required: true, className: "w-full bg-background/40 backdrop-blur-sm border-transparent focus:bg-white/80 border focus:border-[#2563EB] rounded-lg px-4 py-3 text-sm focus:outline-none transition-all" })] }), _jsx(Button, { type: "submit", disabled: !selectedDate || !selectedTime, className: "w-full bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors shadow-lg", children: "Request Appointment" })] })] }) }));
};
