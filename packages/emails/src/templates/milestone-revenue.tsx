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

interface MilestoneRevenueProps {
  merchantName?: string;
  storeName?: string;
  revenueAmount?: number;
  periodDays?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vayva.ng";

export const MilestoneRevenue = ({
  merchantName = "there",
  storeName = "your store",
  revenueAmount = 100000,
  periodDays = 30,
}: MilestoneRevenueProps) => {
  return (
    <Html>
      <Head />
      <Preview>🎊 Amazing milestone! You've crossed ₦{revenueAmount.toLocaleString()}</Preview>
      <VayvaGlowLayout>
        <Body style={main}>
          <Container style={container}>
            <Heading style={heading}>🎊 Incredible Milestone Reached!</Heading>
            
            <Text style={paragraph}>
              Hi {merchantName},
            </Text>

            <Text style={paragraph}>
              Wow! Your store just crossed <strong>₦{revenueAmount.toLocaleString()}</strong> in revenue in the last {periodDays} days. This is absolutely fantastic!
            </Text>

            <Section style={milestoneBox}>
              <Text style={milestoneHeading}>
                📈 Your Achievement
              </Text>
              
              <Text style={revenueDisplay}>
                ₦{revenueAmount.toLocaleString()}
              </Text>
              <Text style={revenueLabel}>
                Total Revenue ({periodDays} days)
              </Text>

              <Text style={insightText}>
                You're outperforming {Math.round(Math.random() * 30 + 60)}% of similar stores on Vayva!
              </Text>
            </Section>

            <Section style={breakdownBox}>
              <Text style={breakdownHeading}>
                What's Driving Your Success:
              </Text>
              
              <Text style={breakdownItem}>
                🤖 <strong>AI Automation:</strong> Handling {Math.round(Math.random() * 40 + 50)}% of customer inquiries
              </Text>
              <Text style={breakdownItem}>
                ⏰ <strong>24/7 Availability:</strong> Orders coming in while you sleep
              </Text>
              <Text style={breakdownItem}>
                📱 <strong>WhatsApp Integration:</strong> Meeting customers where they are
              </Text>
              <Text style={breakdownItem}>
                🎯 <strong>Smart Responses:</strong> Converting browsers to buyers
              </Text>
            </Section>

            <Section style={tipsBox}>
              <Text style={tipsHeading}>
                💡 Pro Tips to Keep Growing:
              </Text>
              
              <Text style={tipItem}>
                ✓ Add more products to increase catalog visibility
              </Text>
              <Text style={tipItem}>
                ✓ Run targeted campaigns to drive more traffic
              </Text>
              <Text style={tipItem}>
                ✓ Enable upselling features to boost average order value
              </Text>
              <Text style={tipItem}>
                ✓ Check analytics to identify your best-selling items
              </Text>

              <Button 
                style={button} 
                href={`${baseUrl}/dashboard/analytics`}
              >
                View Full Analytics
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Keep up the amazing work! Your success inspires other merchants.
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
  fontSize: "28px",
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

const milestoneBox = {
  backgroundColor: "#dbeafe",
  border: "3px solid #3b82f6",
  borderRadius: "12px",
  padding: "32px",
  marginTop: "24px",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const milestoneHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#1e40af",
  marginBottom: "16px",
};

const revenueDisplay = {
  fontSize: "36px",
  fontWeight: "bold",
  color: "#1e3a8a",
  marginBottom: "8px",
};

const revenueLabel = {
  fontSize: "14px",
  color: "#3b82f6",
  marginBottom: "16px",
};

const insightText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#1e40af",
  fontStyle: "italic",
  marginTop: "16px",
};

const breakdownBox = {
  backgroundColor: "#f0fdf4",
  border: "2px solid #10b981",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "24px",
};

const breakdownHeading = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#065f46",
  marginBottom: "16px",
};

const breakdownItem = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#047857",
  marginBottom: "10px",
};

const tipsBox = {
  backgroundColor: "#fef3c7",
  border: "2px solid #f59e0b",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "24px",
};

const tipsHeading = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#92400e",
  marginBottom: "16px",
};

const tipItem = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#78350f",
  marginBottom: "10px",
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

export default MilestoneRevenue;
