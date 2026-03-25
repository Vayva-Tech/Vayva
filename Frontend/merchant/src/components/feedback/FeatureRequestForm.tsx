"use client";

import React, { useState, useRef, FormEvent } from "react";
import { Button, Input, Textarea, Select } from "@vayva/ui";
import { Lightbulb, Paperclip, X, Check, PaperPlaneTilt as Send, WarningCircle as AlertCircle } from "@phosphor-icons/react";
import { apiJson } from "@/lib/api-client-shared";

interface FeatureRequestFormProps {
  triggerLabel?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

/**
 * Enhanced feature request form for merchants
 * Allows both general platform requests and personal business/dashboard requests
 */
export function FeatureRequestForm({ 
  triggerLabel = "Request a Feature", 
  onClose,
  onSuccess 
}: FeatureRequestFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [requestType, setRequestType] = useState<"platform" | "personal">("platform");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requestTypes = [
    { value: "platform", label: "Platform Feature", description: "Suggest improvements to Vayva as a whole" },
    { value: "personal", label: "Business Need", description: "Request features for your specific dashboard/business" }
  ];

  const priorities = [
    { value: "low", label: "Low Priority", description: "Nice to have" },
    { value: "medium", label: "Medium Priority", description: "Would improve workflow" },
    { value: "high", label: "High Priority", description: "Critical for business operations" }
  ];

  const handleOpen = () => {
    setIsOpen(true);
    setIsSuccess(false);
    setError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setRequestType("platform");
    setTitle("");
    setDescription("");
    setPriority("medium");
    setAttachment(null);
    setError(null);
    onClose?.();
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setError("Attachment must be under 5MB");
      return;
    }
    setAttachment(file || null);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError("Please provide a title and description");
      return;
    }

    if (description.trim().length < 20) {
      setError("Please provide at least 20 characters of detail");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload attachment if provided
      let attachmentUrl: string | undefined;
      if (attachment) {
        const formData = new FormData();
        formData.append("file", attachment);
        
        const uploadRes = await fetch("/api/upload/feature-request-attachment", {
          method: "POST",
          body: formData,
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          attachmentUrl = uploadData.url;
        }
      }

      // Submit feature request
      await apiJson("/api/merchant/feature-request", {
        method: "POST",
        body: JSON.stringify({
          requestType,
          title: title.trim(),
          description: description.trim(),
          priority,
          attachmentUrl,
          metadata: {
            url: window.location.pathname,
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
          },
        }),
      });

      setIsSuccess(true);
      onSuccess?.();
      
      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feature request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="flex items-center gap-2"
      >
        <Lightbulb size={16} />
        {triggerLabel}
      </Button>
    );
  }

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Request Submitted!</h3>
          <p className="text-sm text-gray-500 mb-6">
            Thank you for your suggestion. Our team will review it and get back to you soon.
          </p>
          <Button onClick={handleClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Lightbulb size={24} className="text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Request a Feature</h2>
                <p className="text-sm text-gray-500">
                  Help us improve Vayva for everyone
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-1"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Request Type */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Request Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {requestTypes.map((type) => (
                <Button
                  key={type.value}
                  type="button"
                  onClick={() => setRequestType(type.value as any)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    requestType === type.value
                      ? "border-green-500 bg-green-500/5"
                      : "border-gray-100 hover:border-green-500/30"
                  }`}
                >
                  <div className="font-medium text-sm mb-1 capitalize">
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {type.description}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Priority Level
            </label>
            <Select
              value={priority}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setPriority(e.target.value as any)
              }
              className="w-full"
            >
              {priorities.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {priorities.find(p => p.value === priority)?.description}
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Title *
            </label>
            <Input
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder={
                requestType === "platform" 
                  ? "e.g. Add dark mode theme" 
                  : "e.g. Custom order status tracking"
              }
              required
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Detailed Description *
            </label>
            <Textarea
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder={
                requestType === "platform"
                  ? "Describe the feature you'd like to see added to Vayva platform-wide..."
                  : "Describe the specific feature or improvement you need for your business dashboard..."
              }
              rows={5}
              required
              minLength={20}
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                {description.length}/2000 characters
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <AlertCircle size={12} />
                Minimum 20 characters
              </p>
            </div>
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Attach Screenshot or File (Optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleAttachmentChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Paperclip size={16} />
                {attachment ? "Change File" : "Attach File"}
              </Button>
              {attachment && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 truncate max-w-[120px]">
                    {attachment.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAttachment(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Images, PDFs, or documents up to 5MB
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}