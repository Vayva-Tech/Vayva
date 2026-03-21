"use client";

import React, { useState } from "react";
import { logger } from "@vayva/shared";
import { Button, Icon, Input, Select } from "@vayva/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";

export default function SubmitTemplatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "retail",
    plan: "growth",
    description: "",
    file: null as File | null,
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await apiJson<{ success: boolean }>("/api/designer/templates/submit", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      toast.success("Template submitted for review!");

      // Simulate AI Review Delay for UX
      setTimeout(() => {
        router.push("/designer");
      }, 1000);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[TEMPLATE_SUBMIT_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      setError(_errMsg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white/40 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-text-green-500 p-8 text-white">
          <h1 className="text-2xl font-bold">Submit New Template</h1>
          <p className="text-gray-400 mt-2">Step {step} of 3</p>
        </div>

        {/* Body */}
        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2">
                Basic Info
              </h2>
              <div>
                <label
                  htmlFor="template-name"
                  className="block text-sm font-bold text-gray-500 mb-2"
                >
                  Template Name
                </label>
                <Input id="template-name"
                  type="text"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border-gray-100 rounded-lg p-3 text-sm focus:ring-black focus:border-black"
                  placeholder="Modern Retail V1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-bold text-gray-500 mb-2"
                  >
                    Category
                  </label>
                  <Select
                    id="category"
                    className="w-full border-gray-100 rounded-lg p-3 text-sm"
                    value={formData.category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="retail">Retail</option>
                    <option value="food">Food</option>
                    <option value="services">Services</option>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="plan-level"
                    className="block text-sm font-bold text-gray-500 mb-2"
                  >
                    Plan Level
                  </label>
                  <Select
                    id="plan-level"
                    className="w-full border-gray-100 rounded-lg p-3 text-sm"
                    value={formData.plan}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFormData({ ...formData, plan: e.target.value })
                    }
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="pro">Pro</option>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!formData.name}
                className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-text-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2">
                Upload Bundle
              </h2>
              <div className="border-2 border-dashed border-gray-100 rounded-xl p-12 text-center hover:border-black transition-colors cursor-pointer bg-white/40">
                <Icon
                  name="CloudUpload"
                  size={48}
                  className="mx-auto text-gray-400 mb-4"
                />
                <p className="font-bold text-gray-900">
                  Drag & drop your template bundle
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  .zip files only (max 50mb)
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex gap-3 text-yellow-800 text-sm">
                <Icon name="TriangleAlert" size={20} className="shrink-0" />
                <p>
                  Our AI will automatically scan your code for security
                  vulnerabilities and performance issues. Make sure to follow
                  the{" "}
                  <Link
                    href="/dashboard/templates"
                    className="underline font-bold"
                  >
                    Vayva Theme Guidelines
                  </Link>
                  .
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/40 text-gray-900 py-3 rounded-xl font-bold"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-text-green-500"
                >
                  {loading ? "Analyzing..." : "Submit for Review"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
