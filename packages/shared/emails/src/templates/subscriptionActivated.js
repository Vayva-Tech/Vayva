"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionActivatedEmail = SubscriptionActivatedEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const VayvaGlowLayout_1 = require("../components/VayvaGlowLayout");
const icons_1 = require("../components/icons");
function SubscriptionActivatedEmail(props) {
    return ((0, jsx_runtime_1.jsx)(VayvaGlowLayout_1.VayvaGlowLayout, { preheader: "Subscription active", headline: `You're on the ${props.planName} plan`, body: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Your subscription for", " ", (0, jsx_runtime_1.jsx)("strong", { style: { color: "#E8FFF2" }, children: props.storeName }), " is now active. You have full access to all ", props.planName, " features. Your next billing date is in 30 days."] }), calloutIcon: (0, jsx_runtime_1.jsx)(icons_1.IconStar, {}), calloutTitle: "Your plan", calloutText: (0, jsx_runtime_1.jsx)("span", { style: { color: "#E8FFF2", fontWeight: 800 }, children: props.planName }), ctaText: "Manage subscription", ctaUrl: props.billingUrl, footerNote: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["You can change or cancel your plan anytime from your billing settings.", (0, jsx_runtime_1.jsx)("br", {}), "Questions? Contact", " ", (0, jsx_runtime_1.jsx)("span", { style: { color: "#E8FFF2" }, children: "support@vayva.ng" }), "."] }) }));
}
//# sourceMappingURL=subscriptionActivated.js.map