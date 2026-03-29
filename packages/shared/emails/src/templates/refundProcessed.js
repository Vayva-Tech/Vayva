"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundProcessedEmail = RefundProcessedEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const VayvaGlowLayout_1 = require("../components/VayvaGlowLayout");
const icons_1 = require("../components/icons");
function RefundProcessedEmail(props) {
    return ((0, jsx_runtime_1.jsx)(VayvaGlowLayout_1.VayvaGlowLayout, { preheader: "Refund processed", headline: "Your refund has been processed", body: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["A refund of", " ", (0, jsx_runtime_1.jsxs)("strong", { style: { color: "#E8FFF2" }, children: [props.currency === "NGN" ? "\u20A6" : props.currency, props.amount] }), " ", "for order", " ", (0, jsx_runtime_1.jsx)("strong", { style: { color: "#E8FFF2" }, children: props.refCode }), " has been processed. It may take 3\u20135 business days to appear in your account."] }), calloutIcon: (0, jsx_runtime_1.jsx)(icons_1.IconRefund, {}), calloutTitle: "Refund amount", calloutText: (0, jsx_runtime_1.jsxs)("span", { style: { color: "#E8FFF2", fontWeight: 800 }, children: [props.currency === "NGN" ? "\u20A6" : props.currency, props.amount] }), ctaText: "View order", ctaUrl: props.orderUrl, footerNote: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["If you don't see the refund after 5 business days, contact", " ", (0, jsx_runtime_1.jsx)("span", { style: { color: "#E8FFF2" }, children: "support@vayva.ng" }), "."] }) }));
}
//# sourceMappingURL=refundProcessed.js.map