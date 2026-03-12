"use client";

import React, { useState } from "react";
import { logger } from "@vayva/shared";
import { Button, Input, Label } from "@vayva/ui";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
}

interface CustomerFormProps {
  initialData?: Customer;
  onSuccess: () => void;
}

interface CustomerUpdateResponse {
  success: boolean;
  error?: string;
}

export const CustomerForm = ({ initialData, onSuccess }: CustomerFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    notes: initialData?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = initialData
        ? `/api/customers/${initialData.id}`
        : "/api/customers";
      const method = initialData ? "PATCH" : "POST";

      const res = await apiJson<CustomerUpdateResponse>(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (res.success) {
        onSuccess();
        router.refresh();
      }
    } catch (error: unknown) {
      logger.error("Failed to save customer", { error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            placeholder="John"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            placeholder="Doe"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="john@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+234..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Internal reference..."
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading
          ? "Saving..."
          : initialData
            ? "Update Customer"
            : "Create Customer"}
      </Button>
    </form>
  );
};
