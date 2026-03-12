import React from "react";
import { HelpCenterClient } from "./HelpCenterClient";

export const metadata = {
  title: "Help Center | Vayva Support",
  description:
    "Find answers to common questions and learn how to use Vayva to grow your business.",
};

export default function HelpCenterPage(): React.JSX.Element {
  return <HelpCenterClient />;
}
