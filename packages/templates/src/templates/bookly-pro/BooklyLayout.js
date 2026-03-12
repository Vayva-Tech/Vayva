import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { BooklyHeader } from "./components/BooklyHeader";
import { ServiceHero } from "./components/ServiceHero";
import { ServiceList } from "./components/ServiceList";
import { BookingWizard } from "./components/BookingWizard";
import { BookingConfirmation } from "./components/BookingConfirmation";
export const BooklyLayout = ({ store, products }) => {
    const [selectedService, setSelectedService] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(null);
    const handleBook = (service) => {
        setSelectedService(service);
    };
    const handleBookingComplete = (details) => {
        setBookingSuccess(details);
        setSelectedService(null);
    };
    const handleCloseWizard = () => {
        setSelectedService(null);
    };
    const handleCloseSuccess = () => {
        setBookingSuccess(null);
    };
    return (_jsxs("div", { className: "min-h-screen bg-background/40 backdrop-blur-sm font-sans text-gray-900", children: [_jsx(BooklyHeader, { storeName: store.name, phone: store.contact.phone }), _jsxs("main", { children: [_jsx(ServiceHero, { headline: store.tagline || undefined, subheadline: "Experience the difference of a professional service." }), _jsx(ServiceList, { services: products, onBook: handleBook }), _jsxs("footer", { className: "bg-gray-900 text-white py-12 px-6 text-center", children: [_jsx("h4", { className: "font-bold text-lg mb-4", children: store.name }), _jsx("p", { className: "text-gray-400 text-sm mb-8", children: store.policies?.shipping ||
                                    "Professional services directly to you." }), _jsxs("p", { className: "text-gray-500 text-xs", children: ["\u00A9 ", new Date().getFullYear(), " Bookly Pro. Powered by Vayva."] })] })] }), selectedService && (_jsx(BookingWizard, { service: selectedService, onClose: handleCloseWizard, onComplete: handleBookingComplete })), bookingSuccess && (_jsx(BookingConfirmation, { bookingDetails: bookingSuccess, onClose: handleCloseSuccess }))] }));
};
