import React from "react";

import PaystackTestClient from "./PaystackTestClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paystack Test | Vayva",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaystackTestPage(): React.JSX.Element {
  return (
    <div>
      <PaystackTestClient />
    </div>
  );
}
