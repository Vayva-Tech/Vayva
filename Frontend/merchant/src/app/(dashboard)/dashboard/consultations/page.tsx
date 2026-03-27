// Redirects to bookings - no ErrorBoundary needed for redirect-only page
import { redirect } from "next/navigation";

export default function ConsultationsPage() {
  redirect("/dashboard/bookings");
}

