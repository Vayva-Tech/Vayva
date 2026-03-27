import { render } from "@react-email/render";
import * as React from "react";

interface DunningFinalNoticeEmailProps {
  firstName: string;
  storeName: string;
  plan: string;
  amountDue: string;
  attemptNumber: number;
  maxAttempts: number;
  suspensionDate: string;
  supportEmail: string;
  supportPhone: string;
}

export function DunningFinalNoticeEmail({
  firstName,
  storeName,
  plan,
  amountDue,
  attemptNumber,
  maxAttempts,
  suspensionDate,
  supportEmail,
  supportPhone,
}: DunningFinalNoticeEmailProps) {
  return (
    <div style={container}>
      <div style={header}>
        <div style={logo}>Vayva</div>
      </div>

      <div style={content}>
        <div style={criticalBanner}>FINAL NOTICE</div>
        
        <h1 style={titleCritical}>Subscription Suspension Imminent</h1>

        <div style={greeting}>
          Dear {firstName},
        </div>

        <div style={criticalAlertBox}>
          <div style={criticalIcon}>🚨</div>
          <div style={criticalText}>
            <strong>CRITICAL:</strong> This is your final notice. Your subscription for 
            <strong> {storeName}</strong> will be suspended on <strong>{suspensionDate}</strong> 
            unless payment is received immediately.
          </div>
        </div>

        <div style={bodyText}>
          Despite our previous attempts, we have been unable to process your subscription payment. 
          This is your <strong>final notification</strong> before account restriction.
        </div>

        <div style={statusBox}>
          <h3 style={statusTitle}>Account Status</h3>
          <div style={statusGrid}>
            <div style={statusRow}>
              <span style={statusLabel}>Current Plan:</span>
              <span style={statusValue}>{plan}</span>
            </div>
            <div style={statusRow}>
              <span style={statusLabel}>Amount Due:</span>
              <span style={statusValueAmount}>{amountDue}</span>
            </div>
            <div style={statusRow}>
              <span style={statusLabel}>Payment Attempts:</span>
              <span style={statusValueFailed}>{attemptNumber} of {maxAttempts} (FAILED)</span>
            </div>
            <div style={statusRow}>
              <span style={statusLabel}>Suspension Date:</span>
              <span style={statusValueCritical}>{suspensionDate}</span>
            </div>
            <div style={statusRow}>
              <span style={statusLabel}>Account Status:</span>
              <span style={statusBadgeCritical}>AT RISK OF SUSPENSION</span>
            </div>
          </div>
        </div>

        <div style={ctaContainer}>
          <a href="https://merchant.vayva.tech/dashboard/billing" style={buttonCritical}>
            PAY NOW TO AVOID SUSPENSION
          </a>
        </div>

        <div style={timelineBox}>
          <h3 style={timelineTitle}>Timeline of Events</h3>
          <div style={timelineItem}>
            <div style={timelineDotFailed}>✗</div>
            <div style={timelineContent}>
              <strong>First Payment Attempt Failed</strong>
              <div style={timelineDesc}>Initial payment processing failed</div>
            </div>
          </div>
          <div style={timelineItem}>
            <div style={timelineDotFailed}>✗</div>
            <div style={timelineContent}>
              <strong>Second Payment Attempt Failed</strong>
              <div style={timelineDesc}>Follow-up retry unsuccessful</div>
            </div>
          </div>
          <div style={timelineItem}>
            <div style={timelineDotFinal}>!</div>
            <div style={timelineContent}>
              <strong>Final Notice Issued</strong>
              <div style={timelineDesc}>This email - immediate action required</div>
            </div>
          </div>
          <div style={timelineItem}>
            <div style={timelineDotFuture}>⊘</div>
            <div style={timelineContent}>
              <strong>Account Suspension (If No Action)</strong>
              <div style={timelineDesc}>Scheduled for {suspensionDate}</div>
            </div>
          </div>
        </div>

        <div style={consequencesBoxCritical}>
          <h3 style={consequencesTitleCritical}>Immediate Consequences of Suspension</h3>
          <div style={consequencesGrid}>
            <div style={consequenceItem}>
              <span style={consequenceIcon}>❌</span>
              <div>
                <strong>All Premium Features Disabled</strong>
                <div style={consequenceDesc}>AI Autopilot, automation, advanced analytics</div>
              </div>
            </div>
            <div style={consequenceItem}>
              <span style={consequenceIcon}>❌</span>
              <div>
                <strong>Store Downgraded to FREE Plan</strong>
                <div style={consequenceDesc}>Limited features and restrictions apply</div>
              </div>
            </div>
            <div style={consequenceItem}>
              <span style={consequenceIcon}>❌</span>
              <div>
                <strong>API Access Revoked</strong>
                <div style={consequenceDesc}>All integrations and API calls stopped</div>
              </div>
            </div>
            <div style={consequenceItem}>
              <span style={consequenceIcon}>❌</span>
              <div>
                <strong>Priority Support Lost</strong>
                <div style={consequenceDesc}>Standard support only upon reactivation</div>
              </div>
            </div>
            <div style={consequenceItemPositive}>
              <span style={consequenceIconPositive}>✓</span>
              <div>
                <strong>Data Preserved for 90 Days</strong>
                <div style={consequenceDescPositive}>Your data remains safe and can be exported</div>
              </div>
            </div>
          </div>
        </div>

        <div style={lastChanceBox}>
          <h3 style={lastChanceTitle}>Last Chance to Avoid Suspension</h3>
          <p style={lastChanceText}>
            You have until <strong>{suspensionDate}</strong> to update your payment method and avoid 
            automatic suspension. After this date, your account will be automatically downgraded and 
            all premium features will be disabled.
          </p>
          <p style={lastChanceText}>
            <strong>Reactivation after suspension requires:</strong>
          </p>
          <ul style={reactivationList}>
            <li>Payment of all outstanding amounts</li>
            <li>Manual reactivation request through support</li>
            <li>Potential reactivation fee of ₦5,000</li>
            <li>New payment method verification</li>
          </ul>
        </div>

        <div style={supportBoxCritical}>
          <div style={supportTextCritical}>
            <strong>IMMEDIATE ASSISTANCE REQUIRED?</strong>
            <br />
            Contact our emergency support team RIGHT NOW:
          </div>
          <div style={supportContacts}>
            <a href={`tel:${supportPhone}`} style={supportPhoneLink}>
              📞 {supportPhone} (Call Immediately)
            </a>
            <a href={`mailto:${supportEmail}`} style={supportEmailLink}>
              📧 {supportEmail}
            </a>
          </div>
          <div style={supportAvailability}>
            Available Monday - Saturday, 8:00 AM - 6:00 PM WAT
          </div>
        </div>

        <div style={appealBox}>
          <p style={appealText}>
            We understand that circumstances can be challenging. If you're facing temporary difficulties, 
            please contact us immediately to discuss options such as:
          </p>
          <ul style={optionsList}>
            <li>Temporary account pause (₦5,000/month)</li>
            <li>Payment plan arrangements</li>
            <li>Alternative payment methods</li>
            <li>Downgrade to a more affordable plan</li>
          </ul>
        </div>
      </div>

      <div style={footer}>
        <div style={footerText}>
          This is an automated final notice. Please take immediate action to avoid service interruption.
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

const criticalBanner: React.CSSProperties = {
  backgroundColor: "#7f1d1d",
  color: "#ffffff",
  padding: "10px 20px",
  borderRadius: "6px",
  fontSize: "16px",
  fontWeight: "bold",
  textAlign: "center" as const,
  marginBottom: "20px",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  border: "2px solid #dc2626",
};

const content: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "12px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const titleCritical: React.CSSProperties = {
  fontSize: "26px",
  fontWeight: "bold",
  color: "#dc2626",
  marginTop: 0,
  marginBottom: "25px",
  textTransform: "uppercase" as const,
};

const greeting: React.CSSProperties = {
  fontSize: "16px",
  color: "#1f2937",
  marginBottom: "20px",
  fontWeight: 600,
};

const criticalAlertBox: React.CSSProperties = {
  backgroundColor: "#fef2f2",
  border: "3px solid #dc2626",
  borderRadius: "8px",
  padding: "20px",
  display: "flex",
  gap: "15px",
  alignItems: "flex-start",
  marginBottom: "25px",
};

const criticalIcon: React.CSSProperties = {
  fontSize: "28px",
};

const criticalText: React.CSSProperties = {
  fontSize: "15px",
  color: "#991b1b",
  lineHeight: 1.6,
  fontWeight: 600,
};

const bodyText: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.6,
  color: "#1f2937",
  marginBottom: "25px",
};

