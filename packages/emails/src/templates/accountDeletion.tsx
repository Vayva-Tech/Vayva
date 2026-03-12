import * as React from "react";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";
// @ts-expect-error
import { IconBell, IconCalendar, IconXCircle } from "../components/icons";

export function AccountDeletionScheduledEmail(props: {
  storeName: string;
  scheduledDate: string;
  cancelUrl: string;
}) {
  return (
    <VayvaGlowLayout
      preheader="Account scheduled for deletion in 7 days"
      headline="Account deletion scheduled"
      body={
        <>
          Your store <strong style={{ color: "#E8FFF2" }}>{props.storeName}</strong> has been scheduled for deletion.
          <br /><br />
          All data will be permanently deleted on <strong style={{ color: "#E8FFF2" }}>{props.scheduledDate}</strong>. 
          After this date, you will lose access to your products, orders, and customer data.
        </>
      }
      calloutIcon={<IconCalendar />}
      calloutTitle="What happens next"
      calloutText={
        <>
          Your store will remain accessible until {props.scheduledDate}. After that, all data will be permanently deleted.
          You can cancel this request anytime before the deletion date.
        </>
      }
      ctaText="Cancel deletion"
      ctaUrl={props.cancelUrl}
      footerNote={
        <>
          Didn't request this? Contact <span style={{ color: "#E8FFF2" }}>support@vayva.ng</span> immediately.
          <br />
          This action was initiated by the account owner.
        </>
      }
    />
  );
}

export function AccountDeletionCompletedEmail(props: {
  storeName: string;
}) {
  return (
    <VayvaGlowLayout
      preheader="Your Vayva account has been deleted"
      headline="Account deleted"
      body={
        <>
          Your store <strong style={{ color: "#E8FFF2" }}>{props.storeName}</strong> has been permanently deleted.
          <br /><br />
          All associated data including products, orders, customers, and settings have been removed from our systems.
        </>
      }
      calloutIcon={<IconXCircle />}
      calloutTitle="What's gone"
      calloutText={
        <>
          Your storefront, product catalog, order history, customer data, and all associated files have been permanently deleted.
        </>
      }
      ctaText="Create new store"
      ctaUrl="https://vayva.ng/signup"
      footerNote={
        <>
          Need help? Contact <span style={{ color: "#E8FFF2" }}>support@vayva.ng</span>.
          <br />
          Thank you for using Vayva.
        </>
      }
    />
  );
}
