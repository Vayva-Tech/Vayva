import React from "react";
import { SystemStatusClient } from "./SystemStatusClient";

export const metadata = {
  title: "System Status | Vayva Platform Reliability",
  description:
    "Real-time status of Vayva platform services and infrastructure.",
};

export default function SystemStatusPage(): React.JSX.Element {
  return <SystemStatusClient />;
}
