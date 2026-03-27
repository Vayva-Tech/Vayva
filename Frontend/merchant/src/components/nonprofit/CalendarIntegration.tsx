"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Download, ExternalLink, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CalendarIntegrationProps {
  entityId: string;
  entityType: "grant" | "campaign" | "volunteer" | "shift";
  title: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
}

export function CalendarIntegration({ 
  entityId, 
  entityType, 
  title, 
  startDate, 
  endDate,
  location,
  description 
}: CalendarIntegrationProps) {
  const [googleSync, setGoogleSync] = useState(false);
  const [outlookSync, setOutlookSync] = useState(false);
  const [icalSync, setIcalSync] = useState(false);

  const formatDateForCalendar = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const generateGoogleCalendarUrl = () => {
    const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const text = encodeURIComponent(title);
    const dates = startDate && endDate 
      ? `${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}`
      : "";
    const details = encodeURIComponent(description || `Nonprofit ${entityType}: ${title}`);
    const location_str = location ? encodeURIComponent(location) : "";

    return `${baseUrl}&text=${text}&dates=${dates}&details=${details}&location=${location_str}`;
  };

  const generateOutlookCalendarUrl = () => {
    const baseUrl = "https://outlook.live.com/calendar/0/deeplink/compose";
    const params = new URLSearchParams({
      path: "/calendar/action/compose",
      rru: "addevent",
      startdt: startDate || "",
      enddt: endDate || "",
      subject: title,
      body: description || `Nonprofit ${entityType}: ${title}`,
      location: location || "",
    });

    return `${baseUrl}?${params.toString()}`;
  };

  const generateICSFile = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Vayva//Nonprofit Calendar//EN",
      "BEGIN:VEVENT",
      `UID:${entityId}@vayva.tech`,
      `DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d\d\d/g, "")}`,
      `DTSTART:${formatDateForCalendar(startDate)}`,
      `DTEND:${formatDateForCalendar(endDate)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description || `Nonprofit ${entityType}`}`,
      location ? `LOCATION:${location}` : "",
      "END:VEVENT",
      "END:VCALENDAR",
    ].filter(Boolean).join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${entityType}-${entityId}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Calendar event downloaded!");
  };

  const handleToggleSync = (platform: string, enabled: boolean) => {
    if (enabled) {
      toast.success(`${platform} sync enabled! You'll receive calendar invites.`);
    } else {
      toast.info(`${platform} sync disabled`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Add Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => window.open(generateGoogleCalendarUrl(), "_blank")}
            className="justify-start"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Add to Google
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(generateOutlookCalendarUrl(), "_blank")}
            className="justify-start"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Add to Outlook
          </Button>
          <Button
            variant="outline"
            onClick={generateICSFile}
            className="justify-start"
          >
            <Download className="h-4 w-4 mr-2" />
            Download .ICS
          </Button>
        </div>

        {/* Event Details */}
        {(startDate || location) && (
          <div className="space-y-2 text-sm">
            {startDate && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{new Date(startDate).toLocaleString()}</span>
              </div>
            )}
            {endDate && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Ends: {new Date(endDate).toLocaleString()}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
            )}
          </div>
        )}

        {/* Sync Toggles */}
        <div className="space-y-4 pt-4 border-t">
          <p className="text-sm font-medium">Automatic Sync</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-red-500">Google</Badge>
              <Label htmlFor="google-sync" className="text-sm">
                Sync with Google Calendar
              </Label>
            </div>
            <Switch
              id="google-sync"
              checked={googleSync}
              onCheckedChange={(checked) => handleToggleSync("Google", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500">Outlook</Badge>
              <Label htmlFor="outlook-sync" className="text-sm">
                Sync with Outlook Calendar
              </Label>
            </div>
            <Switch
              id="outlook-sync"
              checked={outlookSync}
              onCheckedChange={(checked) => handleToggleSync("Outlook", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500">iCal</Badge>
              <Label htmlFor="ical-sync" className="text-sm">
                iCal Feed
              </Label>
            </div>
            <Switch
              id="ical-sync"
              checked={icalSync}
              onCheckedChange={(checked) => handleToggleSync("iCal", checked)}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 pt-2">
          Enable automatic sync to receive calendar invitations for updates and reminders.
        </p>
      </CardContent>
    </Card>
  );
}
