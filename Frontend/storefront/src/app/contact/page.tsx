import React from "react";
import { ContactClient } from "./ContactClient";

async function getContactDetails() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    if (!apiBase) return null;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(`${apiBase}/public/stores/policies`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: controller.signal,
    });

    clearTimeout(id);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Failed to fetch contact details:", e);
    return null;
  }
  return null;
}

export default async function ContactPage(): Promise<React.JSX.Element> {
  const data = await getContactDetails();
  const contact = data?.policyContact;

  return <ContactClient contact={contact || null} />;
}
