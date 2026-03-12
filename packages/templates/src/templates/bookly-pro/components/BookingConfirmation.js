import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { Button } from "@vayva/ui";
import { Check, Calendar, ArrowRight } from "lucide-react";
export const BookingConfirmation = ({ bookingDetails, onClose, }) => {
    // Auto-close test
    useEffect(() => {
        // const timer = setTimeout(onClose, 5000);
        // return () => clearTimeout(timer);
    }, [onClose]);
    return (_jsx("div", { className: "fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-6", children: _jsxs("div", { className: "bg-background/70 backdrop-blur-xl rounded-2xl max-w-md w-full p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300", children: [_jsx("div", { className: "w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6", children: _jsx(Check, { size: 40, strokeWidth: 3 }) }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Booking Confirmed!" }), _jsx("p", { className: "text-gray-500 mb-8", children: "We've sent a confirmation email to you." }), _jsxs("div", { className: "bg-background/40 backdrop-blur-sm rounded-xl p-5 mb-8", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2 text-gray-900 font-medium", children: [_jsx(Calendar, { size: 18, className: "text-blue-600" }), _jsxs("span", { children: [bookingDetails.date, "th at ", bookingDetails.time] })] }), _jsx("div", { className: "text-left pl-8 text-sm text-gray-500", children: "Please arrive 5 minutes early." })] }), _jsxs(Button, { onClick: onClose, className: "w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2", children: ["Done ", _jsx(ArrowRight, { size: 18 })] })] }) }));
};
