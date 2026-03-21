import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";

interface PaymentRecoveredEmailProps {
  storeName: string;
  amount: string;
  currency: string;
}

export const PaymentRecoveredEmail = ({
  storeName,
  amount,
  currency,
}: PaymentRecoveredEmailProps) => {
  const previewText = `Payment successful for ${storeName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <VayvaGlowLayout>
          <Container style={container}>
            <Heading style={heading}>Payment Successful ✓</Heading>
            
            <Section style={section}>
              <Text style={text}>
                Great news! Your payment for <strong>{storeName}</strong> has been successfully processed.
              </Text>
              
              <Section style={infoBox}>
                <Text style={infoLabel}>Amount Paid:</Text>
                <Text style={infoValue}>{currency}{amount}</Text>
              </Section>
              
              <Text style={text}>
                Your subscription is now active and all services are fully restored. 
                Thank you for staying with us!
              </Text>
              
              <Text style={successText}>
                ✓ All features are now available
                <br />
                ✓ No service interruption
                <br />
                ✓ Next billing date remains unchanged
              </Text>
            </Section>
          </Container>
        </VayvaGlowLayout>
      </Body>
    </Html>
  );
};

export default PaymentRecoveredEmail;

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
  border: "1px solid rgba(34, 197, 94, 0.2)",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
};

const heading = {
  color: "#4ade80",
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
  backgroundColor: "rgba(34, 197, 94, 0.1)",
  border: "1px solid rgba(34, 197, 94, 0.3)",
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

const successText = {
  color: "#4ade80",
  fontSize: "14px",
  lineHeight: "28px",
  margin: "24px 0 0 0",
  backgroundColor: "rgba(34, 197, 94, 0.1)",
  padding: "16px",
  borderRadius: "8px",
};