const statusBox: React.CSSProperties = {
  backgroundColor: "#fef2f2",
  border: "2px solid #dc2626",
  borderRadius: "8px",
  padding: "25px",
  marginBottom: "30px",
};

const statusTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#991b1b",
  marginTop: 0,
  marginBottom: "20px",
  textTransform: "uppercase" as const,
};

const statusGrid: React.CSSProperties = {
  display: "grid",
  gap: "15px",
};

const statusRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px",
  backgroundColor: "#ffffff",
  borderRadius: "6px",
  fontSize: "14px",
};

const statusLabel: React.CSSProperties = {
  color: "#6b7280",
  fontWeight: 600,
};

const statusValue: React.CSSProperties = {
  color: "#1f2937",
  fontWeight: 600,
};

const statusValueAmount: React.CSSProperties = {
  color: "#dc2626",
  fontWeight: "bold",
  fontSize: "18px",
};

const statusValueFailed: React.CSSProperties = {
  color: "#dc2626",
  fontWeight: "bold",
};

const statusValueCritical: React.CSSProperties = {
  color: "#dc2626",
  fontWeight: "bold",
  fontSize: "16px",
};

const statusBadgeCritical: React.CSSProperties = {
  backgroundColor: "#dc2626",
  color: "#ffffff",
  padding: "4px 12px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
};

