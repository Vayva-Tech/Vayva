"use client";

import { useRouter } from "next/navigation";
import { RealEstateForm } from "@/components/properties/RealEstateForm";

export default function NewPropertyPage() {
  const router = useRouter();

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          List New Property
        </h1>
        <p className="text-text-tertiary">
          Add a new room, apartment, or villa to start accepting bookings.
        </p>
      </div>

      <RealEstateForm
        onSuccess={() => {
          router.push("/dashboard/properties");
          router.refresh();
        }}
      />
    </div>
  );
}
