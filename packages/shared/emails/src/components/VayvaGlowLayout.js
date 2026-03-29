"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VayvaGlowLayout = VayvaGlowLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
function VayvaGlowLayout(props) {
    const year = new Date().getFullYear();
    return ((0, jsx_runtime_1.jsxs)("html", { children: [(0, jsx_runtime_1.jsxs)("head", { children: [(0, jsx_runtime_1.jsx)("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }), (0, jsx_runtime_1.jsx)("meta", { httpEquiv: "Content-Type", content: "text/html; charset=UTF-8" }), (0, jsx_runtime_1.jsx)("title", { children: "Vayva" })] }), (0, jsx_runtime_1.jsxs)("body", { style: { margin: 0, padding: 0, backgroundColor: "#07120C" }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            display: "none",
                            maxHeight: 0,
                            overflow: "hidden",
                            opacity: 0,
                            color: "transparent",
                        }, children: props.preheader }), (0, jsx_runtime_1.jsx)("table", { role: "presentation", width: "100%", cellPadding: 0, cellSpacing: 0, style: { backgroundColor: "#07120C", padding: "28px 12px" }, children: (0, jsx_runtime_1.jsx)("tbody", { children: (0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { align: "center", children: (0, jsx_runtime_1.jsx)("table", { role: "presentation", width: "600", cellPadding: 0, cellSpacing: 0, style: { maxWidth: 600, width: "100%" }, children: (0, jsx_runtime_1.jsxs)("tbody", { children: [(0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { style: { padding: "6px 4px 14px 4px" }, children: (0, jsx_runtime_1.jsx)("table", { role: "presentation", width: "100%", cellPadding: 0, cellSpacing: 0, children: (0, jsx_runtime_1.jsx)("tbody", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsxs)("td", { style: { verticalAlign: "middle" }, children: [(0, jsx_runtime_1.jsx)("img", { src: "https://vayva.ng/logos/brand-logo.png", width: 40, height: 40, alt: "Vayva", style: {
                                                                                        display: "inline-block",
                                                                                        verticalAlign: "middle",
                                                                                        border: 0,
                                                                                        outline: "none",
                                                                                        textDecoration: "none",
                                                                                        borderRadius: 12,
                                                                                    } }), (0, jsx_runtime_1.jsx)("span", { style: {
                                                                                        display: "inline-block",
                                                                                        verticalAlign: "middle",
                                                                                        marginLeft: 10,
                                                                                        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                                                                        fontWeight: 800,
                                                                                        fontSize: 18,
                                                                                        color: "#E8FFF2",
                                                                                        letterSpacing: "-0.02em",
                                                                                    }, children: "Vayva" })] }), (0, jsx_runtime_1.jsx)("td", { align: "right", style: { verticalAlign: "middle" }, children: (0, jsx_runtime_1.jsx)("span", { style: {
                                                                                    fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                                                                    fontSize: 12,
                                                                                    color: "#A7F3C6",
                                                                                }, children: props.preheader }) })] }) }) }) }) }), (0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { style: { paddingBottom: 14 }, children: (0, jsx_runtime_1.jsx)("table", { role: "presentation", width: "100%", cellPadding: 0, cellSpacing: 0, style: {
                                                                backgroundColor: "#051009",
                                                                borderRadius: 20,
                                                                border: "1px solid #0E3B22",
                                                            }, children: (0, jsx_runtime_1.jsx)("tbody", { children: (0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { style: { padding: 2 }, children: (0, jsx_runtime_1.jsx)("table", { role: "presentation", width: "100%", cellPadding: 0, cellSpacing: 0, style: {
                                                                                backgroundColor: "#07150D",
                                                                                borderRadius: 18,
                                                                                border: "1px solid #0F5C33",
                                                                            }, children: (0, jsx_runtime_1.jsx)("tbody", { children: (0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsxs)("td", { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                                                                    height: 8,
                                                                                                    backgroundColor: "#22C55E",
                                                                                                    borderRadius: "18px 18px 0 0",
                                                                                                } }), (0, jsx_runtime_1.jsx)("table", { role: "presentation", width: "100%", cellPadding: 0, cellSpacing: 0, children: (0, jsx_runtime_1.jsx)("tbody", { children: (0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsxs)("td", { style: {
                                                                                                                padding: "24px 24px 20px 24px",
                                                                                                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                                                                                        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                                                                                                        fontSize: 22,
                                                                                                                        fontWeight: 900,
                                                                                                                        letterSpacing: "-0.02em",
                                                                                                                        color: "#E8FFF2",
                                                                                                                        margin: "0 0 8px 0",
                                                                                                                    }, children: props.headline }), (0, jsx_runtime_1.jsx)("div", { style: {
                                                                                                                        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                                                                                                        fontSize: 15,
                                                                                                                        lineHeight: 1.65,
                                                                                                                        color: "#CFFFE1",
                                                                                                                        margin: "0 0 18px 0",
                                                                                                                    }, children: props.body }), (0, jsx_runtime_1.jsx)("table", { role: "presentation", width: "100%", cellPadding: 0, cellSpacing: 0, style: {
                                                                                                                        backgroundColor: "#071A10",
                                                                                                                        border: "1px solid #14532D",
                                                                                                                        borderRadius: 16,
                                                                                                                    }, children: (0, jsx_runtime_1.jsx)("tbody", { children: (0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { style: { padding: 14 }, children: (0, jsx_runtime_1.jsx)("table", { role: "presentation", width: "100%", cellPadding: 0, cellSpacing: 0, children: (0, jsx_runtime_1.jsx)("tbody", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { width: 28, style: {
                                                                                                                                                        verticalAlign: "top",
                                                                                                                                                    }, children: props.calloutIcon }), (0, jsx_runtime_1.jsxs)("td", { style: {
                                                                                                                                                        paddingLeft: 10,
                                                                                                                                                        verticalAlign: "top",
                                                                                                                                                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                                                                                                                                fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                                                                                                                                                fontSize: 14,
                                                                                                                                                                lineHeight: 1.5,
                                                                                                                                                                color: "#E8FFF2",
                                                                                                                                                                fontWeight: 800,
                                                                                                                                                                margin: "0 0 2px 0",
                                                                                                                                                            }, children: props.calloutTitle }), (0, jsx_runtime_1.jsx)("div", { style: {
                                                                                                                                                                fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                                                                                                                                                fontSize: 13,
                                                                                                                                                                lineHeight: 1.6,
                                                                                                                                                                color: "#BFFFD6",
                                                                                                                                                                margin: 0,
                                                                                                                                                            }, children: props.calloutText })] })] }) }) }) }) }) }) }), (0, jsx_runtime_1.jsx)("div", { style: { height: 16 } }), (0, jsx_runtime_1.jsx)("table", { role: "presentation", cellPadding: 0, cellSpacing: 0, children: (0, jsx_runtime_1.jsx)("tbody", { children: (0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { style: {
                                                                                                                                    backgroundColor: "#22C55E",
                                                                                                                                    borderRadius: 14,
                                                                                                                                }, children: (0, jsx_runtime_1.jsx)("a", { href: props.ctaUrl, style: {
                                                                                                                                        display: "inline-block",
                                                                                                                                        padding: "12px 16px",
                                                                                                                                        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                                                                                                                        fontSize: 14,
                                                                                                                                        fontWeight: 800,
                                                                                                                                        color: "#05210F",
                                                                                                                                        textDecoration: "none",
                                                                                                                                        borderRadius: 14,
                                                                                                                                    }, children: props.ctaText }) }) }) }) }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                                                                                                        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                                                                                                        fontSize: 12,
                                                                                                                        lineHeight: 1.6,
                                                                                                                        color: "#A7F3C6",
                                                                                                                        marginTop: 12,
                                                                                                                    }, children: ["If the button doesn\u2019t work, copy and paste this link:", (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("span", { style: {
                                                                                                                                color: "#E8FFF2",
                                                                                                                                wordBreak: "break-all",
                                                                                                                            }, children: props.ctaUrl })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                                                                                                        height: 1,
                                                                                                                        backgroundColor: "#0F5C33",
                                                                                                                        margin: "18px 0",
                                                                                                                    } }), (0, jsx_runtime_1.jsx)("div", { style: {
                                                                                                                        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                                                                                                        fontSize: 12,
                                                                                                                        lineHeight: 1.6,
                                                                                                                        color: "#A7F3C6",
                                                                                                                    }, children: props.footerNote ?? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Need help? Reply to this email or contact", " ", (0, jsx_runtime_1.jsx)("span", { style: {
                                                                                                                                    color: "#E8FFF2",
                                                                                                                                }, children: "support@vayva.ng" }), "."] })) })] }) }) }) })] }) }) }) }) }) }) }) }) }) }), (0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { style: { padding: "0 6px" }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                                                                fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
                                                                fontSize: 11,
                                                                lineHeight: 1.6,
                                                                color: "#6EE7A1",
                                                                textAlign: "center",
                                                            }, children: ["\u00A9 ", year, " Vayva. All rights reserved.", (0, jsx_runtime_1.jsx)("br", {}), "Lagos, Nigeria"] }) }) })] }) }) }) }) }) })] })] }));
}
//# sourceMappingURL=VayvaGlowLayout.js.map