const ctaContainer: React.CSSProperties = {
  textAlign: "center",
  margin: "35px 0",
};

const buttonCritical: React.CSSProperties = {
  backgroundColor: "#dc2626",
  color: "#ffffff",
  padding: "18px 40px",
  borderRadius: "8px",
  textDecoration: "none",
  fontSize: "18px",
  fontWeight: 700,
  display: "inline-block",
  boxShadow: "0 4px 6px rgba(220, 38, 38, 0.4)",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const timelineBox: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  padding: "25px",
  borderRadius: "8px",
  marginBottom: "30px",
};

const timelineTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#1f2937",
  marginTop: 0,
  marginBottom: "20px",
};

const timelineItem: React.CSSProperties = {
  display: "flex",
  gap: "15px",
  marginBottom: "20px",
  alignItems: "flex-start",
};

const timelineDotFailed: React.CSSProperties = {
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  backgroundColor: "#fecaca",
  color: "#dc2626",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  fontSize: "16px",
  flexShrink: 0,
};

const timelineDotFinal: React.CSSProperties = {
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  backgroundColor: "#fee2e2",
  color: "#dc2626",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  fontSize: "16px",
  flexShrink: 0,
  border: "2px solid #dc2626",
};

const timelineDotFuture: React.CSSProperties = {
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  backgroundColor: "#f3f4f6",
  color: "#6b7280",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  flexShrink: 0,
};

const timelineContent: React.CSSProperties = {
  flex: 1,
};

const timelineDesc: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  marginTop: "4px",
};

const consequencesBoxCritical: React.CSSProperties = {
  backgroundColor: "#fef2f2",
  border: "2px solid #dc2626",
  borderRadius: "8px",
  padding: "25px",
  marginBottom: "30px",
};

