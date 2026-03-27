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

interface WinbackDay7Props {
  merchantName?: string;
  storeName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vayva.ng";

export const WinbackDay7 = ({
  merchantName = "there",
  storeName = "your store",
}: WinbackDay7Props) => {
  return (
    <Html>
      <Head />
      <Preview>Your customers are waiting - Don't miss these opportunities</Preview>
      <VayvaGlowLayout>
        <Body style={main}>
          <Container style={container}>
            <Heading style={heading}>Your Customers Are Waiting 🛍️</Heading>
            
            <Text style={paragraph}>
              Hi {merchantName},
            </Text>

            <Text style={paragraph}>
              While your store is paused, potential customers can't reach you. Every day without Vayva is a missed opportunity.
            </Text>

            <Section style={statsBox}>
              <Text style={statsHeading}>
                📊 What You're Missing:
              </Text>
              
              <Text style={statItem}>
                <strong>Average Order Value:</strong> ₦15,000 - ₦50,000
              </Text>
              <Text style={statItem}>
                <strong>Daily Customer Inquiries:</strong> 20-50 messages
              </Text>
              <Text style={statItem}>
                <strong>Conversion Rate with AI:</strong> 3x higher than manual responses
              </Text>
              <Text style={statItem}>
                <strong>Revenue Potential:</strong> ₦450,000+ per month
              </Text>
            </Section>

            <Section style={testimonialBox}>
              <Text style={quote}>"I almost gave up on my online store. After reactivating Vayva, I made ₦180k in the first week alone. The AI handles everything!"</Text>
              <Text style={author}>— Amina K., Fashion Retailer</Text>
            </Section>

            <Section style={ctaSection}>
              <Text style={ctaText}>Ready to restart your growth?</Text>
              <Button 
                style={button} 
                href={`${baseUrl}/dashboard/settings/billing`}
              >
                Reactivate My Store Now
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Your data and settings are still here - ready when you are!
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

const statsBox = {
  backgroundColor: "#eff6ff",
  border: "2px solid #3b82f6",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "24px",
};

const statsHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#1e40af",
  marginBottom: "16px",
  textAlign: "center" as const,
};

const statItem = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#1e3a8a",
  marginBottom: "10px",
};

const testimonialBox = {
  backgroundColor: "#fdf2f8",
  border: "2px solid #ec4899",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "24px",
};

const quote = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#9d174d",
  fontStyle: "italic",
  marginBottom: "12px",
};

const author = {
  fontSize: "13px",
  color: "#9d174d",
  fontWeight: "600",
  textAlign: "right" as const,
};

const ctaSection = {
  textAlign: "center" as const,
  marginTop: "32px",
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

export default WinbackDay7;
