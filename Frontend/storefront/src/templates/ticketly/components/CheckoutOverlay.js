import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { X, ArrowRight, Lock } from "lucide-react";
import { Button } from "@vayva/ui";
export const CheckoutOverlay = ({ storeId, productId, total, count, onClose, onComplete, }) => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId,
                    items: [{ id: productId, quantity: count, price: total / count, title: "Ticket" }], // Simple mapping
                    total,
                    subtotal: total,
                    customer: { email, firstName: name.split(" ")[0] },
                    paymentMethod: "BANK_TRANSFER",
                    deliveryMethod: "digital"
                })
            });
            if (res.ok) {
                const data = await res.json();
                onComplete({
                    attendee: { name, email },
                    bankDetails: data.bankDetails,
                    storeName: data.storeName,
                    orderNumber: data.orderNumber
                });
            }
            else {
                alert("Failed to create ticket order.");
                setIsProcessing(false);
            }
        }
        catch (err) {
            console.error(err);
            setIsProcessing(false);
            alert("Something went wrong");
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4", children: _jsxs("div", { className: "bg-background/70 backdrop-blur-xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "p-4 border-b border-gray-100 flex items-center justify-between", children: [_jsx("h3", { className: "font-bold text-lg", children: "Checkout" }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, className: "p-2 hover:bg-white/60 rounded-full h-auto", "aria-label": "Close checkout", children: _jsx(X, { size: 20 }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-6 overflow-y-auto", children: [_jsxs("div", { className: "bg-background/40 backdrop-blur-sm p-4 rounded-xl space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Tickets" }), _jsxs("span", { className: "font-bold", children: [count, "x"] })] }), _jsxs("div", { className: "flex justify-between text-lg font-black pt-2 border-t border-gray-200", children: [_jsx("span", { children: "Total" }), _jsxs("span", { className: "text-purple-600", children: ["\u20A6", total.toLocaleString()] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold text-gray-700 mb-1", children: "Full Name" }), _jsx("input", { required: true, type: "text", value: name, onChange: (e) => setName(e.target.value), className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent", placeholder: "E.g. John Doe" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold text-gray-700 mb-1", children: "Email Address" }), _jsx("input", { required: true, type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent", placeholder: "john@example.com" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Tickets will be sent here." })] })] })] }), _jsxs("div", { className: "p-4 border-t border-gray-100", children: [_jsx(Button, { onClick: handleSubmit, disabled: isProcessing, className: "w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-70 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all h-auto", "aria-label": isProcessing ? "Processing order" : `Pay ₦${total.toLocaleString()}`, children: isProcessing ? ("Processing...") : (_jsxs(_Fragment, { children: ["Pay \u20A6", total.toLocaleString(), " ", _jsx(ArrowRight, { size: 18 })] })) }), _jsxs("div", { className: "flex justify-center items-center gap-2 mt-3 text-xs text-gray-400", children: [_jsx(Lock, { size: 10 }), " Secured by Vayva Pay"] })] })] }) }));
};
