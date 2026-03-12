"use client";

import React from "react";
import { StoreShell } from "@/components/StoreShell";
import { useStore } from "@/context/StoreContext";
import { useParams } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PolicyPage({
  params: _params,
}: any): React.JSX.Element {
  const { store } = useStore();
  const { slug } = useParams() as { slug: string };

  if (!store) return <></>;

  let title = "";
  let content = "";

  switch (slug) {
    case "about":
      title = "About Us";
      content =
        store.tagline || "Welcome to our store. We provide quality products.";
      break;
    case "contact":
      title = "Contact Us";
      content = `Email: ${store.contact?.email || "N/A"}\nPhone: ${store.contact?.phone || "N/A"}`;
      break;
    case "shipping":
      title = "Shipping Policy";
      content = store.policies?.shipping || "No shipping policy defined.";
      break;
    case "returns":
      title = "Returns Policy";
      content = store.policies?.returns || "No returns policy defined.";
      break;
    case "privacy":
      title = "Privacy Policy";
      content = store.policies?.privacy || "No privacy policy defined.";
      break;
    default:
      return (
        <StoreShell>
          <div className="py-20 text-center">
            <h1 className="text-2xl font-bold">Page Not Found</h1>
          </div>
        </StoreShell>
      );
  }

  return (
    <StoreShell>
      <div className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">{title}</h1>
        <div className="prose prose-lg whitespace-pre-wrap text-gray-600">
          {content}
        </div>
      </div>
    </StoreShell>
  );
}
