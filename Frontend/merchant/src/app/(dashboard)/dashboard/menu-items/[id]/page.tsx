"use client";
import { ResourceEditPage } from "@/components/resources/ResourceEditPage";

export default function Page() {
  return (
    <ResourceEditPage resourceBasePath="menu-items" primaryObject="menu_item" />
  );
}
