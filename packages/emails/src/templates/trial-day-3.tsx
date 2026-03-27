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

interface TrialDay3Props {
  merchantName?: string;
  storeName?: string;
  daysRemaining?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vayva.ng";

export const TrialDay3 = ({
  merchantName = "there",
  storeName = "your store",
  daysRemaining = 3,
}: TrialDay3Props) => {
  return (
    <Html>
      <Head />
      <Preview>See how similar merchants grew 3x with Vayva AI</Preview>
      <VayvaGlowLayout>
        <Body style={main}>
          <Container style={container}>
            <Heading style={heading}>Success Story: Merchants Like You 🎉</Heading>
            
            <Text style={paragraph}>
              Hi {merchantName},
            </Text>

            <Text style={paragraph}>
              With just {daysRemaining} days left in your trial, we wanted to share how other merchants are crushing it with Vayva.
            </Text>

            <Section style={successStory}>
              <Text style={storyHeading}>📈 From Chaos to 3x Growth</Text>
              
              <Text style={storyText}>
                <strong>Fashion Hub Lagos</strong> was struggling with late-night customer inquiries and missed sales opportunities.
              </Text>

              <Text style={storyText}>
                After implementing Vayva AI:
              </Text>

              <Text style={listItem}>
                ✅ <strong>85% of orders</strong> now handled automatically
              </Text>
              <Text style={listItem}>
                ✅ <strong>₦450,000/month</strong> increase in revenue
              </Text>
              <Text style={listItem}>
                ✅ <strong>Zero missed</strong> customer messages
              </Text>
              <Text style={listItem}>
                ✅ <strong>24/7 availability</strong> without hiring staff
              </Text>

              <Text style={quote}>"Vayva transformed our business. The AI handles everything while I sleep!"</Text>
            </Section>

            <Section style={ctaSection}>
              <Text style={ctaText}>Ready to see these results?</Text>
              <Button 
                style={button} 
                href={`${baseUrl}/dashboard/settings/billing`}
              >
                Upgrade to Pro — Start Growing
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              P.S. Upgrade in the next {daysRemaining} days and get priority onboarding support!
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

const successStory = {
  backgroundColor: "#ecfdf5",
  border: "2px solid #10b981",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "24px",
};

const storyHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#065f46",
  marginBottom: "16px",
  textAlign: "center" as const,
};

const storyText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#047857",
  marginBottom: "12px",
};

const listItem = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#059669",
  marginBottom: "8px",
  paddingLeft: "8px",
};

const quote = {
  fontSize: "14px",
  fontStyle: "italic",
  color: "#065f46",
  marginTop: "16px",
  paddingTop: "16px",
  borderTop: "1px solid #10b981",
  textAlign: "center" as const,
};

const ctaSection = {
  textAlign: "center" as const,
  marginTop: "32px",
  padding: "24px",
  backgroundColor: "#f9fafb",
  borderRadius: "12px",
};

const ctaText = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "20px",
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

export default TrialDay3;
