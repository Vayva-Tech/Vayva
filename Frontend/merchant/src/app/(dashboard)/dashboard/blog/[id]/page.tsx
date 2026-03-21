// @ts-nocheck
"use client";

import { useParams } from "next/navigation";
import { DynamicResourceForm } from "@/components/resources/DynamicResourceForm";

export default function EditBlogPostPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <DynamicResourceForm primaryObject="post" mode="edit" resourceId={id} />
  );
}
