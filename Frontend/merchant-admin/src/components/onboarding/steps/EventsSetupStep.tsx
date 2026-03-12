"use client";

import { useOnboarding } from "../OnboardingContext";
import { Button, Input, Label } from "@vayva/ui";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Ticket, MapPin, Users } from "@phosphor-icons/react/ssr";

export default function EventsSetupStep() {
  const { nextStep, prevStep, updateData, state, isSaving } = useOnboarding();
  const [eventsConfig, setEventsConfig] = useState({
    enableTicketing: true,
    enableSeatSelection: false,
    enableEarlyBird: true,
    defaultVenue: "",
    defaultCapacity: "100",
    serviceFee: "5",
    ...(state as any).eventsConfig,
  });

  const handleNext = () => {
    updateData({ eventsConfig } as any);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
          <Ticket className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold">Events & Ticketing Setup</h2>
        <p className="text-muted-foreground">
          Configure your event management settings
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Default Venue Address
          </Label>
          <Input
            value={eventsConfig.defaultVenue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEventsConfig({ ...eventsConfig, defaultVenue: e.target.value })
            }
            placeholder="Enter your primary venue location"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Default Venue Capacity
          </Label>
          <Input
            type="number"
            value={eventsConfig.defaultCapacity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEventsConfig({ ...eventsConfig, defaultCapacity: e.target.value })
            }
            placeholder="100"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={eventsConfig.enableTicketing}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEventsConfig({ ...eventsConfig, enableTicketing: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span>Enable Online Ticketing</span>
          </Label>
          <p className="text-sm text-muted-foreground ml-6">
            Sell tickets online with instant QR code delivery
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={eventsConfig.enableSeatSelection}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEventsConfig({ ...eventsConfig, enableSeatSelection: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span>Enable Seat Selection</span>
          </Label>
          <p className="text-sm text-muted-foreground ml-6">
            Allow customers to choose their seats (requires seat map setup)
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={eventsConfig.enableEarlyBird}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEventsConfig({ ...eventsConfig, enableEarlyBird: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span>Enable Early Bird Pricing</span>
          </Label>
          <p className="text-sm text-muted-foreground ml-6">
            Offer discounted tickets for early purchases
          </p>
        </div>

        <div className="space-y-2">
          <Label>Service Fee (%)</Label>
          <Input
            type="number"
            value={eventsConfig.serviceFee}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEventsConfig({ ...eventsConfig, serviceFee: e.target.value })
            }
            placeholder="5"
          />
          <p className="text-sm text-muted-foreground">
            Platform fee added to each ticket (0-20%)
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} disabled={isSaving}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={isSaving}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
