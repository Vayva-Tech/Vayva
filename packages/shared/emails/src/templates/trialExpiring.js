"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrialExpiringEmail = TrialExpiringEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const VayvaGlowLayout_1 = require("../components/VayvaGlowLayout");
const icons_1 = require("../components/icons");
function TrialExpiringEmail(props) {
    return ((0, jsx_runtime_1.jsx)(VayvaGlowLayout_1.VayvaGlowLayout, { preheader: `${props.daysLeft} day${props.daysLeft === 1 ? "" : "s"} left on your trial`, headline: `Your trial ends in ${props.daysLeft} day${props.daysLeft === 1 ? "" : "s"}`, body: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Your free trial for", " ", (0, jsx_runtime_1.jsx)("strong", { style: { color: "#E8FFF2" }, children: props.storeName }), " is ending soon. Upgrade now to keep your store live, retain your products, and continue accepting payments."] }), calloutIcon: (0, jsx_runtime_1.jsx)(icons_1.IconBell, {}), calloutTitle: "What happens next", calloutText: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "After your trial ends, your storefront will be paused until you subscribe. Your data will be kept safe \u2014 nothing is deleted." }), ctaText: "Upgrade now", ctaUrl: props.billingUrl, footerNote: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Plans start at just \u20A620,000/month. See all plans on your billing page.", (0, jsx_runtime_1.jsx)("br", {}), "Need help? Contact", " ", (0, jsx_runtime_1.jsx)("span", { style: { color: "#E8FFF2" }, children: "support@vayva.ng" }), "."] }) }));
}
//# sourceMappingURL=trialExpiring.js.map