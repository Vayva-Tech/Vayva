"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderCancelledEmail = OrderCancelledEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const VayvaGlowLayout_1 = require("../components/VayvaGlowLayout");
const icons_1 = require("../components/icons");
function OrderCancelledEmail(props) {
    return ((0, jsx_runtime_1.jsx)(VayvaGlowLayout_1.VayvaGlowLayout, { preheader: "Order cancelled", headline: "Your order has been cancelled", body: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Order ", (0, jsx_runtime_1.jsx)("strong", { style: { color: "#E8FFF2" }, children: props.refCode }), " ", "has been cancelled.", props.reason && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [" ", "Reason: ", (0, jsx_runtime_1.jsx)("em", { children: props.reason }), "."] })), " ", "If a payment was made, a refund will be processed automatically."] }), calloutIcon: (0, jsx_runtime_1.jsx)(icons_1.IconX, {}), calloutTitle: "Order reference", calloutText: (0, jsx_runtime_1.jsx)("span", { style: { color: "#E8FFF2", fontWeight: 800 }, children: props.refCode }), ctaText: "View order details", ctaUrl: props.orderUrl, footerNote: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Think this was a mistake? Reply to this email or contact", " ", (0, jsx_runtime_1.jsx)("span", { style: { color: "#E8FFF2" }, children: "support@vayva.ng" }), "."] }) }));
}
//# sourceMappingURL=orderCancelled.js.map