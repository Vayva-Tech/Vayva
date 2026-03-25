"use client";

import { useParams } from "next/navigation";
import { DynamicResourceForm } from "@/components/resources/DynamicResourceForm";

export default function EditBlogPostPage() {
  const params = useParams();
  const rawId = params?.id;
  const id =
    typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";

  if (!id) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Missing post id.
      </div>
    );
  }

  return (
    <DynamicResourceForm primaryObject="post" mode="edit" resourceId={id} />
  );
}
