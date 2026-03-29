"use strict";
/**
 * BRAND CONFIGURATION - Monorepo Source of Truth
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRAND = void 0;
exports.getMarketingUrl = getMarketingUrl;
const urls_1 = require("./urls");
exports.BRAND = {
    name: "Vayva",
    domain: "vayva.ng",
    supportEmail: "support@vayva.ng",
    helloEmail: "hello@vayva.ng",
    supportPhone: "+234 810 769 2393",
    officialWhatsApp: "+234 810 769 2393",
};
function getMarketingUrl(path = "") {
    const base = urls_1.urls.marketingBase();
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${normalizedPath}`;
}
//# sourceMappingURL=brand.js.map