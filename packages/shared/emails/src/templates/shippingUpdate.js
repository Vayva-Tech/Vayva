"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingUpdateEmail = ShippingUpdateEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const VayvaGlowLayout_1 = require("../components/VayvaGlowLayout");
const icons_1 = require("../components/icons");
function ShippingUpdateEmail(props) {
    const statusLabel = props.status === "SHIPPED"
        ? "shipped"
        : props.status === "DELIVERED"
            ? "delivered"
            : "updated";
    return ((0, jsx_runtime_1.jsx)(VayvaGlowLayout_1.VayvaGlowLayout, { preheader: `Shipping ${statusLabel}`, headline: `Your order has been ${statusLabel}`, body: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Order ", (0, jsx_runtime_1.jsx)("strong", { style: { color: "#E8FFF2" }, children: props.refCode }), " ", "has been ", statusLabel, ".", props.trackingUrl && ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: " You can track your delivery using the link below." }))] }), calloutIcon: (0, jsx_runtime_1.jsx)(icons_1.IconTruck, {}), calloutTitle: "Shipping status", calloutText: (0, jsx_runtime_1.jsx)("span", { style: {
                color: "#E8FFF2",
                fontWeight: 800,
                textTransform: "uppercase",
            }, children: props.status }), ctaText: props.trackingUrl ? "Track delivery" : "View order", ctaUrl: props.trackingUrl || props.orderUrl, footerNote: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Questions about your delivery? Reply to this email or contact", " ", (0, jsx_runtime_1.jsx)("span", { style: { color: "#E8FFF2" }, children: "support@vayva.ng" }), "."] }) }));
}
//# sourceMappingURL=shippingUpdate.js.map