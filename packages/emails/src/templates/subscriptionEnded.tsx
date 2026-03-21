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
} from "@react-email/components";
import * as React from "react";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";

interface SubscriptionEndedEmailProps {
  storeName: string;
  planName: string;
  reactivationUrl: string;
}

export const SubscriptionEndedEmail = ({
  storeName,
  planName,
  reactivationUrl,
}: SubscriptionEndedEmailProps) => {
  const previewText = `Your subscription has ended`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <VayvaGlowLayout>
          <Container style={container}>
            <Heading style={heading}>Subscription Ended</Heading>
            
            <Section style={section}>
              <Text style={text}>
                Your <strong>{planName}</strong> subscription for <strong>{storeName}</strong> has ended due to multiple unsuccessful payment attempts.
              </Text>
              
              <Section style={warningBox}>
                <Text style={warningText}>
                  ⚠ Your store is currently inactive
                  <br />
                  ⚠ Premium features are no longer available
                  <br />
                  ⚠ Customers cannot access your storefront
                </Text>
              </Section>
              
              <Text style={text}>
                Don't worry! You can reactivate your subscription at any time to restore full functionality and pick up where you left off.
              </Text>
              
              <Section style={buttonSection}>
                <Button style={button} href={reactivationUrl}>
                  Reactivate Subscription
                </Button>
              </Section>
              
              <Text style={footerText}>
                Need help? Contact our support team for assistance with reactivation options.
              </Text>
            </Section>
          </Container>
        </VayvaGlowLayout>
      </Body>
    </Html>
  );
};

export default SubscriptionEndedEmail;

const main = {
  backgroundColor: "#0f172a",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#1e293b",
  margin: "0 auto",
  marginTop: "40px",
  marginBottom: "40px",
  padding: "48px 36px",
  borderRadius: "16px",
  border: "1px solid rgba(245, 158, 11, 0.2)",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
};

const heading = {
  color: "#fbbf24",
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const section = {
  textAlign: "center" as const,
};

const text = {
  color: "#94a3b8",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px 0",
};

const warningBox = {
  backgroundColor: "rgba(245, 158, 11, 0.1)",
  border: "1px solid rgba(245, 158, 11, 0.3)",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const warningText = {
  color: "#fbbf24",
  fontSize: "14px",
  lineHeight: "28px",
  margin: "0",
};

const buttonSection = {
  margin: "32px 0",
};

const button = {
  backgroundColor: "#f59e0b",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

const footerText = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "32px 0 0 0",
};
