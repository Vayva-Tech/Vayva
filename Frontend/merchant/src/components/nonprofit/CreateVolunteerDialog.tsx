'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';
import { CreateVolunteerInput, CreateVolunteerShiftInput } from '@/types/phase4-industry';
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

interface CreateVolunteerDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateVolunteerDialog({ open, onClose, onSuccess }: CreateVolunteerDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [availability, setAvailability] = useState('');

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email) return;

    setIsSubmitting(true);
    try {
      const data = {
        storeId: '',
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        skills: skills ? skills.split(',').map((s) => s.trim()) : undefined,
        interests: interests ? interests.split(',').map((s) => s.trim()) : undefined,
        availability: availability ? JSON.parse(availability) : undefined,
      } as unknown as CreateVolunteerInput;

      const response = await fetch('/nonprofit/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
      } else {
        logger.error("[CreateVolunteer] Failed: Response not OK");
      }
    } catch (error) {
      logger.error("[CreateVolunteer] Failed:", { error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Volunteer</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input
              id="skills"
              value={skills}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkills(e.target.value)}
              placeholder="e.g., teaching, first aid, event planning"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">Interests (comma-separated)</Label>
            <Input
              id="interests"
              value={interests}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInterests(e.target.value)}
              placeholder="e.g., education, environment, health"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Textarea
              id="availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="e.g., Weekends, evenings, flexible"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!firstName || !lastName || !email || isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Volunteer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
