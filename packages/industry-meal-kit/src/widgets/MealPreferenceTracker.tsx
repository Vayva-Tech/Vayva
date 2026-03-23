// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@vayva/ui/components/ui/card';
import { Button } from '@vayva/ui/components/ui/button';
import { Badge } from '@vayva/ui/components/ui/badge';
import { Input } from '@vayva/ui/components/ui/input';
import { Label } from '@vayva/ui/components/ui/label';
import { Textarea } from '@vayva/ui/components/ui/textarea';
import { Switch } from '@vayva/ui/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@vayva/ui/components/ui/select';
import { Heart, AlertTriangle, Check, Save, Plus, X } from 'lucide-react';

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
  onSave?: (preferences: any) => void;
}

const DIETARY_TYPES = [
  { value: 'none', label: 'No restrictions' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'keto', label: 'Keto' },
  { value: 'low-carb', label: 'Low Carb' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'gluten-free', label: 'Gluten Free' },
  { value: 'dairy-free', label: 'Dairy Free' },
];

const SPICE_LEVELS = [
  { value: 'mild', label: 'Mild' },
  { value: 'medium', label: 'Medium' },
  { value: 'hot', label: 'Hot' },
];

const COMMON_ALLERGENS = [
  'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish'
];

export function MealPreferenceTracker({
  storeId,
  customerId,
  existingPreferences,
  onSave,
}: MealPreferenceTrackerProps) {
  const [dislikes, setDislikes] = useState<string[]>(existingPreferences?.dislikes || []);
  const [allergies, setAllergies] = useState<string[]>(existingPreferences?.allergies || []);
  const [dietaryType, setDietaryType] = useState(existingPreferences?.dietaryType || 'none');
  const [spiceLevel, setSpiceLevel] = useState(existingPreferences?.spiceLevel || 'medium');
  const [notes, setNotes] = useState(existingPreferences?.notes || '');
  const [newDislike, setNewDislike] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddDislike = () => {
    if (newDislike.trim() && !dislikes.includes(newDislike.trim())) {
      setDislikes([...dislikes, newDislike.trim()]);
      setNewDislike('');
    }
  };

  const handleRemoveDislike = (dislike: string) => {
    setDislikes(dislikes.filter(d => d !== dislike));
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const preferences = {
        storeId,
        customerId,
        dislikes,
        allergies,
        dietaryType: dietaryType === 'none' ? undefined : dietaryType,
        spiceLevel,
        notes: notes.trim() || undefined,
      };

      const response = await fetch('/api/meal-kit/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok && onSave) {
        onSave(preferences);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Meal Preferences
            </CardTitle>
            <CardDescription>
              Tell us about your dietary needs and preferences
            </CardDescription>
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dietary Type */}
        <div className="space-y-3">
          <Label>Dietary Type</Label>
          <Select value={dietaryType} onValueChange={setDietaryType}>
            <SelectTrigger>
              <SelectValue placeholder="Select dietary type" />
            </SelectTrigger>
            <SelectContent>
              {DIETARY_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Spice Level */}
        <div className="space-y-3">
          <Label>Spice Level Preference</Label>
          <div className="grid grid-cols-3 gap-3">
            {SPICE_LEVELS.map(level => (
              <Button
                key={level.value}
                variant={spiceLevel === level.value ? 'default' : 'outline'}
                onClick={() => setSpiceLevel(level.value)}
                className="w-full"
              >
                {level.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <Label className="text-destructive">Allergies (Critical)</Label>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_ALLERGENS.map(allergen => (
              <Badge
                key={allergen}
                variant={allergies.includes(allergen) ? 'destructive' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  if (allergies.includes(allergen)) {
                    handleRemoveAllergy(allergen);
                  } else {
                    handleAddAllergy();
                    setAllergies([...allergies, allergen]);
                  }
                }}
              >
                {allergen}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add other allergy..."
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddAllergy()}
            />
            <Button variant="outline" onClick={handleAddAllergy}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {allergies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {allergies.map(allergy => (
                <Badge key={allergy} variant="destructive" className="flex items-center gap-1">
                  {allergy}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleRemoveAllergy(allergy)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Dislikes */}
        <div className="space-y-3">
          <Label>Ingredients You Don't Like</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add ingredient..."
              value={newDislike}
              onChange={(e) => setNewDislike(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddDislike()}
            />
            <Button variant="outline" onClick={handleAddDislike}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {dislikes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {dislikes.map(dislike => (
                <Badge key={dislike} variant="secondary" className="flex items-center gap-1">
                  {dislike}
                  <X 
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveDislike(dislike)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Additional Notes */}
        <div className="space-y-3">
          <Label>Additional Notes or Special Requests</Label>
          <Textarea
            placeholder="Tell us anything else we should know about your food preferences..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Summary */}
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Your Preferences Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dietary Type:</span>
                <Badge variant="outline">{DIETARY_TYPES.find(t => t.value === dietaryType)?.label}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spice Level:</span>
                <Badge variant="outline">{SPICE_LEVELS.find(l => l.value === spiceLevel)?.label}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Allergies:</span>
                <span className="text-destructive">{allergies.length > 0 ? `${allergies.length} listed` : 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dislikes:</span>
                <span>{dislikes.length > 0 ? `${dislikes.length} listed` : 'None'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
