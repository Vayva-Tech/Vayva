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

interface WinbackDay30Props {
  merchantName?: string;
  storeName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vayva.ng";

export const WinbackDay30 = ({
  merchantName = "there",
  storeName = "your store",
}: WinbackDay30Props) => {
  return (
    <Html>
      <Head />
      <Preview>Ready to restart? Your account is waiting</Preview>
      <VayvaGlowLayout>
        <Body style={main}>
          <Container style={container}>
            <Heading style={heading}>Ready for a Fresh Start? 🌟</Heading>
            
            <Text style={paragraph}>
              Hi {merchantName},
            </Text>

            <Text style={paragraph}>
              It's been a month since you tried Vayva. A lot has changed, and we'd love to show you what's new.
            </Text>

            <Section style={newFeaturesBox}>
              <Text style={featuresHeading}>
                ✨ What's New at Vayva:
              </Text>
              
              <Text style={featureItem}>
                🚀 <strong>Enhanced AI</strong> - Smarter responses, better order capture
              </Text>
              <Text style={featureItem}>
                📊 <strong>Advanced Analytics</strong> - Deeper insights into customer behavior
              </Text>
              <Text style={featureItem}>
                💳 <strong>Simplified Billing</strong> - Easier plan management
              </Text>
              <Text style={featureItem}>
                🎯 <strong>Industry Templates</strong> - Pre-built workflows for your niche
              </Text>
            </Section>

            <Section style={comebackBox}>
              <Text style={comebackHeading}>
                🎁 Welcome Back Gift
              </Text>
              
              <Text style={comebackText}>
                We've removed all barriers. Start with a fresh 7-day trial - no commitment required.
              </Text>

              <Text style={guarantee}>
                ✅ No setup fees<br/>
                ✅ No credit card required<br/>
                ✅ Keep all your previous data<br/>
                ✅ Cancel anytime
              </Text>
            </Section>

            <Section style={ctaSection}>
              <Button 
                style={button} 
                href={`${baseUrl}/dashboard/settings/billing?restart=true`}
              >
                Restart My Free Trial
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Whether you come back or not, we wish you the best in your business journey!
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

const newFeaturesBox = {
  backgroundColor: "#f3e8ff",
  border: "2px solid #a855f7",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "24px",
};

const featuresHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#6b21a8",
  marginBottom: "16px",
  textAlign: "center" as const,
};

const featureItem = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#581c87",
  marginBottom: "10px",
};

const comebackBox = {
  backgroundColor: "#ecfdf5",
  border: "2px solid #10b981",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "24px",
};

const comebackHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#065f46",
  marginBottom: "12px",
  textAlign: "center" as const,
};

const comebackText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#047857",
  marginBottom: "16px",
};

const guarantee = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#059669",
  backgroundColor: "#d1fae5",
  padding: "12px",
  borderRadius: "6px",
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

export default WinbackDay30;
