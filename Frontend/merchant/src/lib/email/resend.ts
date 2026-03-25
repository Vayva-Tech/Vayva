import { Resend } from "resend";
import { wrapEmail, renderButton } from "./layout";
import { FEATURES } from "../env-validation";
import { urls, logger } from "@vayva/shared";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class ResendEmailService {
  static resendClient: Resend | null = null;
  static fromEmail: string =
    process.env.RESEND_FROM_EMAIL || `Vayva <${urls.noReplyEmail()}>`;
  static billingEmail: string =
    process.env.EMAIL_BILLING || `Billing <${urls.noReplyEmail()}>`;
  static helloEmail: string =
    process.env.EMAIL_HELLO || `Vayva <${urls.noReplyEmail()}>`;
  static supportEmail: string =
    process.env.EMAIL_SUPPORT || `Support <${urls.supportEmail()}>`;

  static get client() {
    if (!this.resendClient) {
      const RESEND_KEY =
        process.env.NODE_ENV === "test"
          ? process.env.RESEND_API_KEY
          : process.env.RESEND_API_KEY;
      if (!RESEND_KEY) {
        // In build context or when key is missing, return a dummy or throw when used
        logger.error("[ResendEmailService] RESEND_API_KEY is missing. Fatal.");
        throw new Error(
          "Email service is not configured (missing RESEND_API_KEY).",
        );
      }
      this.resendClient = new Resend(RESEND_KEY);
    }
    return this.resendClient;
  }
  /**
   * Check if email service is configured
   */
  static assertConfigured() {
    if (!FEATURES.EMAIL_ENABLED) {
      throw new Error("Email service is not configured");
    }
  }

  // --- Generic Transactional Email ---
  static async sendTransactionalEmail(options: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }) {
    if (!FEATURES.EMAIL_ENABLED && process.env.NODE_ENV !== "production") {
      logger.warn(
        "[ResendEmailService] EMAIL_ENABLED=false. Skipping transactional email in development.",
        { app: "merchant", to: options.to, subject: options.subject },
      );
      return { success: true, skipped: true };
    }
    this.assertConfigured();
    try {
      const { data, error } = await this.client.emails.send({
        from: options.from || this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      if (error) {
        logger.error("[Resend] Transactional Email Error:", {
          error: error instanceof Error ? error.message : String(error),
          to: options.to,
          subject: options.subject,
        });
        throw new Error(
          `Failed to send transactional email: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      return { success: true, messageId: data?.id };
    } catch (error) {
      logger.error("[Resend] Transactional Email Error:", {
        error: error instanceof Error ? error.message : String(error),
        to: options.to,
        subject: options.subject,
      });
      throw error;
    }
  }

  // --- 1. OTP Verification ---
  static async sendOTPEmail(to: string, code: string, firstName: string) {
    if (!FEATURES.EMAIL_ENABLED && process.env.NODE_ENV !== "production") {
      logger.warn(
        "[ResendEmailService] EMAIL_ENABLED=false. Skipping OTP email in development.",
        { app: "merchant" },
      );
      return { success: true, skipped: true };
    }
    this.assertConfigured();
    try {
      const { data, error } = await this.client.emails.send({
        from: this.fromEmail,
        to,
        subject: "Verify your email - Vayva",
        html: wrapEmail(this.getOTPTemplate(code, firstName), "Verify Email"),
      });
      if (error) {
        const statusCode = (error as Record<string, unknown>)?.statusCode;
        const message = (error as Record<string, unknown>)?.message;
        const isInvalidKey =
          typeof message === "string" && /api key is invalid/i.test(message);
        if (
          process.env.NODE_ENV !== "production" &&
          (statusCode === 401 || isInvalidKey)
        ) {
          logger.warn("[Resend] OTP Error", {
            error: error instanceof Error ? error.message : String(error),
            app: "merchant",
          });
          return { success: true, skipped: true };
        }
        logger.error("[Resend] OTP Error:", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw new Error(
          `Failed to send OTP email: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      return { success: true, messageId: data?.id };
    } catch (error: unknown) {
      const errorRecord = isRecord(error) ? error : {};
      const statusCode = errorRecord.statusCode;
      const message = errorRecord.message;
      const isInvalidKey =
        typeof message === "string" && /api key is invalid/i.test(message);
      if (
        process.env.NODE_ENV !== "production" &&
        (statusCode === 401 || isInvalidKey)
      ) {
        logger.warn("[Resend] OTP Error", {
          error: error instanceof Error ? error.message : String(error),
          app: "merchant",
        });
        return { success: true, skipped: true };
      }
      logger.error("[Resend] OTP Error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
  // --- 2. Welcome Email ---
  static async sendWelcomeEmail(
    to: string,
    firstName: string,
    storeName: string,
  ) {
    this.assertConfigured();
    try {
      const { data, error } = await this.client.emails.send({
        from: this.helloEmail,
        to,
        subject: `Welcome to Vayva, ${firstName}!`,
        html: wrapEmail(
          this.getWelcomeTemplate(firstName, storeName),
          "Welcome to Vayva",
        ),
      });
      if (error) {
        logger.error("[Resend] Welcome Error:", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw new Error(
          `Failed to send welcome email: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      return { success: true, messageId: data?.id };
    } catch (error: unknown) {
      logger.error("[Resend] Welcome Error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
  // --- 3. Password Changed ---
  static async sendPasswordChangedEmail(to: string) {
    this.assertConfigured();
    try {
      const { data, error } = await this.client.emails.send({
        from: this.fromEmail,
        to,
        subject: "Security Alert: Password Changed",
        html: wrapEmail(this.getPasswordChangedTemplate(), "Security Alert"),
      });
      if (error) {
        logger.error("[Resend] Password Change Error:", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw new Error(
          `Failed to send password change email: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      return { success: true, messageId: data?.id };
    } catch (error: unknown) {
      logger.error("[Resend] Password Change Error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
  // --- 4. Payment Receipt ---
  static async sendPaymentReceiptEmail(
    to: string,
    amountNgn: number,
    invoiceNumber: string,
    storeName: string,
  ) {
    this.assertConfigured();
    try {
      const { data, error } = await this.client.emails.send({
        from: this.billingEmail,
        to,
        subject: `Receipt for ${storeName} - ${invoiceNumber}`,
        html: wrapEmail(
          this.getReceiptTemplate(amountNgn, invoiceNumber, storeName),
          "Payment Receipt",
        ),
      });
      if (error) {
        logger.error("[Resend] Receipt Error:", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw new Error(
          `Failed to send receipt email: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      return { success: true, messageId: data?.id };
    } catch (error: unknown) {
      logger.error("[Resend] Receipt Error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
  // --- 5. Subscription Expiry Reminder ---
  static async sendSubscriptionExpiryReminder(
    to: string,
    storeName: string,
    planName: string,
    expiryDate: string,
  ) {
    this.assertConfigured();
    try {
      const { billingSubscriptionExpiryReminder } =
        await import("./templates/core");
      const billingUrl = urls.merchantDashboard(); // or a more specific billing URL if available
      const { data, error } = await this.client.emails.send({
        from: this.billingEmail,
        to,
        subject: `Action Required: Your subscription for ${storeName} expires in 3 days`,
        html: billingSubscriptionExpiryReminder({
          store_name: storeName,
          plan_name: planName,
          expiry_date: expiryDate,
          billing_url: billingUrl,
        }),
      });
      if (error) {
        logger.error("[Resend] Subscription Expiry Error:", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw new Error(
          `Failed to send subscription expiry email: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      return { success: true, messageId: data?.id };
    } catch (error: unknown) {
      logger.error("[Resend] Subscription Expiry Error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
  // --- 6. Order Shipped ---
  static async sendOrderShippedEmail(
    to: string,
    orderNumber: string,
    trackingUrl: string,
    storeName: string,
  ) {
    this.assertConfigured();
    try {
      const { data, error } = await this.client.emails.send({
        from: this.fromEmail,
        to,
        subject: `Your order ${orderNumber} is on the way!`,
        html: wrapEmail(
          this.getShippedTemplate(orderNumber, trackingUrl, storeName),
          "Order Shipped",
        ),
      });
      if (error) {
        logger.error("[Resend] Shipped Error:", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw new Error(
          `Failed to send shipped email: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      return { success: true, messageId: data?.id };
    } catch (error: unknown) {
      logger.error("[Resend] Shipped Error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
  /**
   * Internal Template Generators (Content Body Only)
   */
  static getOTPTemplate(code: string, firstName: string) {
    return `
            <h1 style="margin:0 0 12px; font-size:22px; font-weight:600;">
                ${firstName ? `Hi ${firstName}` : "Hello"}
            </h1>
            <p style="margin:0 0 24px; font-size:16px; line-height:1.6; color:#444444;">
                Use the verification code below to complete your sign up. This code will expire in 10 minutes.
            </p>
            <div style="background:#f4f4f5; border-radius:8px; padding:24px; text-align:center; margin:32px 0; letter-spacing: 8px; font-size: 32px; font-weight: 700; font-family: monospace;">
                ${code}
            </div>
            <p style="margin:24px 0 0; font-size:14px; color:#666666;">
                If you didn't request this code, you can safely ignore this email.
            </p>
        `;
  }
  static getWelcomeTemplate(firstName: string, storeName: string) {
    const dashboardUrl = urls.merchantDashboard();
    return `
            <h1 style="margin:0 0 12px; font-size:22px; font-weight:600;">
                Welcome to Vayva!
            </h1>
            <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#444444;">
                Hi <strong>${firstName}</strong>, we're thrilled to have you. Your store <strong>${storeName}</strong> is ready to be set up.
            </p>
            
            <div style="margin: 24px 0;">
                <p style="margin:0 0 8px; font-weight:600; font-size:14px; text-transform:uppercase; letter-spacing:0.5px; color:#666666;">Next Steps</p>
                <ul style="margin:0; padding-left:20px; color:#444444; font-size:15px; line-height:1.6;">
                    <li style="margin-bottom:8px;">Complete your business profile</li>
                    <li style="margin-bottom:8px;">Add your first product</li>
                    <li>Connect your bank account</li>
                </ul>
            </div>

            ${renderButton(dashboardUrl, "Go to Dashboard")}
            
            <p style="margin:24px 0 0; font-size:14px; color:#666666;">
                Need help? Reply to this email or contact support.
            </p>
        `;
  }
  static getPasswordChangedTemplate() {
    return `
            <h1 style="margin:0 0 12px; font-size:22px; font-weight:600;">
                Password Changed
            </h1>
            <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#444444;">
                This is a confirmation that the password for your Vayva account has been changed successfully.
            </p>
            <div style="background:#fff1f2; border-radius:8px; padding:16px; margin:24px 0; color:#be123c; font-size:14px; line-height:1.5;">
                <strong>Note:</strong> If you did not make this change, please contact support immediately to secure your account.
            </div>
        `;
  }
  static getReceiptTemplate(
    amount: number,
    invoiceRef: string,
    storeName: string,
  ) {
    const formattedAmount = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
    return `
            <h1 style="margin:0 0 4px; font-size:22px; font-weight:600;">Receipt</h1>
            <p style="margin:0 0 24px; font-size:14px; color:#666666;">For ${storeName}</p>

            <div style="margin-bottom:32px;">
                <div style="font-size:12px; text-transform:uppercase; color:#666666; font-weight:600; letter-spacing:0.5px; margin-bottom:4px;">Amount Paid</div>
                <div style="font-size:36px; font-weight:700; color:#111111;">${formattedAmount}</div>
            </div>

            <div style="background:#f9fafb; border-radius:8px; padding:20px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                    <tr>
                        <td style="padding:4px 0; color:#666666;">Invoice</td>
                        <td style="padding:4px 0; text-align:right; color:#111111; font-weight:500; font-family:monospace;">${invoiceRef}</td>
                    </tr>
                    <tr>
                        <td style="padding:4px 0; color:#666666;">Date</td>
                        <td style="padding:4px 0; text-align:right; color:#111111; font-weight:500;">${new Date().toLocaleDateString()}</td>
                    </tr>
                    <tr>
                        <td style="padding:4px 0; color:#666666;">Status</td>
                        <td style="padding:4px 0; text-align:right; color:#111111; font-weight:600;">Paid</td>
                    </tr>
                </table>
            </div>

&nbsp;</p>
            <p style="margin:24px 0 0; font-size:14px; color:#666666;">
                View your invoice history in <a href="${urls.merchantDashboard()}" style="color:#111111; text-decoration:underline;">Billing Settings</a>.
            </p>
        `;
  }
  static getShippedTemplate(
    orderNumber: string,
    trackingUrl: string,
    storeName: string,
  ) {
    return `
            <h1 style="margin:0 0 12px; font-size:22px; font-weight:600;">Good news!</h1>
            <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#444444;">
                Your order <strong>${orderNumber}</strong> from <strong>${storeName}</strong> has been shipped.
            </p>

            ${trackingUrl ? renderButton(trackingUrl, "Track Shipment") : ""}

            <p style="margin:24px 0 0; font-size:14px; color:#666666;">
                You will receive another update when it arrives.
            </p>
        `;
  }
}
