import * as React from "react";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";
import { IconMail } from "../components/icons";

export function MerchantInviteEmail(props: {
  storeName: string;
  inviterName: string;
  acceptUrl: string;
}) {
  return (
    <VayvaGlowLayout
      preheader="Team invite"
      headline={`You’re invited to join ${props.storeName}`}
      body={
        <>
          <strong style={{ color: "#E8FFF2" }}>{props.inviterName}</strong>{" "}
          invited you to collaborate in Vayva Merchant Admin. Your access will
          match the role assigned to you.
        </>
      }
      calloutIcon={<IconMail />}
      calloutTitle="What you’ll be able to do"
      calloutText="Manage products, orders, customers, and payouts — based on your permissions."
      ctaText="Accept invitation"
      ctaUrl={props.acceptUrl}
      footerNote={
        <>
          If you weren’t expecting this invite, you can safely ignore this
          email.
          <br />
          Need help? Reply here or contact{" "}
          <span style={{ color: "#E8FFF2" }}>support@vayva.ng</span>.
        </>
      }
    />
  );
}
