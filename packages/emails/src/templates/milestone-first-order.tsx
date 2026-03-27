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

interface MilestoneFirstOrderProps {
  merchantName?: string;
  storeName?: string;
  orderNumber?: string;
  orderAmount?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vayva.ng";

export const MilestoneFirstOrder = ({
  merchantName = "there",
  storeName = "your store",
  orderNumber = "#001",
  orderAmount = 0,
}: MilestoneFirstOrderProps) => {
  return (
    <Html>
      <Head />
      <Preview>🎉 Congratulations on your first AI-powered order!</Preview>
      <VayvaGlowLayout>
        <Body style={main}>
          <Container style={container}>
            <Heading style={heading}>🎉 First Order Celebration!</Heading>
            
            <Text style={paragraph}>
              Hi {merchantName},
            </Text>

            <Text style={paragraph}>
              Big news! Your AI just closed its first deal. This is a huge milestone for your business!
            </Text>

            <Section style={celebrationBox}>
              <Text style={celebrationHeading}>
                🚀 Your First AI Order
              </Text>
              
              <Text style={orderDetail}>
                <strong>Order:</strong> {orderNumber}
              </Text>
              <Text style={orderDetail}>
                <strong>Amount:</strong> ₦{orderAmount?.toLocaleString()}
              </Text>
              <Text style={orderDetail}>
                <strong>Status:</strong> ✅ Completed by AI
              </Text>

              <Text style={successText}>
                This is just the beginning! Merchants who reach their first AI order typically see:
              </Text>

              <Text style={statItem}>
                📈 <strong>3x more orders</strong> captured automatically
              </Text>
              <Text style={statItem}>
                ⏰ <strong>15+ hours saved</strong> per week on customer service
              </Text>
              <Text style={statItem}>
                💰 <strong>65% higher revenue</strong> within 30 days
              </Text>
            </Section>

            <Section style={nextStepsBox}>
              <Text style={nextStepsHeading}>
                What's Next?
              </Text>
              
              <Text style={stepItem}>
                1️⃣ Check your dashboard to see the order details
              </Text>
              <Text style={stepItem}>
                2️⃣ Share your success story with us
              </Text>
              <Text style={stepItem}>
                3️⃣ Watch as your AI handles more orders 24/7
              </Text>

              <Button 
                style={button} 
                href={`${baseUrl}/dashboard/orders/${orderNumber.replace("#", "")}`}
              >
                View Order Details
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Congratulations again! We're excited to be part of your growth journey.
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

const celebrationBox = {
  backgroundColor: "#fef3c7",
  border: "3px solid #f59e0b",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "24px",
};

const celebrationHeading = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#92400e",
  marginBottom: "16px",
  textAlign: "center" as const,
};

const orderDetail = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#78350f",
  marginBottom: "8px",
};

const successText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#78350f",
  marginTop: "16px",
  marginBottom: "12px",
};

const statItem = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#78350f",
  marginBottom: "8px",
  paddingLeft: "8px",
};

const nextStepsBox = {
  backgroundColor: "#f0fdf4",
  border: "2px solid #10b981",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "24px",
};

const nextStepsHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#065f46",
  marginBottom: "16px",
  textAlign: "center" as const,
};

const stepItem = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#047857",
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

export default MilestoneFirstOrder;
