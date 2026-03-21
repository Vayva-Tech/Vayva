"use client";

import { useState, useRef, FormEvent } from "react";
import { Button, Input, Textarea } from "@vayva/ui";
import { Star, Paperclip, X, Check } from "@phosphor-icons/react";
import { apiJson } from "@/lib/api-client-shared";

interface FeedbackFormProps {
  triggerLabel?: string;
  onClose?: () => void;
}

/**
 * Merchant feedback form with rating, comment, and screenshot upload
 */
export function FeedbackForm({ triggerLabel = "Give feedback", onClose }: FeedbackFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState("general");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: "general", label: "General Feedback" },
    { value: "bug", label: "Bug Report" },
    { value: "feature", label: "Feature Request" },
    { value: "ux", label: "User Experience" },
    { value: "onboarding", label: "Onboarding" },
  ];

  const handleOpen = () => {
    setIsOpen(true);
    setIsSuccess(false);
    setError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setRating(0);
    setComment("");
    setCategory("general");
    setScreenshot(null);
    setError(null);
    onClose?.();
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setError("Screenshot must be under 5MB");
      return;
    }
    setScreenshot(file || null);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (comment.trim().length < 10) {
      setError("Please provide at least 10 characters of feedback");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload screenshot if provided
      let screenshotUrl: string | undefined;
      if (screenshot) {
        const formData = new FormData();
        formData.append("file", screenshot);
        
        const uploadRes = await fetch("/api/upload/feedback-screenshot", {
          method: "POST",
          body: formData,
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          screenshotUrl = uploadData.url;
        }
      }

      // Submit feedback
      await apiJson("/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          rating,
          comment,
          category,
          screenshotUrl,
          metadata: {
            url: window.location.pathname,
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
          },
        }),
      });

      setIsSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className="text-gray-500 hover:text-gray-900"
      >
        {triggerLabel}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Thank you!</h3>
            <p className="text-gray-500">
              Your feedback helps us improve Vayva.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Share your feedback</h3>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                How would you rate your experience?
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={category}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Tell us more (optional)
              </label>
              <Textarea
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                placeholder="What did you like? What could be improved?"
                className="min-h-[100px]"
              />
            </div>

            {/* Screenshot */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Screenshot (optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleScreenshotChange}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Paperclip className="w-4 h-4" />
                  {screenshot ? "Change screenshot" : "Attach screenshot"}
                </Button>
                {screenshot && (
                  <span className="text-sm text-gray-500">
                    {screenshot.name}
                  </span>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3">
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
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit feedback"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/**
 * Post-action feedback modal
 * Shows after key actions (onboarding completion, order creation, etc.)
 */
interface PostActionFeedbackProps {
  action: "onboarding_complete" | "first_order" | "first_payout" | "feature_usage";
  isOpen: boolean;
  onClose: () => void;
}

export function PostActionFeedback({ action, isOpen, onClose }: PostActionFeedbackProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const actionLabels: Record<string, { title: string; subtitle: string }> = {
    onboarding_complete: {
      title: "How was your setup experience?",
      subtitle: "Help us improve onboarding for new merchants",
    },
    first_order: {
      title: "You received your first order!",
      subtitle: "How easy was it to process?",
    },
    first_payout: {
      title: "Your first payout is on its way!",
      subtitle: "How was the payout experience?",
    },
    feature_usage: {
      title: "How was this feature?",
      subtitle: "Your feedback helps us improve",
    },
  };

  const labels = actionLabels[action] || actionLabels.feature_usage;

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await apiJson("/api/feedback/post-action", {
        method: "POST",
        body: JSON.stringify({
          action,
          rating,
          feedback,
          timestamp: new Date().toISOString(),
        }),
      });
      onClose();
    } catch {
      // Silent fail
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-semibold mb-1">{labels.title}</h3>
        <p className="text-sm text-gray-500 mb-4">{labels.subtitle}</p>

        {/* Rating */}
        <div className="flex gap-1 justify-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={`w-10 h-10 ${
                  star <= rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Quick feedback */}
        <Textarea
          value={feedback}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
          placeholder="Quick feedback (optional)"
          className="mb-4 min-h-[80px]"
        />

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
