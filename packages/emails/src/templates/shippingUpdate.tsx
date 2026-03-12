import * as React from "react";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";
import { IconTruck } from "../components/icons";

export function ShippingUpdateEmail(props: {
  refCode: string;
  status: string;
  trackingUrl?: string;
  orderUrl: string;
}) {
  const statusLabel = props.status === "SHIPPED" ? "shipped" : props.status === "DELIVERED" ? "delivered" : "updated";

  return (
    <VayvaGlowLayout
      preheader={`Shipping ${statusLabel}`}
      headline={`Your order has been ${statusLabel}`}
      body={
        <>
          Order <strong style={{ color: "#E8FFF2" }}>{props.refCode}</strong> has been {statusLabel}.
          {props.trackingUrl && (
            <>
              {" "}You can track your delivery using the link below.
            </>
          )}
        </>
      }
      calloutIcon={<IconTruck />}
      calloutTitle="Shipping status"
      calloutText={
        <span style={{ color: "#E8FFF2", fontWeight: 800, textTransform: "uppercase" as const }}>
          {props.status}
        </span>
      }
      ctaText={props.trackingUrl ? "Track delivery" : "View order"}
      ctaUrl={props.trackingUrl || props.orderUrl}
      footerNote={
        <>
          Questions about your delivery? Reply to this email or contact{" "}
          <span style={{ color: "#E8FFF2" }}>support@vayva.ng</span>.
        </>
      }
    />
  );
}
