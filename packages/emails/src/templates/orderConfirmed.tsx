import * as React from "react";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";
import { IconReceipt } from "../components/icons";

export function OrderConfirmedEmail(props: { refCode: string; orderUrl: string }) {
  return (
    <VayvaGlowLayout
      preheader="Order confirmed"
      headline="Order confirmed"
      body={<>Thanks for your order. We’ve received it and will keep you updated as it progresses.</>}
      calloutIcon={<IconReceipt />}
      calloutTitle="Order reference"
      calloutText={<span style={{ color: "#E8FFF2", fontWeight: 800 }}>{props.refCode}</span>}
      ctaText="View order"
      ctaUrl={props.orderUrl}
    />
  );
}
