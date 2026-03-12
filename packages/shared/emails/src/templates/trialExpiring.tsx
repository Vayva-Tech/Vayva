import * as React from "react";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";
import { IconBell } from "../components/icons";

export function TrialExpiringEmail(props: {
  storeName: string;
  daysLeft: number;
  billingUrl: string;
}) {
  return (
    <VayvaGlowLayout
      preheader={`${props.daysLeft} day${props.daysLeft === 1 ? "" : "s"} left on your trial`}
      headline={`Your trial ends in ${props.daysLeft} day${props.daysLeft === 1 ? "" : "s"}`}
      body={
        <>
          Your free trial for{" "}
          <strong style={{ color: "#E8FFF2" }}>{props.storeName}</strong> is
          ending soon. Upgrade now to keep your store live, retain your
          products, and continue accepting payments.
        </>
      }
      calloutIcon={<IconBell />}
      calloutTitle="What happens next"
      calloutText={
        <>
          After your trial ends, your storefront will be paused until you
          subscribe. Your data will be kept safe — nothing is deleted.
        </>
      }
      ctaText="Upgrade now"
      ctaUrl={props.billingUrl}
      footerNote={
        <>
          Plans start at just &#8358;20,000/month. See all plans on your billing
          page.
          <br />
          Need help? Contact{" "}
          <span style={{ color: "#E8FFF2" }}>support@vayva.ng</span>.
        </>
      }
    />
  );
}
