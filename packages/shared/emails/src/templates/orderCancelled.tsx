import * as React from "react";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";
import { IconX } from "../components/icons";

export function OrderCancelledEmail(props: {
  refCode: string;
  reason?: string;
  orderUrl: string;
}) {
  return (
    <VayvaGlowLayout
      preheader="Order cancelled"
      headline="Your order has been cancelled"
      body={
        <>
          Order <strong style={{ color: "#E8FFF2" }}>{props.refCode}</strong>{" "}
          has been cancelled.
          {props.reason && (
            <>
              {" "}
              Reason: <em>{props.reason}</em>.
            </>
          )}{" "}
          If a payment was made, a refund will be processed automatically.
        </>
      }
      calloutIcon={<IconX />}
      calloutTitle="Order reference"
      calloutText={
        <span style={{ color: "#E8FFF2", fontWeight: 800 }}>
          {props.refCode}
        </span>
      }
      ctaText="View order details"
      ctaUrl={props.orderUrl}
      footerNote={
        <>
          Think this was a mistake? Reply to this email or contact{" "}
          <span style={{ color: "#E8FFF2" }}>support@vayva.ng</span>.
        </>
      }
    />
  );
}
