import * as React from "react";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";
import { IconStar } from "../components/icons";

export function WelcomeEmail(props: {
  merchantName: string;
  storeName: string;
  dashboardUrl: string;
}) {
  return (
    <VayvaGlowLayout
      preheader="Welcome to Vayva"
      headline={`Welcome aboard, ${props.merchantName}`}
      body={
        <>
          Your store <strong style={{ color: "#E8FFF2" }}>{props.storeName}</strong> is live on Vayva.
          You can start adding products, customising your storefront, and accepting payments right away.
        </>
      }
      calloutIcon={<IconStar />}
      calloutTitle="What to do first"
      calloutText="Add your first product, set up your payment details, and share your store link with customers."
      ctaText="Go to your dashboard"
      ctaUrl={props.dashboardUrl}
      footerNote={
        <>
          Need help getting started? Reply to this email or visit our{" "}
          <span style={{ color: "#E8FFF2" }}>help centre</span>.
        </>
      }
    />
  );
}
