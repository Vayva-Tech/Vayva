import { Metadata } from "next";
import { CreditAccountsList } from "@/components/b2b/CreditAccountsList";

export const metadata: Metadata = {
  title: "Credit Accounts | Vayva",
  description: "Manage B2B customer credit accounts",
};

export default function CreditAccountsPage() {
  return (
    <div className="container mx-auto py-6">
      <CreditAccountsList />
    </div>
  );
}
