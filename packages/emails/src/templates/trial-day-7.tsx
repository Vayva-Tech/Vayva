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

interface TrialDay7Props {
  merchantName?: string;
  storeName?: string;
  trialEndsAt?: string;
  daysRemaining?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vayva.ng";

export const TrialDay7 = ({
  merchantName = "there",
  storeName = "your store",
  daysRemaining = 7,
}: TrialDay7Props) => {
  return (
    <Html>
      <Head />
      <Preview>Getting value? Here's how to maximize your Vayva trial</Preview>
      <VayvaGlowLayout>
        <Body style={main}>
          <Container style={container}>
            <Heading style={heading}>Getting value from your trial?</Heading>
            
            <Text style={paragraph}>
              Hi {merchantName},
            </Text>

            <Text style={paragraph}>
              You're {7 - daysRemaining} days into your Vayva trial, and we wanted to share some tips to help you get the most out of it.
            </Text>

            <Section style={section}>
              <Text style={subheading}>🚀 Quick Wins to Try:</Text>
              
              <Text style={listItem}>
                <strong>1. Connect WhatsApp</strong> — Let AI handle customer orders automatically
              </Text>
              <Text style={listItem}>
                <strong>2. Add Your Products</strong> — Upload at least 10 products for better AI responses
              </Text>
              <Text style={listItem}>
                <strong>3. Test the AI Agent</strong> — Send a test message to see it in action
              </Text>
              <Text style={listItem}>
                <strong>4. Check Analytics</strong> — See your order trends and customer insights
              </Text>
            </Section>

            <Section style={buttonSection}>
              <Button 
                style={button} 
                href={`${baseUrl}/dashboard`}
              >
                Explore Dashboard
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Need help? Reply to this email or visit our{" "}
              <a href="https://vayva.ng/help" style={link}>Help Center</a>
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

const section = {
  backgroundColor: "#f3f4f6",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "24px",
};

const subheading = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "16px",
};

const listItem = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#4a4a4a",
  marginBottom: "12px",
};

const buttonSection = {
  textAlign: "center" as const,
  marginTop: "32px",
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

export default TrialDay7;
