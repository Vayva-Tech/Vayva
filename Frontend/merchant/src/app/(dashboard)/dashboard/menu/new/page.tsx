import { redirect } from "next/navigation";

export default function NewMenuPage() {
  redirect("/dashboard/menu-items/new");
}

