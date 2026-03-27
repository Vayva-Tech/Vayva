import { render } from "@react-email/render";
import * as React from "react";

interface DunningFirstAttemptEmailProps {
  firstName: string;
  storeName: string;
  plan: string;
  amountDue: string;
  attemptNumber: number;
  maxAttempts: number;
  nextRetryDate: string;
  supportEmail: string;
  supportPhone: string;
}

export function DunningFirstAttemptEmail({
  firstName,
  storeName,
  plan,
  amountDue,
  attemptNumber,
  maxAttempts,
  nextRetryDate,
  supportEmail,
  supportPhone,
}: DunningFirstAttemptEmailProps) {
  return (
    <div style={container}>
      <div style={header}>
        <div style={logo}>Vayva</div>
      </div>

      <div style={content}>
        <h1 style={title}>Payment Failed - Action Required</h1>

        <div style={greeting}>
          Hi {firstName},
        </div>

        <div style={bodyText}>
          We were unable to process your subscription payment for <strong>{storeName}</strong>. 
          This is common and can happen for several reasons:
        </div>

        <div style={reasonsBox}>
          <ul style={reasonsList}>
            <li>Insufficient funds in your account</li>
            <li>Card has expired or been replaced</li>
            <li>Incorrect card details on file</li>
            <li>Bank security measures</li>
          </ul>
        </div>

        <div style={infoBox}>
          <div style={infoRow}>
            <span style={infoLabel}>Plan:</span>
            <span style={infoValue}>{plan}</span>
          </div>
          <div style={infoRow}>
            <span style={infoLabel}>Amount Due:</span>
            <span style={infoValueAmount}>{amountDue}</span>
          </div>
          <div style={infoRow}>
            <span style={infoLabel}>Next Retry Date:</span>
            <span style={infoValue}>{nextRetryDate}</span>
          </div>
        </div>

        <div style={ctaContainer}>
          <a href="https://merchant.vayva.tech/dashboard/billing" style={button}>
            Update Payment Method
          </a>
        </div>

        <div style={secondaryText}>
          <strong>What happens next?</strong>
          <br />
          We'll automatically retry the payment on {nextRetryDate}. No action is needed if 
          you've already updated your payment information.
        </div>

        <div style={warningBox}>
          <div style={warningIcon}>⚠️</div>
          <div>
            <strong>Please Note:</strong> If payment continues to fail, your subscription 
            may be restricted after {maxAttempts} attempts. You'll receive additional 
            reminders before any action is taken.
          </div>
        </div>

        <div style={supportBox}>
          <div style={supportText}>
            Need help? Our support team is here for you:
          </div>
          <div style={supportLinks}>
            <a href={`mailto:${supportEmail}`} style={supportLink}>
              📧 {supportEmail}
            </a>
            <span style={supportDivider}>•</span>
            <a href={`tel:${supportPhone}`} style={supportLink}>
              📞 {supportPhone}
            </a>
          </div>
        </div>
      </div>

      <div style={footer}>
        <div style={footerText}>
          Thank you for being a valued Vayva customer.
        </div>
        <div style={footerLinks}>
          <a href="https://vayva.tech" style={footerLink}>Website</a>
          <a href="https://vayva.tech/support" style={footerLink}>Support</a>
          <a href="https://vayva.tech/privacy" style={footerLink}>Privacy</a>
        </div>
      </div>
    </div>
  );
}

// Styles
const container: React.CSSProperties = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  backgroundColor: "#f9fafb",
  padding: "40px 20px",
  margin: 0,
};

const header: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "30px",
  borderRadius: "12px",
  marginBottom: "20px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const logo: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#059669",
  textAlign: "center" as const,
};

const content: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "12px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const title: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#111827",
  marginTop: 0,
  marginBottom: "20px",
};

const greeting: React.CSSProperties = {
  fontSize: "16px",
  color: "#374151",
  marginBottom: "20px",
};

const bodyText: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.6,
  color: "#374151",
  marginBottom: "20px",
};

const reasonsBox: React.CSSProperties = {
  backgroundColor: "#f3f4f6",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "20px",
};

const reasonsList: React.CSSProperties = {
  margin: 0,
  paddingLeft: "20px",
  color: "#374151",
  fontSize: "14px",
  lineHeight: 1.8,
};

const infoBox: React.CSSProperties = {
  backgroundColor: "#ecfdf5",
  border: "1px solid #059669",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "25px",
};

const infoRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px",
  fontSize: "14px",
};

const infoLabel: React.CSSProperties = {
  color: "#6b7280",
  fontWeight: 500,
};

const infoValue: React.CSSProperties = {
  color: "#111827",
  fontWeight: 600,
};

const infoValueAmount: React.CSSProperties = {
  color: "#059669",
  fontWeight: "bold",
  fontSize: "16px",
};

const ctaContainer: React.CSSProperties = {
  textAlign: "center",
  margin: "30px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#059669",
  color: "#ffffff",
  padding: "14px 32px",
  borderRadius: "8px",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: 600,
  display: "inline-block",
};

const secondaryText: React.CSSProperties = {
  fontSize: "14px",
  color: "#6b7280",
  lineHeight: 1.6,
  marginBottom: "20px",
};

const warningBox: React.CSSProperties = {
  backgroundColor: "#fffbeb",
  border: "1px solid #fbbf24",
  borderRadius: "8px",
  padding: "15px",
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
  marginBottom: "25px",
};

const warningIcon: React.CSSProperties = {
  fontSize: "20px",
};

const supportBox: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  padding: "20px",
  borderRadius: "8px",
  textAlign: "center" as const,
};

const supportText: React.CSSProperties = {
  fontSize: "14px",
  color: "#6b7280",
  marginBottom: "10px",
};

const supportLinks: React.CSSProperties = {
  fontSize: "14px",
};

const supportLink: React.CSSProperties = {
  color: "#059669",
  textDecoration: "none",
  fontWeight: 600,
};

const supportDivider: React.CSSProperties = {
  margin: "0 10px",
  color: "#d1d5db",
};

const footer: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "30px 20px",
  color: "#6b7280",
  fontSize: "14px",
};

const footerText: React.CSSProperties = {
  marginBottom: "10px",
};

const footerLinks: React.CSSProperties = {
  marginTop: "10px",
};

const footerLink: React.CSSProperties = {
  color: "#6b7280",
  textDecoration: "none",
  margin: "0 10px",
  fontSize: "13px",
};

// Export for use
export default DunningFirstAttemptEmail;

// For direct rendering
export function renderDunningFirstAttempt(props: DunningFirstAttemptEmailProps) {
  return render(<DunningFirstAttemptEmail {...props} />);
}
