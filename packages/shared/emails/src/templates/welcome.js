"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelcomeEmail = WelcomeEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const VayvaGlowLayout_1 = require("../components/VayvaGlowLayout");
const icons_1 = require("../components/icons");
function WelcomeEmail(props) {
    return ((0, jsx_runtime_1.jsx)(VayvaGlowLayout_1.VayvaGlowLayout, { preheader: "Welcome to Vayva", headline: `Welcome aboard, ${props.merchantName}`, body: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Your store", " ", (0, jsx_runtime_1.jsx)("strong", { style: { color: "#E8FFF2" }, children: props.storeName }), " is live on Vayva. You can start adding products, customising your storefront, and accepting payments right away."] }), calloutIcon: (0, jsx_runtime_1.jsx)(icons_1.IconStar, {}), calloutTitle: "What to do first", calloutText: "Add your first product, set up your payment details, and share your store link with customers.", ctaText: "Go to your dashboard", ctaUrl: props.dashboardUrl, footerNote: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Need help getting started? Reply to this email or visit our", " ", (0, jsx_runtime_1.jsx)("span", { style: { color: "#E8FFF2" }, children: "help centre" }), "."] }) }));
}
//# sourceMappingURL=welcome.js.map