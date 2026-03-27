import { render } from "@react-email/render";
import * as React from "react";

interface DunningSecondAttemptEmailProps {
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

export function DunningSecondAttemptEmail({
  firstName,
  storeName,
  plan,
  amountDue,
  attemptNumber,
  maxAttempts,
  nextRetryDate,
  supportEmail,
  supportPhone,
}: DunningSecondAttemptEmailProps) {
  return (
    <div style={container}>
      <div style={header}>
        <div style={logo}>Vayva</div>
      </div>

      <div style={content}>
        <div style={urgentBanner}>URGENT</div>
        
        <h1 style={title}>Payment Still Failing - Account at Risk</h1>

        <div style={greeting}>
          Hi {firstName},
        </div>

        <div style={alertBox}>
          <div style={alertIcon}>⚠️</div>
          <div style={alertText}>
            <strong>Important:</strong> This is the second notice about a failed payment for your 
            <strong>{storeName}</strong> subscription. Your account is now at risk of suspension.
          </div>
        </div>

        <div style={bodyText}>
          Our previous payment attempt failed and we were unable to process your subscription renewal. 
          This is your <strong>second notification</strong> - immediate action is required to avoid service interruption.
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
            <span style={infoLabel}>Final Retry Date:</span>
            <span style={infoValueCritical}>{nextRetryDate}</span>
          </div>
          <div style={infoRow}>
            <span style={infoLabel}>Attempts Used:</span>
            <span style={infoValueCritical}>{attemptNumber} of {maxAttempts}</span>
          </div>
        </div>

        <div style={ctaContainer}>
          <a href="https://merchant.vayva.tech/dashboard/billing" style={buttonUrgent}>
            Update Payment Method Now
          </a>
        </div>

        <div style={warningBoxCritical}>
          <div style={warningIconCritical}>🚨</div>
          <div>
            <strong style={criticalText}>FINAL WARNING</strong>
            <br />
            If payment fails on the next attempt ({nextRetryDate}), your subscription will be 
            <strong> automatically suspended</strong> and you will lose access to all premium features.
          </div>
        </div>

        <div style={consequencesBox}>
          <h3 style={consequencesTitle}>What happens if payment continues to fail?</h3>
          <ul style={consequencesList}>
            <li>❌ Loss of access to all premium features</li>
            <li>❌ Your store will be downgraded to FREE plan</li>
            <li>❌ AI Autopilot and automation will be disabled</li>
            <li>❌ Advanced analytics and reporting unavailable</li>
            <li>❌ API access and integrations stopped</li>
            <li>✅ Your data remains safe and accessible for 90 days</li>
          </ul>
        </div>

        <div style={supportBox}>
          <div style={supportText}>
            <strong>We're here to help!</strong> If you're experiencing issues, please contact us immediately:
          </div>
          <div style={supportLinks}>
            <a href={`mailto:${supportEmail}`} style={supportLink}>
              📧 Email: {supportEmail}
            </a>
            <span style={supportDivider}>•</span>
            <a href={`tel:${supportPhone}`} style={supportLink}>
              📞 Call: {supportPhone}
            </a>
          </div>
          <div style={supportHours}>
            Available Monday - Saturday, 8:00 AM - 6:00 PM WAT
          </div>
        </div>

        <div style={secondaryText}>
          <strong>Need more time?</strong> Contact our support team to discuss alternative payment arrangements 
          or temporary account pause options.
        </div>
      </div>

      <div style={footer}>
        <div style={footerText}>
          We value your business and want to continue serving you.
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

const urgentBanner: React.CSSProperties = {
  backgroundColor: "#dc2626",
  color: "#ffffff",
  padding: "8px 16px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "bold",
  textAlign: "center" as const,
  marginBottom: "20px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
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
  color: "#dc2626",
  marginTop: 0,
  marginBottom: "20px",
};

const greeting: React.CSSProperties = {
  fontSize: "16px",
  color: "#374151",
  marginBottom: "20px",
};

const alertBox: React.CSSProperties = {
  backgroundColor: "#fef3c7",
  border: "2px solid #f59e0b",
  borderRadius: "8px",
  padding: "15px",
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
  marginBottom: "20px",
};

const alertIcon: React.CSSProperties = {
  fontSize: "20px",
};

const alertText: React.CSSProperties = {
  fontSize: "14px",
  color: "#92400e",
  lineHeight: 1.6,
};

const bodyText: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.6,
  color: "#374151",
  marginBottom: "20px",
};

const infoBox: React.CSSProperties = {
  backgroundColor: "#fef2f2",
  border: "2px solid #dc2626",
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
  color: "#dc2626",
  fontWeight: "bold",
  fontSize: "16px",
};

const infoValueCritical: React.CSSProperties = {
  color: "#dc2626",
  fontWeight: "bold",
};

const ctaContainer: React.CSSProperties = {
  textAlign: "center",
  margin: "30px 0",
};

const buttonUrgent: React.CSSProperties = {
  backgroundColor: "#dc2626",
  color: "#ffffff",
  padding: "16px 32px",
  borderRadius: "8px",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: 600,
  display: "inline-block",
  boxShadow: "0 2px 4px rgba(220, 38, 38, 0.3)",
};

const warningBoxCritical: React.CSSProperties = {
  backgroundColor: "#fef2f2",
  border: "2px solid #dc2626",
  borderRadius: "8px",
  padding: "20px",
  display: "flex",
  gap: "15px",
  alignItems: "flex-start",
  marginBottom: "25px",
};

const warningIconCritical: React.CSSProperties = {
  fontSize: "24px",
};

const criticalText: React.CSSProperties = {
  color: "#dc2626",
  fontSize: "16px",
};

const consequencesBox: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "25px",
};

const consequencesTitle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "bold",
  color: "#111827",
  marginTop: 0,
  marginBottom: "12px",
};

const consequencesList: React.CSSProperties = {
  margin: 0,
  paddingLeft: "0",
  listStyle: "none",
  fontSize: "14px",
  lineHeight: 2,
  color: "#374151",
};

const supportBox: React.CSSProperties = {
  backgroundColor: "#ecfdf5",
  border: "1px solid #059669",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "20px",
};

const supportText: React.CSSProperties = {
  fontSize: "14px",
  color: "#065f46",
  marginBottom: "10px",
};

const supportLinks: React.CSSProperties = {
  fontSize: "14px",
  marginBottom: "8px",
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

const supportHours: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  fontStyle: "italic",
};

const secondaryText: React.CSSProperties = {
  fontSize: "14px",
  color: "#6b7280",
  lineHeight: 1.6,
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
export default DunningSecondAttemptEmail;

// For direct rendering
export function renderDunningSecondAttempt(props: DunningSecondAttemptEmailProps) {
  return render(<DunningSecondAttemptEmail {...props} />);
}