const consequencesTitleCritical: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#991b1b",
  marginTop: 0,
  marginBottom: "20px",
  textTransform: "uppercase" as const,
};

const consequencesGrid: React.CSSProperties = {
  display: "grid",
  gap: "15px",
};

const consequenceItem: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
  padding: "12px",
  backgroundColor: "#ffffff",
  borderRadius: "6px",
};

const consequenceItemPositive: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
  padding: "12px",
  backgroundColor: "#ecfdf5",
  borderRadius: "6px",
  border: "1px solid #059669",
};

const consequenceIcon: React.CSSProperties = {
  fontSize: "20px",
  flexShrink: 0,
};

const consequenceIconPositive: React.CSSProperties = {
  fontSize: "20px",
  color: "#059669",
  flexShrink: 0,
};

const consequenceDesc: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  marginTop: "4px",
};

const consequenceDescPositive: React.CSSProperties = {
  fontSize: "13px",
  color: "#065f46",
  marginTop: "4px",
};

const lastChanceBox: React.CSSProperties = {
  backgroundColor: "#fffbeb",
  border: "2px solid #f59e0b",
  borderRadius: "8px",
  padding: "25px",
  marginBottom: "30px",
};

const lastChanceTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#92400e",
  marginTop: 0,
  marginBottom: "15px",
};

const lastChanceText: React.CSSProperties = {
  fontSize: "14px",
  color: "#78350f",
  lineHeight: 1.6,
  marginBottom: "12px",
};

const reactivationList: React.CSSProperties = {
  margin: "12px 0 0 0",
  paddingLeft: "20px",
  listStyle: "disc",
  color: "#78350f",
  fontSize: "14px",
  lineHeight: 1.8,
};

const supportBoxCritical: React.CSSProperties = {
  backgroundColor: "#fef2f2",
  border: "3px solid #dc2626",
  borderRadius: "8px",
  padding: "25px",
  marginBottom: "30px",
  textAlign: "center" as const,
};

const supportTextCritical: React.CSSProperties = {
  fontSize: "15px",
  color: "#991b1b",
  marginBottom: "15px",
  fontWeight: 700,
  textTransform: "uppercase" as const,
};

const supportContacts: React.CSSProperties = {
  display: "flex",
  gap: "20px",
  justifyContent: "center",
  marginBottom: "10px",
  flexWrap: "wrap" as const,
};

const supportPhoneLink: React.CSSProperties = {
  backgroundColor: "#dc2626",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "16px",
  display: "inline-block",
};

const supportEmailLink: React.CSSProperties = {
  backgroundColor: "#ffffff",
  color: "#dc2626",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "16px",
  border: "2px solid #dc2626",
  display: "inline-block",
};

const supportAvailability: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  fontStyle: "italic",
  marginTop: "10px",
};

const appealBox: React.CSSProperties = {
  backgroundColor: "#f0f9ff",
  border: "1px solid #0ea5e9",
  borderRadius: "8px",
  padding: "20px",
};

const appealText: React.CSSProperties = {
  fontSize: "14px",
  color: "#0c4a6e",
  lineHeight: 1.6,
  marginBottom: "12px",
};

const optionsList: React.CSSProperties = {
  margin: "12px 0 0 0",
  paddingLeft: "20px",
  listStyle: "disc",
  color: "#0c4a6e",
  fontSize: "14px",
  lineHeight: 1.8,
};

const footer: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "30px 20px",
  color: "#6b7280",
  fontSize: "14px",
};

const footerText: React.CSSProperties = {
  marginBottom: "10px",
  fontWeight: 600,
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
export default DunningFinalNoticeEmail;

// For direct rendering
export function renderDunningFinalNotice(props: DunningFinalNoticeEmailProps) {
  return render(<DunningFinalNoticeEmail {...props} />);
}
