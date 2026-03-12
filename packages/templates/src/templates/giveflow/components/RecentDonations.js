import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const RecentDonations = () => {
    const donations = [
        { name: "Anonymous", amount: 5000, time: "2 mins ago" },
        {
            name: "Sarah J.",
            amount: 25000,
            time: "5 mins ago",
            message: "Keep up the great work!",
        },
        { name: "Michael O.", amount: 10000, time: "12 mins ago" },
        {
            name: "Faith K.",
            amount: 50000,
            time: "1 hour ago",
            message: "Sending love from Lagos.",
        },
    ];
    return (_jsx("div", { className: "bg-background/70 backdrop-blur-xl border-t border-gray-100 py-12", children: _jsxs("div", { className: "max-w-6xl mx-auto px-6", children: [_jsx("h3", { className: "font-bold text-xl text-gray-900 mb-8", children: "Recent Donations" }), _jsx("div", { className: "grid md:grid-cols-2 gap-6", children: donations.map((d, i) => (_jsxs("div", { className: "flex gap-4 p-4 rounded-xl hover:bg-white/60 transition-colors", children: [_jsx("div", { className: "w-12 h-12 bg-green-100 text-[#16A34A] rounded-full flex items-center justify-center font-bold text-lg", children: d.name.charAt(0) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "font-bold text-gray-900", children: d.name }), _jsx("span", { className: "text-gray-300", children: "\u2022" }), _jsxs("span", { className: "text-[#16A34A] font-bold", children: ["donated \u20A6", d.amount.toLocaleString()] })] }), d.message && (_jsxs("p", { className: "text-sm text-gray-600 italic", children: ["\"", d.message, "\""] })), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: d.time })] })] }, i))) })] }) }));
};
