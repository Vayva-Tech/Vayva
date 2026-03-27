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

interface TrialDay1Props {
  merchantName?: string;
  storeName?: string;
  daysRemaining?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vayva.ng";

export const TrialDay1 = ({
  merchantName = "there",
  storeName = "your store",
  daysRemaining = 1,
}: TrialDay1Props) => {
  return (
    <Html>
      <Head />
      <Preview>Last chance! Your trial ends tomorrow</Preview>
      <VayvaGlowLayout>
        <Body style={main}>
          <Container style={container}>
            <Heading style={heading}>⏰ Last Chance — Trial Ends Tomorrow!</Heading>
            
            <Text style={paragraph}>
              Hi {merchantName},
            </Text>

            <Text style={urgentText}>
              This is it! Your Vayva trial expires in <strong style="color: #dc2626;">{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</strong>.
            </Text>

            <Section style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <Text style="font-size: 16px; font-weight: 600; color: #92400e; margin-bottom: 16px; text-align: center;">
                🚨 Don't Lose Your Progress!
              </Text>
              
              <Text style="font-size: 14px; line-height: 22px; color: #78350f; margin-bottom: 12px;">
                After tomorrow, your AI features will be paused and you'll lose:
              </Text>

              <Text style="font-size: 14px; line-height: 22px; color: #b91c1c; margin-bottom: 8px; font-weight: 600;">
                ❌ 24/7 AI customer support
              </Text>
              <Text style="font-size: 14px; line-height: 22px; color: #b91c1c; margin-bottom: 8px; font-weight: 600;">
                ❌ Automatic order processing
              </Text>
              <Text style="font-size: 14px; line-height: 22px; color: #b91c1c; margin-bottom: 8px; font-weight: 600;">
                ❌ Revenue insights and analytics
              </Text>
              <Text style="font-size: 14px; line-height: 22px; color: #b91c1c; margin-bottom: 0px; font-weight: 600;">
                ❌ All your configured automations
              </Text>
            </Section>

            <Section style="text-align: center; margin-top: 32px;">
              <Text style="font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 20px;">
                Upgrade now to keep everything running smoothly
              </Text>
              
              <Button 
                style={{
                  backgroundColor: "#dc2626",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "18px",
                  fontWeight: "700",
                  textDecoration: "none",
                  textAlign: "center" as const,
                  display: "inline-block",
                  padding: "16px 40px",
                  boxShadow: "0 6px 8px rgba(220, 38, 38, 0.3)",
                }} 
                href={`${baseUrl}/dashboard/settings/billing`}
              >
                YES! Keep My Access →
              </Button>
            </Section>

            <Section style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; margin-top: 32px;">
              <Text style="font-size: 14px; color: #166534; margin-bottom: 12px;">
                <strong>💡 Special Offer:</strong> Upgrade today and get your first month at 20% off!
              </Text>
              <Text style="font-size: 13px; color: #15803d;">
                Use code: <strong style="background-color: #dcfce7; padding: 4px 8px; border-radius: 4px;">TRIAL20</strong> at checkout
              </Text>
            </Section>

            <Hr style="border-color: #e5e7eb; margin: 32px 0;" />

            <Text style="font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 8px;">
              Questions? We're here to help. Contact us at{" "}
              <a href="mailto:support@vayva.ng" style="color: #10b981; text-decoration: underline;">
                support@vayva.ng
              </a>
            </Text>

            <Text style="font-size: 14px; color: #9ca3af; text-align: center;">
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

const urgentText = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#dc2626",
  marginBottom: "24px",
  backgroundColor: "#fef2f2",
  padding: "16px",
  borderRadius: "8px",
  border: "1px solid #fecaca",
};

export default TrialDay1;
