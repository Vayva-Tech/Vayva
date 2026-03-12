import * as React from "react";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";
import { IconRefund } from "../components/icons";

export function RefundRequestedEmail(props: {
  refCode: string;
  customerName: string;
  amount: string;
  currency: string;
  reason?: string;
  orderUrl: string;
}) {
  return (
    <VayvaGlowLayout
      preheader="Refund requested"
      headline="A customer has requested a refund"
      body={
        <>
          <strong style={{ color: "#E8FFF2" }}>{props.customerName}</strong> has requested a refund of{" "}
          <strong style={{ color: "#E8FFF2" }}>
            {props.currency === "NGN" ? "\u20A6" : props.currency}{props.amount}
          </strong>{" "}
          for order <strong style={{ color: "#E8FFF2" }}>{props.refCode}</strong>.
          {props.reason && (
            <>
              {" "}Reason: <em>{props.reason}</em>.
            </>
          )}
        </>
      }
      calloutIcon={<IconRefund />}
      calloutTitle="Action required"
      calloutText="Review the request and approve or decline the refund from your dashboard."
      ctaText="Review refund request"
      ctaUrl={props.orderUrl}
      footerNote={
        <>
          Responding quickly helps maintain customer trust and your store rating.
          <br />
          Need help? Contact <span style={{ color: "#E8FFF2" }}>support@vayva.ng</span>.
        </>
      }
    />
  );
}
