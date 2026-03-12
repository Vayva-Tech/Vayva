import * as React from "react";
import { VayvaGlowLayout } from "../components/VayvaGlowLayout";
import { IconLock } from "../components/icons";

export function PasswordResetEmail(props: { resetUrl: string; minutes: number }) {
  return (
    <VayvaGlowLayout
      preheader="Security"
      headline="Reset your password"
      body={<>We received a request to reset your password for Vayva Merchant Admin.</>}
      calloutIcon={<IconLock />}
      calloutTitle="This link expires soon"
      calloutText={
        <>
          For your security, this reset link expires in {" "}
          <strong style={{ color: "#E8FFF2" }}>{props.minutes} minutes</strong>.
        </>
      }
      ctaText="Reset password"
      ctaUrl={props.resetUrl}
      footerNote={
        <>
          If you didn’t request a password reset, you can ignore this email — your password won’t change.
          <br />
          Need help? Contact <span style={{ color: "#E8FFF2" }}>support@vayva.ng</span>.
        </>
      }
    />
  );
}
