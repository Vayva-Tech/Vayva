"use client";

import { DynamicResourceForm } from "@/components/resources/DynamicResourceForm";

export default function NewBlogPostPage() {
  return <DynamicResourceForm primaryObject="post" mode="create" />;
}
