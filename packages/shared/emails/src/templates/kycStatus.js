"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycStatusEmail = KycStatusEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const VayvaGlowLayout_1 = require("../components/VayvaGlowLayout");
const icons_1 = require("../components/icons");
function KycStatusEmail(props) {
    const isApproved = props.status === "VERIFIED";
    return ((0, jsx_runtime_1.jsx)(VayvaGlowLayout_1.VayvaGlowLayout, { preheader: isApproved ? "KYC approved" : "KYC update required", headline: isApproved
            ? "Your identity has been verified"
            : "Your KYC submission needs attention", body: isApproved ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Great news! The identity verification for", " ", (0, jsx_runtime_1.jsx)("strong", { style: { color: "#E8FFF2" }, children: props.storeName }), " has been approved. You can now receive payouts and access all platform features."] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["The identity verification for", " ", (0, jsx_runtime_1.jsx)("strong", { style: { color: "#E8FFF2" }, children: props.storeName }), " ", "could not be completed.", props.reason && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [" ", "Reason: ", (0, jsx_runtime_1.jsx)("em", { children: props.reason }), "."] })), " ", "Please update your information and resubmit."] })), calloutIcon: (0, jsx_runtime_1.jsx)(icons_1.IconShield, {}), calloutTitle: "Verification status", calloutText: (0, jsx_runtime_1.jsx)("span", { style: {
                color: isApproved ? "#22C55E" : "#F87171",
                fontWeight: 800,
                textTransform: "uppercase",
            }, children: isApproved ? "Verified" : "Action required" }), ctaText: isApproved ? "Go to dashboard" : "Update KYC", ctaUrl: props.dashboardUrl, footerNote: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [isApproved
                    ? "Your verification is complete. No further action is needed."
                    : "If you believe this is an error, please contact support.", (0, jsx_runtime_1.jsx)("br", {}), "Need help? Contact", " ", (0, jsx_runtime_1.jsx)("span", { style: { color: "#E8FFF2" }, children: "support@vayva.ng" }), "."] }) }));
}
//# sourceMappingURL=kycStatus.js.map