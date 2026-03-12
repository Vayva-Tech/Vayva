import React from "react";
import { NewAboutClient } from "@/components/marketing/NewAboutClient";

export const metadata = {
  title: "About | Vayva",
  description: "Building the future of African commerce. From side hustle to scalable business.",
};

export default function AboutPage(): React.JSX.Element {
  return <NewAboutClient />;
}
