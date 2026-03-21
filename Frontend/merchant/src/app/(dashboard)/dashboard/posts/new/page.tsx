import { DynamicResourceForm } from "@/components/resources/DynamicResourceForm";

export default function NewPostPage() {
  return <DynamicResourceForm primaryObject="post" mode="create" />;
}
