"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentReceivedEmail = PaymentReceivedEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const VayvaGlowLayout_1 = require("../components/VayvaGlowLayout");
const icons_1 = require("../components/icons");
function PaymentReceivedEmail(props) {
    return ((0, jsx_runtime_1.jsx)(VayvaGlowLayout_1.VayvaGlowLayout, { preheader: "Payment successful", headline: "Payment received", body: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "Your payment has been confirmed. We\u2019ll continue processing your order." }), calloutIcon: (0, jsx_runtime_1.jsx)(icons_1.IconCheck, {}), calloutTitle: "Payment reference", calloutText: (0, jsx_runtime_1.jsx)("span", { style: { color: "#E8FFF2", fontWeight: 800 }, children: props.paymentReference }), ctaText: "See receipt", ctaUrl: props.receiptUrl }));
}
//# sourceMappingURL=paymentReceived.js.map