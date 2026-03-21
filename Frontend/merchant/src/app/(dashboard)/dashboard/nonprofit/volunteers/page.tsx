import { Metadata } from "next";
import { VolunteersList } from "@/components/nonprofit/VolunteersList";

export const metadata: Metadata = {
  title: "Volunteers | Vayva",
  description: "Manage nonprofit volunteers and shifts",
};

export default function VolunteersPage() {
  return (
    <div className="container mx-auto py-6">
      <VolunteersList />
    </div>
  );
}
