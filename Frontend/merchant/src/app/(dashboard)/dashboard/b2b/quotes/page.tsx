import { Metadata } from "next";
import { QuotesList } from "@/components/b2b/QuotesList";

export const metadata: Metadata = {
  title: "B2B Quotes | Vayva",
  description: "Manage B2B quotes and wholesale pricing",
};

export default function B2BQuotesPage() {
  return (
    <div className="container mx-auto py-6">
      <QuotesList />
    </div>
  );
}
