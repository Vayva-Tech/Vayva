'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';
// @ts-expect-error -- phase4-industry types are generated lazily and may not exist at compile time
import { CreateEventInput, EventType, EventCategory, TicketTypeInput } from '@/types/phase4-industry';
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
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Ticket } from 'lucide-react';

interface CreateEventDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEventDialog({ open, onClose, onSuccess }: CreateEventDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('concert');
  const [category, setCategory] = useState<EventCategory>('entertainment');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [capacity, setCapacity] = useState('');
  const [ticketTypes, setTicketTypes] = useState<TicketTypeInput[]>([]);

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        name: '',
        description: '',
        price: 0,
        quantity: 0,
      },
    ]);
  };

  const removeTicketType = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const updateTicketType = (index: number, field: keyof TicketTypeInput, value: any) => {
    setTicketTypes(
      ticketTypes.map((ticket, i) => (i === index ? { ...ticket, [field]: value } : ticket))
    );
  };

  const handleSubmit = async () => {
    if (!title || !startDate) return;

    setIsSubmitting(true);
    try {
      const data = {
        storeId: '',
        title,
        description: description || undefined,
        eventType,
        category,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        venue: venueName || undefined,
        capacity: capacity ? parseInt(capacity) : 0,
        ticketTypes: ticketTypes.length > 0 ? ticketTypes : undefined,
      } as unknown as CreateEventInput;

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
      } else {
        logger.error("[CreateEvent] Failed: Response not OK");
      }
    } catch (error) {
      logger.error("[CreateEvent] Failed:", { error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Enter event title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Event Type *</Label>
              <Select value={eventType} onValueChange={(value: string) => setEventType(value as EventType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concert">Concert</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="theater">Theater</SelectItem>
                  <SelectItem value="comedy">Comedy</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(value: string) => setCategory(value as EventCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="fundraiser">Fundraiser</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date & Time *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Venue Information</h4>
            <div className="space-y-2">
              <Label htmlFor="venueName">Venue Name</Label>
              <Input
                id="venueName"
                value={venueName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVenueName(e.target.value)}
                placeholder="Enter venue name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venueAddress">Venue Address</Label>
              <Input
                id="venueAddress"
                value={venueAddress}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVenueAddress(e.target.value)}
                placeholder="Enter venue address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={capacity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCapacity(e.target.value)}
                placeholder="Maximum attendees"
              />
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Ticket Types
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addTicketType}>
                <Plus className="h-4 w-4 mr-1" />
                Add Ticket Type
              </Button>
            </div>

            {ticketTypes.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">
                No ticket types added. Add ticket types for your event.
              </p>
            ) : (
              <div className="space-y-3">
                {ticketTypes.map((ticket, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-4 gap-3 items-end">
                        <div className="col-span-2">
                          <Label className="text-xs">Ticket Name *</Label>
                          <Input
                            value={ticket.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTicketType(index, 'name', e.target.value)}
                            placeholder="e.g., General Admission, VIP"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Price *</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={ticket.price}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updateTicketType(index, 'price', parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Label className="text-xs">Quantity</Label>
                            <Input
                              type="number"
                              min="0"
                              value={ticket.quantity}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                updateTicketType(index, 'quantity', parseInt(e.target.value) || 0)
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTicketType(index)}
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={ticket.description || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTicketType(index, 'description', e.target.value)}
                          placeholder="What's included with this ticket?"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title || !startDate || isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
