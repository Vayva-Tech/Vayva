import { urls } from "@vayva/shared";
import {
  Colors,
  Spacing,
  Typography,
  Borders,
  Shadows,
} from "../design-system";
function style(s: Record<string, string | number>): string {
  return Object.entries(s)
    .map(
      ([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${v}`,
    )
    .join(";");
}
// --- Layout ---
export function wrapEmail(
  contentHtml: string,
  title: string = "Vayva Notification",
): string {
  const bodyStyle = style({
    margin: 0,
    padding: 0,
    backgroundColor: Colors.Neutral.Background,
    fontFamily: Typography.FontFamily,
    color: Colors.Neutral.DarkGrey,
    webkitFontSmoothing: "antialiased",
  });
  const containerStyle = style({
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: Colors.Neutral.White,
    borderRadius: Borders.Radius.lg,
    boxShadow: Shadows.Card,
    overflow: "hidden",
  });
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="${bodyStyle}">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0; background-color:${Colors.Neutral.Background};">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="${containerStyle}">
            <!-- Header Logo -->
            <tr>
                <td style="padding:${Spacing.xl} ${Spacing.xxl} ${Spacing.lg}; text-align: left;">
                    <img src="${urls.marketingBase()}/logos/brand-logo.png" alt="Vayva" width="100" style="display:block;" />
                </td>
            </tr>
            <!-- Divider -->
            <tr><td style="padding:0 ${Spacing.xxl};"><div style="height:1px; background:${Colors.Neutral.LightGrey};"></div></td></tr>
            <!-- Content -->
            <tr>
                <td style="padding:${Spacing.xl} ${Spacing.xxl}; text-align: left; font-size: ${Typography.Sizes.Body}; line-height: ${Typography.LineHeights.Relaxed};">
                    ${contentHtml}
                </td>
            </tr>
            <!-- Footer -->
            <tr>
                <td style="padding:${Spacing.lg} ${Spacing.xxl}; background:${Colors.Neutral.Background}; font-size:${Typography.Sizes.Micro}; color:${Colors.Neutral.Grey}; text-align: center;">
                    <p style="margin:0 0 8px;">${new Date().getFullYear()} Vayva • Lagos, Nigeria</p>
                    <div>
                        <a href="${urls.marketingBase()}/legal/privacy" style="color:${Colors.Neutral.Grey}; text-decoration: underline; margin:0 4px;">Privacy</a>
                        •
                        <a href="${urls.marketingBase()}/legal/terms" style="color:${Colors.Neutral.Grey}; text-decoration: underline; margin:0 4px;">Terms</a>
                    </div>
                </td>
            </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
}
// --- Components ---
export function Hero(type: string): string {
  // CATEGORY MAPPING
  const map = {
    hero_lock: "auth",
    hero_welcome: "lifecycle",
    hero_receipt: "billing",
    hero_invite: "team",
    hero_shipping: "orders",
    hero_alert: "system",
    hero_billing_invoice: "billing",
    hero_billing_failed: "billing",
    hero_subscription: "billing",
    hero_order_confirm: "orders",
    hero_maintenance: "system",
  };
  // Fallback if type not in map (should not happen if strict)
  const category = map[type as keyof typeof map] || "system";
  const baseUrl = urls.marketingBase().replace(/\/$/, "");
  // Prefer SVG for sharpness, fallback logic is handled by email clients if we used picture tags,
  // but for simple emails, a high-res PNG or SVG works.
  // User requested SVG primary.
  const src = `${baseUrl}/email-icons/hero/${category}/${type}.svg`;
  return `
    <div style="margin: 0 0 ${Spacing.lg} 0; text-align: center;">
        <img src="${src}" alt="${type}" width="120" height="120" style="display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none;" />
    </div>
    `;
}
export function Button(url: string, label: string): string {
  const btnStyle = style({
    display: "inline-block",
    backgroundColor: Colors.Brand.Primary, // Primary green
    color: Colors.Neutral.White,
    textDecoration: "none",
    padding: "14px 32px",
    borderRadius: Borders.Radius.md,
    fontSize: "15px",
    fontWeight: Typography.Weights.Medium,
    boxShadow: Shadows.Button,
    textAlign: "center",
  });
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: ${Spacing.xl} 0;">
        <tr>
            <td align="center">
                <a href="${url}" style="${btnStyle}">${label}</a>
            </td>
        </tr>
    </table>
    `;
}
export function Badge(
  text: string,
  color: "success" | "warning" | "error" | "info" = "info",
): string {
  const bgMap = {
    success: "#DCFCE7",
    warning: "#FEF3C7",
    error: "#FEE2E2",
    info: "#DBEAFE",
  };
  const textMap = {
    success: "#166534",
    warning: "#92400E",
    error: "#991B1B",
    info: "#1E40AF",
  };
  const badgeStyle = style({
    display: "inline-block",
    backgroundColor: bgMap[color as keyof typeof bgMap],
    color: textMap[color as keyof typeof textMap],
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "9999px",
    border: `1px solid ${bgMap[color as keyof typeof bgMap]}`, // slight border to ensure shape
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  });
  return `<span style="${badgeStyle}">${text}</span>`;
}
export function Text(
  content: string,
  type: string = "body",
  align: string = "left",
): string {
  const styles: Record<string, string> = {
    margin: "0 0 16px",
    textAlign: align,
    color: Colors.Neutral.DarkGrey,
  };
  if (type === "h1") {
    styles.fontSize = Typography.Sizes.H1;
    styles.fontWeight = Typography.Weights.Bold;
    styles.color = Colors.Neutral.Black;
    styles.margin = "0 0 24px";
  } else if (type === "h2") {
    styles.fontSize = Typography.Sizes.H2;
    styles.fontWeight = Typography.Weights.Bold;
    styles.color = Colors.Neutral.Black;
  } else if (type === "h3") {
    styles.fontSize = Typography.Sizes.H3;
    styles.fontWeight = Typography.Weights.Bold;
    styles.color = Colors.Neutral.Black;
    styles.margin = "0 0 12px";
  } else if (type === "small") {
    styles.fontSize = Typography.Sizes.Small;
    styles.color = Colors.Neutral.Grey;
  } else {
    styles.fontSize = Typography.Sizes.Body;
    styles.lineHeight = Typography.LineHeights.Relaxed;
  }
  return `<div style="${style(styles)}">${content}</div>`;
}
export function KeyValue(label: string, value: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 8px 0; border-bottom: 1px solid ${Colors.Neutral.LightGrey};">
        <tr>
            <td style="color: ${Colors.Neutral.Grey}; font-size: 14px;">${label}</td>
            <td align="right" style="color: ${Colors.Neutral.Black}; font-weight: 500; font-size: 14px;">${value}</td>
        </tr>
    </table>
    `;
}
