/**
 * Shared Vayva Email Layout
 * Provides a consistent header (Logo), container, and footer.
 */
import { urls } from "@vayva/shared";
export const BRAND_COLOR = "#111111"; // Black for premium feel matching the design
export const ACCENT_COLOR = "#111111";
export const BG_COLOR = "#f7f7f7";
export const TEXT_COLOR = "#444444";
export const HEADLINE_COLOR = "#111111";
// Use the absolute URL for the logo, derived from canonical origin
const LOGO_URL = urls.emailLogo();
export function wrapEmail(contentHtml: string, title = "Vayva Notification") {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>

<body style="margin:0; padding:0; background-color:${BG_COLOR}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">

    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.06); overflow: hidden;">

      <!-- Header -->
      <tr>
        <td style="padding:32px 40px 24px; text-align: left;">
          <img 
            src="${LOGO_URL}" 
            alt="Vayva" 
            width="120"
            style="display:block;"
          />
        </td>
      </tr>

      <tr>
        <td style="padding:0 40px;">
          <div style="height:1px; background:#eeeeee;"></div>
        </td>
      </tr>

      <!-- Content -->
      <tr>
        <td style="padding:32px 40px; color:${HEADLINE_COLOR}; text-align: left;">
          ${contentHtml}
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:24px 40px; background:#fafafa; font-size:12px; color:#777777; text-align: center;">
          <p style="margin:0;">
            © ${new Date().getFullYear()} Vayva • Lagos, Nigeria
          </p>
          <div style="margin-top: 8px;">
            <a href="${urls.marketingBase()}/privacy" style="color: #777777; text-decoration: underline; margin: 0 4px;">Privacy</a>
            •
            <a href="${urls.marketingBase()}/terms" style="color: #777777; text-decoration: underline; margin: 0 4px;">Terms</a>
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
// Helper to generate consistent buttons
export function renderButton(url: string, label: string) {
  return `
    <a 
        href="${url}"
        style="
            display:inline-block;
            background:${BRAND_COLOR};
            color:#ffffff;
            text-decoration:none;
            padding:14px 26px;
            border-radius:8px;
            font-size:15px;
            font-weight:500;
            margin-top: 8px;
            margin-bottom: 8px;
        "
    >
        ${label} →
    </a>
    `;
}
