import { DynamicResourceForm } from "@/components/resources/DynamicResourceForm";

export default function NewEventPage() {
  return <DynamicResourceForm primaryObject="event" mode="create" />;
}
