import * as React from "react";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";
import { IconAlertTriangle } from "../components/icons";

export function DisputeOpenedEmail(props: {
  refCode: string;
  reason: string;
  responseDeadline: string;
  disputeUrl: string;
}) {
  return (
    <VayvaGlowLayout
      preheader="Dispute opened"
      headline="A dispute has been opened on your order"
      body={
        <>
          A customer has opened a dispute for order{" "}
          <strong style={{ color: "#E8FFF2" }}>{props.refCode}</strong>. You
          must respond with evidence before the deadline to avoid an automatic
          resolution in the customer's favour.
        </>
      }
      calloutIcon={<IconAlertTriangle />}
      calloutTitle="Respond by"
      calloutText={
        <>
          <span style={{ color: "#F87171", fontWeight: 800 }}>
            {props.responseDeadline}
          </span>
          <br />
          <span style={{ fontSize: 12, color: "#94A3B8" }}>
            Reason: {props.reason}
          </span>
        </>
      }
      ctaText="Respond to dispute"
      ctaUrl={props.disputeUrl}
      footerNote={
        <>
          Provide clear evidence (screenshots, tracking info, communication
          logs) to support your case.
          <br />
          Need help? Contact{" "}
          <span style={{ color: "#E8FFF2" }}>support@vayva.ng</span>.
        </>
      }
    />
  );
}
