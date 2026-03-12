import { Resend } from "resend";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Vayva Operations <ops@vayva.ng>";

export class OpsEmailService {
  private static getResend(): Resend {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    return new Resend(key);
  }

  /**
   * Send team member invitation email with legal warnings
   */
  static async sendInvitationEmail(
    to: string,
    args: {
      inviterName: string;
      inviterEmail: string;
      role: string;
      roleLabel: string;
      acceptUrl: string;
      expiresAt: Date;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const expiresText = args.expiresAt.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      const html = this.getInvitationTemplate({
        ...args,
        expiresText,
      });

      const { data, error } = await this.getResend().emails.send({
        from: FROM_EMAIL,
        to,
        subject: `CONFIDENTIAL: You've been invited to join Vayva Operations as ${args.roleLabel}`,
        html,
      });

      if (error) {
        throw new Error(
          error instanceof Error ? error.message : String(error)
        );
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Send notification when invitation is accepted
   */
  static async sendInvitationAcceptedNotification(
    to: string,
    args: {
      newMemberName: string;
      newMemberEmail: string;
      roleLabel: string;
    }
  ): Promise<void> {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Team Member Joined</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f3f4f6; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6; padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding:32px 40px; text-align:center;">
                      <h1 style="color:#ffffff; margin:0; font-size:24px; font-weight:600;">Team Update</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px;">
                      <p style="font-size:16px; color:#374151; margin:0 0 20px; line-height:1.6;">
                        <strong>${args.newMemberName}</strong> (${args.newMemberEmail}) has accepted their invitation and joined the team as <strong>${args.roleLabel}</strong>.
                      </p>
                      <p style="font-size:14px; color:#6b7280; margin:0;">
                        They now have access to the Vayva Operations Console with the permissions associated with their role.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 40px; background-color:#f9fafb; border-top:1px solid #e5e7eb;">
                      <p style="font-size:12px; color:#9ca3af; margin:0; text-align:center;">
                        This is an automated notification from Vayva Operations.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      await this.getResend().emails.send({
        from: FROM_EMAIL,
        to,
        subject: `Team Update: ${args.newMemberName} has joined as ${args.roleLabel}`,
        html,
      });
    } catch {
      // Silent fail - this is a notification, not critical
    }
  }

  private static getInvitationTemplate(args: {
    inviterName: string;
    inviterEmail: string;
    role: string;
    roleLabel: string;
    acceptUrl: string;
    expiresText: string;
  }): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confidential Invitation - Vayva Operations</title>
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding:24px 40px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:20px; font-weight:600;">🔒 CONFIDENTIAL</h1>
              <p style="color:#fecaca; margin:8px 0 0; font-size:14px;">Vayva Operations Console Invitation</p>
            </td>
          </tr>
          
          <!-- Security Warning -->
          <tr>
            <td style="padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2; border-left:4px solid #dc2626;">
                <tr>
                  <td style="padding:20px 40px;">
                    <p style="margin:0; color:#7f1d1d; font-size:14px; line-height:1.6; font-weight:500;">
                      ⚠️ <strong>IMPORTANT SECURITY NOTICE:</strong> This email contains a privileged invitation to access sensitive business systems. If you received this in error, please delete immediately and contact security@vayva.ng.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding:40px;">
              <p style="font-size:16px; color:#374151; margin:0 0 20px; line-height:1.6;">
                Hello,
              </p>
              <p style="font-size:16px; color:#374151; margin:0 0 20px; line-height:1.6;">
                You have been invited by <strong>${args.inviterName}</strong> (${args.inviterEmail}) to join the <strong>Vayva Operations Console</strong> as a <strong>${args.roleLabel}</strong>.
              </p>
              
              <!-- Legal Warning Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6; border-radius:8px; margin:24px 0;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 12px; color:#1f2937; font-size:14px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">
                      ⚖️ LEGAL NOTICE - READ CAREFULLY
                    </p>
                    <p style="margin:0 0 12px; color:#4b5563; font-size:13px; line-height:1.7;">
                      By accepting this invitation and accessing the Vayva Operations Console, you acknowledge and agree to the following:
                    </p>
                    <ul style="margin:0 0 16px; padding-left:20px; color:#4b5563; font-size:13px; line-height:1.7;">
                      <li style="margin-bottom:8px;">You will have access to <strong>confidential business data</strong> including merchant information, financial records, and customer data.</li>
                      <li style="margin-bottom:8px;">You are bound by the <strong>Vayva Non-Disclosure Agreement</strong> and <strong>Data Protection Policy</strong>.</li>
                      <li style="margin-bottom:8px;">Any unauthorized disclosure, misuse, or negligent handling of data may result in <strong>immediate termination</strong> and potential <strong>legal action</strong>.</li>
                      <li style="margin-bottom:8px;">All activities within the system are <strong>logged and monitored</strong> for security purposes.</li>
                      <li>You must maintain strict <strong>password security</strong> and enable two-factor authentication when prompted.</li>
                    </ul>
                    <p style="margin:0; color:#7f1d1d; font-size:13px; font-weight:500; font-style:italic;">
                      ⚠️ Data leaks, unauthorized sharing, or security breaches caused by negligence may result in civil liability and criminal prosecution under applicable data protection laws.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td align="center">
                    <a href="${args.acceptUrl}" style="display:inline-block; background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color:#ffffff; text-decoration:none; padding:16px 32px; border-radius:8px; font-weight:600; font-size:16px;">
                      Accept Invitation & Create Account
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="font-size:14px; color:#6b7280; margin:0 0 8px; text-align:center;">
                This invitation expires on <strong>${args.expiresText}</strong>
              </p>
              <p style="font-size:13px; color:#9ca3af; margin:0; text-align:center;">
                If you did not expect this invitation, please ignore this email or contact security@vayva.ng
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px; background-color:#f9fafb; border-top:1px solid #e5e7eb; text-align:center;">
              <p style="font-size:12px; color:#9ca3af; margin:0 0 8px;">
                Vayva Operations Console • <a href="https://vayva.ng" style="color:#6b7280; text-decoration:none;">vayva.ng</a>
              </p>
              <p style="font-size:11px; color:#9ca3af; margin:0;">
                This is a secure, automated message. Do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
