import * as React from "react";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";
import { IconCheck } from "../components/icons";

export function PaymentReceivedEmail(props: {
  refCode: string;
  paymentReference: string;
  receiptUrl: string;
}) {
  return (
    <VayvaGlowLayout
      preheader="Payment successful"
      headline="Payment received"
      body={
        <>
          Your payment has been confirmed. We’ll continue processing your order.
        </>
      }
      calloutIcon={<IconCheck />}
      calloutTitle="Payment reference"
      calloutText={
        <span style={{ color: "#E8FFF2", fontWeight: 800 }}>
          {props.paymentReference}
        </span>
      }
      ctaText="See receipt"
      ctaUrl={props.receiptUrl}
    />
  );
}
