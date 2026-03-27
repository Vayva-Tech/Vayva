// Redirects to bookings - no ErrorBoundary needed for redirect-only page
import { redirect } from "next/navigation";

export default function ClassesPage() {
  redirect("/dashboard/bookings");
}

