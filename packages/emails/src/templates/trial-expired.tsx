import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";

interface TrialExpiredProps {
  merchantName?: string;
  storeName?: string;
  gracePeriodEndsAt?: string;
  daysInGrace?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vayva.ng";

export const TrialExpired = ({
  merchantName = "there",
  storeName = "your store",
  daysInGrace = 3,
}: TrialExpiredProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your trial has expired - You have a 3-day grace period</Preview>
      <VayvaGlowLayout>
        <Body style={main}>
          <Container style={container}>
            <Heading style={heading}>Your Trial Has Expired ⏰</Heading>
            
            <Text style={paragraph}>
              Hi {merchantName},
            </Text>

            <Text style={paragraph}>
              Your Vayva free trial has ended. Don't worry — you still have <strong>{daysInGrace} days</strong> of grace period to upgrade before your AI features are paused.
            </Text>

            <Section style={warningBox}>
              <Text style={warningHeading}>
                ⚠️ What Happens Next?
              </Text>
              
              <Text style={listItem}>
                <strong>During Grace Period ({daysInGrace} days):</strong> Your store remains fully functional
              </Text>
              <Text style={listItem}>
                <strong>After Grace Period:</strong> AI features will be paused until you upgrade
              </Text>
              <Text style={listItem}>
                <strong>Your Data:</strong> Safe and secure - always accessible when you upgrade
              </Text>
            </Section>

            <Section style={upgradeBox}>
              <Text style={upgradeHeading}>
                🚀 Upgrade Now to Keep Going
              </Text>
              
              <Text style={upgradeText}>
                Choose a plan that fits your business:
              </Text>

              <Text style={planItem}>
                <strong>Starter:</strong> ₦25,000/month - Perfect for small stores
              </Text>
              <Text style={planItem}>
                <strong>Pro:</strong> ₦35,000/month - Most popular choice
              </Text>
              <Text style={planItem}>
                <strong>Pro+:</strong> ₦50,000/month - Maximum power & features
              </Text>

              <Button 
                style={button} 
                href={`${baseUrl}/dashboard/settings/billing`}
              >
                Upgrade My Account
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Questions about upgrading? Our team is here to help at{" "}
              <a href="mailto:support@vayva.ng" style={link}>support@vayva.ng</a>
            </Text>

            <Text style={footerText}>
              The Vayva Team
            </Text>
          </Container>
        </Body>
      </VayvaGlowLayout>
    </Html>
  );
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1a1a1a",
  marginTop: "32px",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#4a4a4a",
  marginBottom: "16px",
};

const warningBox = {
  backgroundColor: "#fef3c7",
  border: "2px solid #f59e0b",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "24px",
};

const warningHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#92400e",
  marginBottom: "16px",
  textAlign: "center" as const,
};

const listItem = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#78350f",
  marginBottom: "10px",
};

const upgradeBox = {
  backgroundColor: "#f0fdf4",
  border: "2px solid #10b981",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const upgradeHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#065f46",
  marginBottom: "12px",
  textAlign: "center" as const,
};

const upgradeText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#047857",
  marginBottom: "16px",
};

const planItem = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#059669",
  marginBottom: "8px",
  textAlign: "left" as const,
  paddingLeft: "8px",
};

const button = {
  backgroundColor: "#10b981",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  marginTop: "16px",
  boxShadow: "0 4px 6px rgba(16, 185, 129, 0.2)",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const footer = {
  fontSize: "14px",
  color: "#6b7280",
  textAlign: "center" as const,
  marginBottom: "8px",
};

const link = {
  color: "#10b981",
  textDecoration: "underline",
};

const footerText = {
  fontSize: "14px",
  color: "#9ca3af",
  textAlign: "center" as const,
};

export default TrialExpired;
