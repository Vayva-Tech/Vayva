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

interface WinbackDay3Props {
  merchantName?: string;
  storeName?: string;
  discountCode?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vayva.ng";

export const WinbackDay3 = ({
  merchantName = "there",
  storeName = "your store",
  discountCode = "COMEBACK20",
}: WinbackDay3Props) => {
  return (
    <Html>
      <Head />
      <Preview>We miss you! Here's 20% off to come back</Preview>
      <VayvaGlowLayout>
        <Body style={main}>
          <Container style={container}>
            <Heading style={heading}>We Miss You! 💚</Heading>
            
            <Text style={paragraph}>
              Hi {merchantName},
            </Text>

            <Text style={paragraph}>
              It's only been 3 days since your trial ended, and we'd love to welcome you back!
            </Text>

            <Section style={offerBox}>
              <Text style={offerHeading}>
                🎁 Special Welcome Back Offer
              </Text>
              
              <Text style={offerText}>
                Get <strong>20% OFF</strong> your first month when you upgrade today!
              </Text>

              <Text style={codeBox}>
                Use code: <strong>{discountCode}</strong>
              </Text>

              <Text style={smallText}>
                Valid for the next 48 hours
              </Text>
            </Section>

            <Text style={sectionTitle}>Why Merchants Love Vayva:</Text>

            <Section style={featureGrid}>
              <Text style={featureItem}>
                🤖 <strong>AI That Works 24/7</strong><br/>
                Handle customer orders while you sleep
              </Text>
              <Text style={featureItem}>
                📈 <strong>Real Revenue Growth</strong><br/>
                See 3x more orders captured automatically
              </Text>
              <Text style={featureItem}>
                ⚡ <strong>Zero Setup Required</strong><br/>
                Your AI is already configured and ready
              </Text>
              <Text style={featureItem}>
                💰 <strong>PayStack Integration</strong><br/>
                Accept payments seamlessly from day one
              </Text>
            </Section>

            <Section style={ctaSection}>
              <Button 
                style={button} 
                href={`${baseUrl}/dashboard/settings/billing?promo=${discountCode}`}
              >
                Claim My 20% Discount
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              This exclusive offer expires in 48 hours. Don't miss out!
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

const offerBox = {
  backgroundColor: "#fef3c7",
  border: "3px solid #f59e0b",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "32px",
  textAlign: "center" as const,
};

const offerHeading = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#92400e",
  marginBottom: "12px",
};

const offerText = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#78350f",
  marginBottom: "16px",
};

const codeBox = {
  backgroundColor: "#ffffff",
  border: "2px dashed #f59e0b",
  borderRadius: "8px",
  padding: "12px",
  fontSize: "18px",
  color: "#92400e",
  marginBottom: "8px",
  display: "inline-block",
};

const smallText = {
  fontSize: "13px",
  color: "#92400e",
  fontStyle: "italic",
};

const sectionTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "16px",
};

const featureGrid = {
  backgroundColor: "#f9fafb",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "24px",
};

const featureItem = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#4a4a4a",
  marginBottom: "12px",
};

const ctaSection = {
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

const footerText = {
  fontSize: "14px",
  color: "#9ca3af",
  textAlign: "center" as const,
};

export default WinbackDay3;
