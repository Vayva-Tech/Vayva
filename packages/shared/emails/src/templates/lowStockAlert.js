"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LowStockAlertEmail = LowStockAlertEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const VayvaGlowLayout_1 = require("../components/VayvaGlowLayout");
const icons_1 = require("../components/icons");
function LowStockAlertEmail(props) {
    return ((0, jsx_runtime_1.jsx)(VayvaGlowLayout_1.VayvaGlowLayout, { preheader: "Low stock alert", headline: "Some products are running low", body: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["The following products in", " ", (0, jsx_runtime_1.jsx)("strong", { style: { color: "#E8FFF2" }, children: props.storeName }), " are running low on stock and may sell out soon:"] }), calloutIcon: (0, jsx_runtime_1.jsx)(icons_1.IconBox, {}), calloutTitle: `${props.products.length} product${props.products.length === 1 ? "" : "s"} low`, calloutText: (0, jsx_runtime_1.jsx)("table", { role: "presentation", cellPadding: 0, cellSpacing: 0, style: { width: "100%" }, children: (0, jsx_runtime_1.jsx)("tbody", { children: props.products.slice(0, 5).map((p, i) => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { style: {
                                fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                fontSize: 13,
                                color: "#E8FFF2",
                                padding: "3px 0",
                            }, children: p.name }), (0, jsx_runtime_1.jsxs)("td", { align: "right", style: {
                                fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                fontSize: 13,
                                fontWeight: 800,
                                color: p.remaining <= 3 ? "#F87171" : "#FBBF24",
                                padding: "3px 0",
                            }, children: [p.remaining, " left"] })] }, i))) }) }), ctaText: "Manage inventory", ctaUrl: props.inventoryUrl, footerNote: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["You can adjust low-stock thresholds in your store settings.", (0, jsx_runtime_1.jsx)("br", {}), "Need help? Contact", " ", (0, jsx_runtime_1.jsx)("span", { style: { color: "#E8FFF2" }, children: "support@vayva.ng" }), "."] }) }));
}
//# sourceMappingURL=lowStockAlert.js.map