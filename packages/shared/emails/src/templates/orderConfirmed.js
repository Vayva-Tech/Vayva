"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderConfirmedEmail = OrderConfirmedEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const VayvaGlowLayout_1 = require("../components/VayvaGlowLayout");
const icons_1 = require("../components/icons");
function OrderConfirmedEmail(props) {
    return ((0, jsx_runtime_1.jsx)(VayvaGlowLayout_1.VayvaGlowLayout, { preheader: "Order confirmed", headline: "Order confirmed", body: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "Thanks for your order. We\u2019ve received it and will keep you updated as it progresses." }), calloutIcon: (0, jsx_runtime_1.jsx)(icons_1.IconReceipt, {}), calloutTitle: "Order reference", calloutText: (0, jsx_runtime_1.jsx)("span", { style: { color: "#E8FFF2", fontWeight: 800 }, children: props.refCode }), ctaText: "View order", ctaUrl: props.orderUrl }));
}
//# sourceMappingURL=orderConfirmed.js.map