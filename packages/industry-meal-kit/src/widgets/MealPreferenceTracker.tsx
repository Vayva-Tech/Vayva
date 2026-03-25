"use client";

import React, { useState } from "react";
import { Badge, Card, CardContent, CardHeader, Button } from "@vayva/ui";
interface MealPreferenceTrackerProps {
  storeId: string;
  customerId: string;
  existingPreferences?: {
    dislikes?: string[];
    allergies?: string[];
    dietaryType?: string;
    spiceLevel?: string;
    notes?: string;
  };
  onSave?: (preferences: Record<string, unknown>) => void;
}

const DIETARY_TYPES = [
  { value: "none", label: "No restrictions" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "keto", label: "Keto" },
  { value: "low-carb", label: "Low carb" },
  { value: "gluten-free", label: "Gluten free" },
  { value: "dairy-free", label: "Dairy free" },
];

const SPICE_LEVELS = [
  { value: "mild", label: "Mild" },
  { value: "medium", label: "Medium" },
  { value: "hot", label: "Hot" },
];

const COMMON_ALLERGENS = [
  "Peanuts",
  "Tree nuts",
  "Milk",
  "Eggs",
  "Wheat",
  "Soy",
  "Fish",
  "Shellfish",
];

export function MealPreferenceTracker({
  storeId,
  customerId,
  existingPreferences,
  onSave,
}: MealPreferenceTrackerProps) {
  const [dislikes, setDislikes] = useState<string[]>(
    existingPreferences?.dislikes ?? []
  );
  const [allergies, setAllergies] = useState<string[]>(
    existingPreferences?.allergies ?? []
  );
  const [dietaryType, setDietaryType] = useState(
    existingPreferences?.dietaryType ?? "none"
  );
  const [spiceLevel, setSpiceLevel] = useState(
    existingPreferences?.spiceLevel ?? "medium"
  );
  const [notes, setNotes] = useState(existingPreferences?.notes ?? "");
  const [newDislike, setNewDislike] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAddDislike = () => {
    const t = newDislike.trim();
    if (t && !dislikes.includes(t)) {
      setDislikes([...dislikes, t]);
      setNewDislike("");
    }
  };

  const handleRemoveDislike = (dislike: string) => {
    setDislikes(dislikes.filter((d) => d !== dislike));
  };

  const handleAddAllergy = () => {
    const t = newAllergy.trim();
    if (t && !allergies.includes(t)) {
      setAllergies([...allergies, t]);
      setNewAllergy("");
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    setAllergies(allergies.filter((a) => a !== allergy));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const preferences = {
        storeId,
        customerId,
        dislikes,
        allergies,
        dietaryType: dietaryType === "none" ? undefined : dietaryType,
        spiceLevel,
        notes: notes.trim() || undefined,
      };

      const response = await fetch("/api/meal-kit/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        onSave?.(preferences);
      }
    } catch (e) {
      console.error("Failed to save preferences", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <h3 className="text-lg font-semibold">Meal preferences</h3>
        <p className="text-sm text-gray-600">
          Dislikes, allergies, and dietary choices
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="dietary" className="text-sm font-medium">
            Dietary type
          </label>
          <select
            id="dietary"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={dietaryType}
            onChange={(e) => setDietaryType(e.target.value)}
          >
            {DIETARY_TYPES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="spice" className="text-sm font-medium">
            Spice level
          </label>
          <select
            id="spice"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={spiceLevel}
            onChange={(e) => setSpiceLevel(e.target.value)}
          >
            {SPICE_LEVELS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium">Common allergens</span>
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGENS.map((a) => {
              const on = allergies.includes(a);
              return (
                <Button
                  key={a}
                  type="button"
                  className="rounded-full"
                  onClick={() =>
                    on ? handleRemoveAllergy(a) : setAllergies([...allergies, a])
                  }
                >
                  <Badge variant={on ? "error" : "outline"}>{a}</Badge>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="new-allergy" className="text-sm font-medium">
            Add allergy
          </label>
          <div className="flex gap-2">
            <input
              id="new-allergy"
              className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
            />
            <Button
              type="button"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              onClick={handleAddAllergy}
            >
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="new-dislike" className="text-sm font-medium">
            Add dislike
          </label>
          <div className="flex gap-2">
            <input
              id="new-dislike"
              className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={newDislike}
              onChange={(e) => setNewDislike(e.target.value)}
            />
            <Button
              type="button"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              onClick={handleAddDislike}
            >
              Add
            </Button>
          </div>
        </div>

        {dislikes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {dislikes.map((d) => (
              <Badge key={d} variant="outline">
                {d}
                <Button
                  type="button"
                  className="ml-1"
                  aria-label={`Remove ${d}`}
                  onClick={() => handleRemoveDislike(d)}
                >
                  ×
                </Button>
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium">
            Notes
          </label>
          <textarea
            id="notes"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          type="button"
          disabled={saving}
          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          onClick={() => void handleSave()}
        >
          {saving ? "Saving…" : "Save preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
