'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';
// @ts-expect-error -- phase4-industry types are generated lazily and may not exist at compile time
import { CreateCampaignInput, CampaignType, CampaignCategory } from '@/types/phase4-industry';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateCampaignDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCampaignDialog({ open, onClose, onSuccess }: CreateCampaignDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CampaignType>('general');
  const [category, setCategory] = useState<CampaignCategory>('general');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const handleSubmit = async () => {
    if (!name) return;

    setIsSubmitting(true);
    try {
      const data: CreateCampaignInput = {
        storeId: '',
        name,
        description: description || undefined,
        type,
        category,
        goal: goal ? parseFloat(goal) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        coverImage: coverImage || undefined,
      };

      const response = await fetch('/api/nonprofit/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
      } else {
        logger.error("[CreateCampaign] Failed: Response not OK");
      }
    } catch (error) {
      logger.error("[CreateCampaign] Failed:", { error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Fundraising Campaign</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Enter campaign name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Describe your campaign and its goals"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Campaign Type *</Label>
              <Select value={type} onValueChange={(value: string) => setType(value as CampaignType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual_fund">Annual Fund</SelectItem>
                  <SelectItem value="emergency_appeal">Emergency Appeal</SelectItem>
                  <SelectItem value="capital_campaign">Capital Campaign</SelectItem>
                  <SelectItem value="event_fundraiser">Event Fundraiser</SelectItem>
                  <SelectItem value="peer_to_peer">Peer to Peer</SelectItem>
                  <SelectItem value="recurring_giving">Recurring Giving</SelectItem>
                  <SelectItem value="memorial">Memorial</SelectItem>
                  <SelectItem value="tribute">Tribute</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(value: string) => setCategory(value as CampaignCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="human_services">Human Services</SelectItem>
                  <SelectItem value="arts_culture">Arts & Culture</SelectItem>
                  <SelectItem value="animal_welfare">Animal Welfare</SelectItem>
                  <SelectItem value="disaster_relief">Disaster Relief</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Fundraising Goal</Label>
            <Input
              id="goal"
              type="number"
              min="0"
              step="0.01"
              value={goal}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoal(e.target.value)}
              placeholder="Enter fundraising goal amount"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              value={coverImage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoverImage(e.target.value)}
              placeholder="Enter image URL"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name || isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
