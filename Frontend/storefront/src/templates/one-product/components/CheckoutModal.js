import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { X, ShoppingBag, CheckCircle } from "lucide-react";
import { Button } from "@vayva/ui";
export const CheckoutModal = ({ isOpen, onClose, product, qty, upsellProduct, }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [upsellAdded, setUpsellAdded] = useState(false);
    const [step, setStep] = useState(1);
    const [confirmationData, setConfirmationData] = useState(null);
    if (!isOpen)
        return null;
    const total = product.price * qty +
        (upsellAdded && upsellProduct ? upsellProduct.price : 0);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Determine items
            const items = [
                {
                    productId: product.id,
                    variantId: product.variants?.[0]?.id, // Default variant if any
                    title: product.name,
                    price: product.price,
                    quantity: qty,
                },
            ];
            if (upsellAdded && upsellProduct) {
                items.push({
                    productId: upsellProduct.id,
                    variantId: upsellProduct.variants?.[0]?.id,
                    title: upsellProduct.name,
                    price: upsellProduct.price,
                    quantity: 1,
                });
            }
            // Real API Call to Backend
            // Only works if storeId is available on product (it should be)
            // If CORS is an issue, we might need a proxy in next.config.js, but let's assume same-domain or CORS enabled.
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:3000/api")}/orders/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId: product.storeId, // Force cast if missing in type definition, checked in next step
                    items,
                    customer: {
                        firstName: fullName.split(" ")[0],
                        lastName: fullName.split(" ")[1] || "",
                        email: email,
                        phone: "08000000000", // Placeholder if not asked
                    },
                    deliveryMethod: "DELIVERY",
                    paymentMethod: "BANK_TRANSFER", // Default for V1
                    shippingAddress: {
                        recipientName: fullName,
                        addressLine1: address,
                        city: city,
                        addressState: state, // Aligning naming
                    },
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setConfirmationData(data); // Save response data for display
                setStep(2);
                // Removed setTimeout to allow user to read bank details
            }
            else {
                alert("Failed to place order. Please try again.");
            }
        }
        catch (err) {
            console.error(err);
            alert("Something went wrong.");
        }
        finally {
            setLoading(false);
        }
    };
    if (step === 2) {
        return (_jsx("div", { className: "fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in", children: _jsxs("div", { className: "bg-background/70 backdrop-blur-xl rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl", children: [_jsx("div", { className: "w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6", children: _jsx(CheckCircle, { size: 40 }) }), _jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Order Confirmed!" }), _jsxs("p", { className: "text-gray-500 mb-6", children: ["Ref: ", _jsx("b", { children: confirmationData?.orderNumber }), _jsx("br", {}), "We've sent a receipt to ", _jsx("b", { children: email }), "."] }), confirmationData?.bankDetails && (_jsxs("div", { className: "bg-background/40 backdrop-blur-sm p-4 rounded-xl text-left border border-gray-200 mb-6", children: [_jsx("p", { className: "text-xs font-bold uppercase text-gray-500 mb-2", children: "Please transfer to:" }), _jsxs("div", { className: "text-sm space-y-1", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Bank:" }), " ", _jsx("span", { className: "font-semibold", children: confirmationData.bankDetails.bankName })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Account:" }), " ", _jsx("span", { className: "font-semibold text-lg", children: confirmationData.bankDetails.accountNumber })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Name:" }), " ", _jsx("span", { className: "font-semibold", children: confirmationData.bankDetails.accountName })] })] }), _jsxs("div", { className: "mt-3 text-xs text-center text-gray-400", children: ["Paying to ", _jsx("b", { children: confirmationData?.storeName })] })] })), _jsx(Button, { onClick: onClose, className: "w-full bg-black text-white font-bold py-3 rounded-xl h-auto", "aria-label": "I have made payment", children: "I have made payment" })] }) }));
    }
    return (_jsx("div", { className: "fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm animate-in slide-in-from-right-10 duration-300", children: _jsxs("div", { className: "w-full max-w-md bg-background/70 backdrop-blur-xl h-full shadow-2xl flex flex-col", children: [_jsxs("div", { className: "p-4 border-b border-gray-100 flex items-center justify-between", children: [_jsxs("h2", { className: "font-bold text-lg text-gray-900 flex items-center gap-2", children: [_jsx(ShoppingBag, { size: 20 }), " Checkout"] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, className: "h-auto", "aria-label": "Close checkout", children: _jsx(X, { size: 24, className: "text-gray-400" }) })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-6", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-xs font-bold text-gray-400 uppercase mb-4", children: "Order Summary" }), _jsxs("div", { className: "flex gap-4 mb-4", children: [_jsx("div", { className: "w-16 h-16 bg-background/50 backdrop-blur-sm rounded-lg overflow-hidden shrink-0", children: _jsx("img", { src: product.images?.[0], alt: product.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-bold text-sm text-gray-900", children: product.name }), _jsxs("div", { className: "flex justify-between mt-1", children: [_jsxs("span", { className: "text-sm text-gray-500", children: ["Qty: ", qty] }), _jsxs("span", { className: "font-bold text-sm", children: ["\u20A6", (product.price * qty).toLocaleString()] })] })] })] }), upsellProduct && (_jsx("div", { className: `border-2 rounded-xl p-4 transition-all ${upsellAdded ? "border-green-500 bg-green-50" : "border-dashed border-gray-300"}`, children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("input", { id: "upsell-added", type: "checkbox", checked: upsellAdded, onChange: () => setUpsellAdded(!upsellAdded), className: "mt-1 w-5 h-5 rounded text-green-600 focus:ring-green-500", "aria-label": `Add ${upsellProduct.name} to order` }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("span", { className: "font-bold text-sm text-gray-900 block mb-1", children: ["One-time Offer: Add ", upsellProduct.name, "?"] }), _jsxs("span", { className: "font-bold text-sm text-gray-900", children: [" ", "+\u20A6", upsellProduct.price.toLocaleString()] })] }), _jsx("p", { className: "text-xs text-gray-500 mb-2", children: upsellProduct.description })] })] }) }))] }), _jsxs("form", { id: "checkout-form", onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "checkout-email", className: "block text-xs font-bold text-gray-700 uppercase mb-1", children: "Contact Info" }), _jsx("input", { id: "checkout-email", type: "email", placeholder: "Email Address", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "checkout-fullname", className: "block text-xs font-bold text-gray-700 uppercase mb-1", children: "Shipping Address" }), _jsx("input", { id: "checkout-fullname", type: "text", placeholder: "Full Name", required: true, value: fullName, onChange: (e) => setFullName(e.target.value), className: "w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:outline-none mb-2", "aria-label": "Full Name" }), _jsx("input", { id: "checkout-address", type: "text", placeholder: "Street Address", required: true, value: address, onChange: (e) => setAddress(e.target.value), className: "w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:outline-none mb-2", "aria-label": "Street Address" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { id: "checkout-city", type: "text", placeholder: "City", required: true, value: city, onChange: (e) => setCity(e.target.value), className: "w-1/2 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:outline-none", "aria-label": "City" }), _jsx("input", { id: "checkout-state", type: "text", placeholder: "State", required: true, value: state, onChange: (e) => setState(e.target.value), className: "w-1/2 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:outline-none", "aria-label": "State" })] })] })] })] }), _jsxs("div", { className: "p-4 border-t border-gray-100 bg-background/40 backdrop-blur-sm", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("span", { className: "font-medium text-gray-600", children: "Total to pay" }), _jsxs("span", { className: "font-black text-2xl text-gray-900", children: ["\u20A6", total.toLocaleString()] })] }), _jsx(Button, { form: "checkout-form", type: "submit", disabled: loading, className: "w-full bg-[#111827] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black transition-all disabled:opacity-50 h-auto", "aria-label": loading ? "Processing order" : `Pay ₦${total.toLocaleString()}`, children: loading ? "Processing..." : `Pay ₦${total.toLocaleString()}` }), _jsx("div", { className: "text-center mt-3 flex items-center justify-center gap-2 text-xs text-gray-400", children: _jsx("span", { children: "\uD83D\uDD12 Secure Checkout" }) })] })] }) }));
};
