"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputeOpenedEmail = DisputeOpenedEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const VayvaGlowLayout_1 = require("../components/VayvaGlowLayout");
const icons_1 = require("../components/icons");
function DisputeOpenedEmail(props) {
    return ((0, jsx_runtime_1.jsx)(VayvaGlowLayout_1.VayvaGlowLayout, { preheader: "Dispute opened", headline: "A dispute has been opened on your order", body: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["A customer has opened a dispute for order", " ", (0, jsx_runtime_1.jsx)("strong", { style: { color: "#E8FFF2" }, children: props.refCode }), ". You must respond with evidence before the deadline to avoid an automatic resolution in the customer's favour."] }), calloutIcon: (0, jsx_runtime_1.jsx)(icons_1.IconAlertTriangle, {}), calloutTitle: "Respond by", calloutText: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { style: { color: "#F87171", fontWeight: 800 }, children: props.responseDeadline }), (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsxs)("span", { style: { fontSize: 12, color: "#94A3B8" }, children: ["Reason: ", props.reason] })] }), ctaText: "Respond to dispute", ctaUrl: props.disputeUrl, footerNote: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Provide clear evidence (screenshots, tracking info, communication logs) to support your case.", (0, jsx_runtime_1.jsx)("br", {}), "Need help? Contact", " ", (0, jsx_runtime_1.jsx)("span", { style: { color: "#E8FFF2" }, children: "support@vayva.ng" }), "."] }) }));
}
//# sourceMappingURL=disputeOpened.js.map