import * as React from "react";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";
import { IconShield } from "../components/icons";

export function KycStatusEmail(props: {
  storeName: string;
  status: "VERIFIED" | "REJECTED";
  reason?: string;
  dashboardUrl: string;
}) {
  const isApproved = props.status === "VERIFIED";

  return (
    <VayvaGlowLayout
      preheader={isApproved ? "KYC approved" : "KYC update required"}
      headline={
        isApproved
          ? "Your identity has been verified"
          : "Your KYC submission needs attention"
      }
      body={
        isApproved ? (
          <>
            Great news! The identity verification for{" "}
            <strong style={{ color: "#E8FFF2" }}>{props.storeName}</strong> has
            been approved. You can now receive payouts and access all platform
            features.
          </>
        ) : (
          <>
            The identity verification for{" "}
            <strong style={{ color: "#E8FFF2" }}>{props.storeName}</strong>{" "}
            could not be completed.
            {props.reason && (
              <>
                {" "}
                Reason: <em>{props.reason}</em>.
              </>
            )}{" "}
            Please update your information and resubmit.
          </>
        )
      }
      calloutIcon={<IconShield />}
      calloutTitle="Verification status"
      calloutText={
        <span
          style={{
            color: isApproved ? "#22C55E" : "#F87171",
            fontWeight: 800,
            textTransform: "uppercase" as const,
          }}
        >
          {isApproved ? "Verified" : "Action required"}
        </span>
      }
      ctaText={isApproved ? "Go to dashboard" : "Update KYC"}
      ctaUrl={props.dashboardUrl}
      footerNote={
        <>
          {isApproved
            ? "Your verification is complete. No further action is needed."
            : "If you believe this is an error, please contact support."}
          <br />
          Need help? Contact{" "}
          <span style={{ color: "#E8FFF2" }}>support@vayva.ng</span>.
        </>
      }
    />
  );
}
