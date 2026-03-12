import * as React from "react";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";
import { IconStar } from "../components/icons";

export function SubscriptionActivatedEmail(props: {
  planName: string;
  storeName: string;
  billingUrl: string;
}) {
  return (
    <VayvaGlowLayout
      preheader="Subscription active"
      headline={`You're on the ${props.planName} plan`}
      body={
        <>
          Your subscription for <strong style={{ color: "#E8FFF2" }}>{props.storeName}</strong> is now active.
          You have full access to all {props.planName} features. Your next billing date is in 30 days.
        </>
      }
      calloutIcon={<IconStar />}
      calloutTitle="Your plan"
      calloutText={<span style={{ color: "#E8FFF2", fontWeight: 800 }}>{props.planName}</span>}
      ctaText="Manage subscription"
      ctaUrl={props.billingUrl}
      footerNote={
        <>
          You can change or cancel your plan anytime from your billing settings.
          <br />
          Questions? Contact <span style={{ color: "#E8FFF2" }}>support@vayva.ng</span>.
        </>
      }
    />
  );
}
