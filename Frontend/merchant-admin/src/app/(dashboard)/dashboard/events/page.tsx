import { Metadata } from "next";
import { EventsList } from "@/components/events/EventsList";

export const metadata: Metadata = {
  title: "Events & Ticketing | Vayva",
  description: "Manage events and ticket sales",
};

export default function EventsDashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <EventsList />
    </div>
  );
}
