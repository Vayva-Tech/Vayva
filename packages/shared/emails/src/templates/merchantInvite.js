"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantInviteEmail = MerchantInviteEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const VayvaGlowLayout_1 = require("../components/VayvaGlowLayout");
const icons_1 = require("../components/icons");
function MerchantInviteEmail(props) {
    return ((0, jsx_runtime_1.jsx)(VayvaGlowLayout_1.VayvaGlowLayout, { preheader: "Team invite", headline: `You’re invited to join ${props.storeName}`, body: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: "#E8FFF2" }, children: props.inviterName }), " ", "invited you to collaborate in Vayva Merchant Admin. Your access will match the role assigned to you."] }), calloutIcon: (0, jsx_runtime_1.jsx)(icons_1.IconMail, {}), calloutTitle: "What you\u2019ll be able to do", calloutText: "Manage products, orders, customers, and payouts \u2014 based on your permissions.", ctaText: "Accept invitation", ctaUrl: props.acceptUrl, footerNote: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["If you weren\u2019t expecting this invite, you can safely ignore this email.", (0, jsx_runtime_1.jsx)("br", {}), "Need help? Reply here or contact", " ", (0, jsx_runtime_1.jsx)("span", { style: { color: "#E8FFF2" }, children: "support@vayva.ng" }), "."] }) }));
}
//# sourceMappingURL=merchantInvite.js.map