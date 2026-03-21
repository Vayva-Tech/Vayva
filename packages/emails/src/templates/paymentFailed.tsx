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

interface PaymentFailedEmailProps {
  storeName: string;
  amount: string;
  currency: string;
  retryDate: string;
  billingUrl: string;
}

export const PaymentFailedEmail = ({
  storeName,
  amount,
  currency,
  retryDate,
  billingUrl,
}: PaymentFailedEmailProps) => {
  const previewText = `Payment failed for ${storeName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <VayvaGlowLayout>
          <Container style={container}>
            <Heading style={heading}>Payment Failed</Heading>
            
            <Section style={section}>
              <Text style={text}>
                We were unable to process your payment for <strong>{storeName}</strong>.
              </Text>
              
              <Section style={infoBox}>
                <Text style={infoLabel}>Amount Due:</Text>
                <Text style={infoValue}>{currency}{amount}</Text>
              </Section>
              
              <Text style={text}>
                We'll automatically retry this payment on <strong>{retryDate}</strong>. 
                To avoid any service interruption, please update your payment information.
              </Text>
              
              <Section style={buttonSection}>
                <Button style={button} href={billingUrl}>
                  Update Payment Method
                </Button>
              </Section>
              
              <Text style={footerText}>
                If you have any questions or need assistance, please contact our support team.
              </Text>
            </Section>
          </Container>
        </VayvaGlowLayout>
      </Body>
    </Html>
  );
};

export default PaymentFailedEmail;

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
  border: "1px solid rgba(59, 130, 246, 0.2)",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
};

const heading = {
  color: "#ffffff",
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

const infoBox = {
  backgroundColor: "rgba(59, 130, 246, 0.1)",
  border: "1px solid rgba(59, 130, 246, 0.3)",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const infoLabel = {
  color: "#94a3b8",
  fontSize: "14px",
  margin: "0 0 8px 0",
};

const infoValue = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0",
};

const buttonSection = {
  margin: "32px 0",
};

const button = {
  backgroundColor: "#3b82f6",
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
