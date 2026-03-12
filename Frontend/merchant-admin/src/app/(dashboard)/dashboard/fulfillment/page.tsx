import { redirect } from "next/navigation";

export default function FulfillmentIndexPage() {
  redirect("/dashboard/fulfillment/shipments");
}
