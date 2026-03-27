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

interface WinbackDay14Props {
  merchantName?: string;
  storeName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vayva.ng";

export const WinbackDay14 = ({
  merchantName = "there",
  storeName = "your store",
}: WinbackDay14Props) => {
  return (
    <Html>
      <Head />
      <Preview>Final chance for special pricing</Preview>
      <VayvaGlowLayout>
        <Body style={main}>
          <Container style={container}>
            <Heading style={heading}>Last Chance for Special Pricing ⏳</Heading>
            
            <Text style={paragraph}>
              Hi {merchantName},
            </Text>

            <Text style={paragraph}>
              This is your final opportunity to reactivate your Vayva account with exclusive benefits.
            </Text>

            <Section style={urgencyBox}>
              <Text style={urgencyHeading}>
                🔥 Final Offer - Next 72 Hours Only
              </Text>
              
              <Text style={offerList}>
                ✅ <strong>First Month 50% Off</strong> - Pay only ₦12,500 for Starter
              </Text>
              <Text style={offerList}>
                ✅ <strong>Free Onboarding Call</strong> - 30-min strategy session
              </Text>
              <Text style={offerList}>
                ✅ <strong>Priority Support</strong> - Get help when you need it
              </Text>
              <Text style={offerList}>
                ✅ <strong>No Setup Fees</strong> - Save ₦10,000
              </Text>

              <Text style={smallPrint}>
                This offer expires in 72 hours and won't be repeated
              </Text>
            </Section>

            <Section style={valueBox}>
              <Text style={valueHeading}>
                Why Wait? Start Earning Today
              </Text>
              
              <Text style={valueText}>
                Merchants who upgrade within 2 weeks see:
              </Text>

              <Text style={statHighlight}>
                📈 <strong>2.8x faster</strong> time to first sale
              </Text>
              <Text style={statHighlight}>
                💰 <strong>65% higher</strong> monthly revenue
              </Text>
              <Text style={statHighlight}>
                ⚡ <strong>Zero learning curve</strong> - AI already knows your business
              </Text>
            </Section>

            <Section style={ctaSection}>
              <Button 
                style={button} 
                href={`${baseUrl}/dashboard/settings/billing?promo=FINAL50`}
              >
                Claim My 50% Discount
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              After 72 hours, this exclusive offer expires. Standard pricing will apply.
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

const urgencyBox = {
  backgroundColor: "#fef3c7",
  border: "3px solid #f59e0b",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "24px",
};

const urgencyHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#92400e",
  marginBottom: "16px",
  textAlign: "center" as const,
};

const offerList = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#78350f",
  marginBottom: "8px",
  paddingLeft: "8px",
};

const smallPrint = {
  fontSize: "12px",
  color: "#92400e",
  fontStyle: "italic",
  marginTop: "16px",
  paddingTop: "12px",
  borderTop: "1px solid #fcd34d",
};

const valueBox = {
  backgroundColor: "#f0fdf4",
  border: "2px solid #10b981",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "24px",
};

const valueHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#065f46",
  marginBottom: "12px",
  textAlign: "center" as const,
};

const valueText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#047857",
  marginBottom: "16px",
};

const statHighlight = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#059669",
  marginBottom: "10px",
  fontWeight: "500",
};

const ctaSection = {
  textAlign: "center" as const,
  marginTop: "32px",
};

const button = {
  backgroundColor: "#dc2626",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  boxShadow: "0 4px 6px rgba(220, 38, 38, 0.2)",
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

export default WinbackDay14;
