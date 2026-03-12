import * as React from "react";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";
import { IconRefund } from "../components/icons";

export function RefundProcessedEmail(props: {
  refCode: string;
  amount: string;
  currency: string;
  orderUrl: string;
}) {
  return (
    <VayvaGlowLayout
      preheader="Refund processed"
      headline="Your refund has been processed"
      body={
        <>
          A refund of{" "}
          <strong style={{ color: "#E8FFF2" }}>
            {props.currency === "NGN" ? "\u20A6" : props.currency}
            {props.amount}
          </strong>{" "}
          for order{" "}
          <strong style={{ color: "#E8FFF2" }}>{props.refCode}</strong> has been
          processed. It may take 3–5 business days to appear in your account.
        </>
      }
      calloutIcon={<IconRefund />}
      calloutTitle="Refund amount"
      calloutText={
        <span style={{ color: "#E8FFF2", fontWeight: 800 }}>
          {props.currency === "NGN" ? "\u20A6" : props.currency}
          {props.amount}
        </span>
      }
      ctaText="View order"
      ctaUrl={props.orderUrl}
      footerNote={
        <>
          If you don't see the refund after 5 business days, contact{" "}
          <span style={{ color: "#E8FFF2" }}>support@vayva.ng</span>.
        </>
      }
    />
  );
}
