"use client";

import React, { useState } from "react";
import { logger } from "@vayva/shared";
import { Button, Input, Label, Icon, Textarea } from "@vayva/ui";
import { useRouter } from "next/navigation";

interface CustomerFormProps {
  initialData?: CustomerInitialData;
  onSuccess: () => void;
}

interface CustomerInitialData {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

import { apiJson } from "@/lib/api-client-shared";

interface CustomerUpdateResponse {
  success: boolean;
  data?: any;
}

export function CustomerForm({ initialData, onSuccess }: CustomerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Split name if initialData exists
  const initialFirstName = initialData?.name?.split(" ")[0] || "";
  const initialLastName =
    initialData?.name?.split(" ").slice(1).join(" ") || "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        firstName: formData.get("firstName")?.toString().trim() || "",
        lastName: formData.get("lastName")?.toString().trim() || "",
        email: formData.get("email")?.toString().trim().toLowerCase() || "",
        phone: formData.get("phone")?.toString().trim() || "",
        notes: formData.get("notes")?.toString().trim() || "",
      };

      if (!data.firstName || !data.lastName) {
        setError("First and last name are required");
        return;
      }

      const url = initialData
        ? `/api/customers/${initialData.id}`
        : "/api/customers";
      const method = initialData ? "PUT" : "POST";

      await apiJson<CustomerUpdateResponse>(url, {
        method,
        body: JSON.stringify(data),
      });

      router.refresh();
      onSuccess();
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[CUSTOMER_FORM_SUBMIT_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      setError(_errMsg || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={initialFirstName}
            placeholder="e.g. Chioma"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={initialLastName}
            placeholder="e.g. Okeke"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={initialData?.email ?? ""}
          placeholder="customer@example.com"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initialData?.phone ?? ""}
          placeholder="+234 ..."
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Internal Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          className="w-full min-h-[100px]"
          placeholder="Add any private notes about this customer..."
          defaultValue={initialData?.notes ?? ""}
          disabled={isLoading}
        />
      </div>

      <div className="pt-4 flex gap-3">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? (
            <Icon name="Loader2" className="animate-spin mr-2" size={16} />
          ) : null}
          {initialData ? "Update Customer" : "Create Customer"}
        </Button>
      </div>
    </form>
  );
}
