import { redirect } from "next/navigation";

export const metadata = {
  title: "How Vayva Works",
  description: "Learn how Vayva works.",
};

export default function HowItWorksPage(): void {
  redirect("/");
}
