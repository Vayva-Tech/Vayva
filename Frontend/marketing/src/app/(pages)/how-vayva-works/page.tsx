import { redirect } from "next/navigation";

export const metadata = {
  title: "How Vayva Works",
  description: "Learn how Vayva works - now part of our features page.",
};

export default function HowItWorksPage(): void {
  redirect("/features");
}
