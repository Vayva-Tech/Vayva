"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  PaperPlaneRight as Send,
  Lifebuoy as LifeBuoy,
  Spinner as Loader2,
  WarningCircle as AlertCircle,
} from "@phosphor-icons/react/ssr";
import { logger } from "@vayva/shared";
import { Button, Input, Select, Textarea } from "@vayva/ui";

import { apiJson } from "@/lib/api-client-shared";

export default function CreateTicketPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    category: "TECHNICAL", // Default
    priority: "MEDIUM",
    description: "",
  });

  const categories = [
    { value: "TECHNICAL", label: "Technical Issue" },
    { value: "BILLING", label: "Billing & Subscription" },
    { value: "ACCOUNT", label: "Account Management" },
    { value: "FEATURE", label: "Feature Request" },
    { value: "OTHER", label: "Other Inquiry" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiJson<{ success: boolean }>("/support/create", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      toast.success(
        "Ticket created successfully! We sent you a confirmation email.",
      );
      setFormData({
        subject: "",
        category: "TECHNICAL",
        priority: "MEDIUM",
        description: "",
      });
      // Redirect to list page if it existed, for now stay here or redirect to dashboard
      // router.push("/dashboard/support");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[CREATE_TICKET_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to create ticket");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-green-500/10 rounded-xl text-green-600">
          <LifeBuoy size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Contact Support
          </h1>
          <p className="text-gray-500">
            We're here to help. Tell us what's wrong.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white  rounded-xl shadow-sm border border-gray-200 p-8 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Category
            </label>
            <Select
              title="Category"
              value={formData.category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, category: e.target?.value })
              }
              className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:bg-white/80 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Priority
            </label>
            <Select
              title="Priority"
              value={formData.priority}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, priority: e.target?.value })
              }
              className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:bg-white/80 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
            >
              <option value="LOW">Low - General Question</option>
              <option value="MEDIUM">Medium - Feature Issue</option>
              <option value="HIGH">High - Urgent Problem</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Subject
          </label>
          <Input type="text"
            placeholder="e.g. Cannot process payments"
            required
            value={formData.subject}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, subject: e.target?.value })
            }
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Description
          </label>
          <Textarea
            rows={6}
            placeholder="Please describe the issue in detail..."
            required
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData({ ...formData, description: e.target?.value })
            }
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none transition-all resize-y"
          />
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <AlertCircle size={10} />
            Provide as much context as possible for faster resolution.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-semibold shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Ticket
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
