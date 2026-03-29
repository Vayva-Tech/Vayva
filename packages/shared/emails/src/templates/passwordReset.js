"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetEmail = PasswordResetEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const VayvaGlowLayout_1 = require("../components/VayvaGlowLayout");
const icons_1 = require("../components/icons");
function PasswordResetEmail(props) {
    return ((0, jsx_runtime_1.jsx)(VayvaGlowLayout_1.VayvaGlowLayout, { preheader: "Security", headline: "Reset your password", body: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "We received a request to reset your password for Vayva Merchant Admin." }), calloutIcon: (0, jsx_runtime_1.jsx)(icons_1.IconLock, {}), calloutTitle: "This link expires soon", calloutText: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["For your security, this reset link expires in", " ", (0, jsx_runtime_1.jsxs)("strong", { style: { color: "#E8FFF2" }, children: [props.minutes, " minutes"] }), "."] }), ctaText: "Reset password", ctaUrl: props.resetUrl, footerNote: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["If you didn\u2019t request a password reset, you can ignore this email \u2014 your password won\u2019t change.", (0, jsx_runtime_1.jsx)("br", {}), "Need help? Contact", " ", (0, jsx_runtime_1.jsx)("span", { style: { color: "#E8FFF2" }, children: "support@vayva.ng" }), "."] }) }));
}
//# sourceMappingURL=passwordReset.js.map