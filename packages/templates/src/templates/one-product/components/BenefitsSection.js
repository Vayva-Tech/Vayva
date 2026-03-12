import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Battery, Zap, VolumeX, CheckCircle, Shield } from "lucide-react";
const IconMap = {
    battery: Battery,
    zap: Zap,
    "volume-x": VolumeX,
    shield: Shield,
    check: CheckCircle,
};
export const BenefitsSection = ({ benefits }) => {
    return (_jsx("section", { id: "features", className: "py-20 bg-background/40 backdrop-blur-sm", children: _jsxs("div", { className: "max-w-6xl mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("span", { className: "text-[#16A34A] font-bold uppercase tracking-wider text-xs mb-2 block", children: "Why Choose Vayva" }), _jsx("h2", { className: "text-3xl font-black text-gray-900", children: "Thoughtfully Designed for You" })] }), _jsx("div", { className: "grid md:grid-cols-3 gap-8", children: benefits.map((benefit, idx) => {
                        const Icon = IconMap[benefit.icon] || CheckCircle;
                        return (_jsxs("div", { className: "bg-background/70 backdrop-blur-xl p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow", children: [_jsx("div", { className: "w-14 h-14 bg-background/50 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 text-gray-900", children: _jsx(Icon, { size: 28 }) }), _jsx("h3", { className: "font-bold text-xl mb-3 text-gray-900", children: benefit.title }), _jsx("p", { className: "text-gray-600 leading-relaxed", children: benefit.description })] }, idx));
                    }) })] }) }));
};
