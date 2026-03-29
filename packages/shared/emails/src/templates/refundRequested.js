"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundRequestedEmail = RefundRequestedEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const VayvaGlowLayout_1 = require("../components/VayvaGlowLayout");
const icons_1 = require("../components/icons");
function RefundRequestedEmail(props) {
    return ((0, jsx_runtime_1.jsx)(VayvaGlowLayout_1.VayvaGlowLayout, { preheader: "Refund requested", headline: "A customer has requested a refund", body: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: "#E8FFF2" }, children: props.customerName }), " has requested a refund of", " ", (0, jsx_runtime_1.jsxs)("strong", { style: { color: "#E8FFF2" }, children: [props.currency === "NGN" ? "\u20A6" : props.currency, props.amount] }), " ", "for order", " ", (0, jsx_runtime_1.jsx)("strong", { style: { color: "#E8FFF2" }, children: props.refCode }), ".", props.reason && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [" ", "Reason: ", (0, jsx_runtime_1.jsx)("em", { children: props.reason }), "."] }))] }), calloutIcon: (0, jsx_runtime_1.jsx)(icons_1.IconRefund, {}), calloutTitle: "Action required", calloutText: "Review the request and approve or decline the refund from your dashboard.", ctaText: "Review refund request", ctaUrl: props.orderUrl, footerNote: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Responding quickly helps maintain customer trust and your store rating.", (0, jsx_runtime_1.jsx)("br", {}), "Need help? Contact", " ", (0, jsx_runtime_1.jsx)("span", { style: { color: "#E8FFF2" }, children: "support@vayva.ng" }), "."] }) }));
}
//# sourceMappingURL=refundRequested.js.map