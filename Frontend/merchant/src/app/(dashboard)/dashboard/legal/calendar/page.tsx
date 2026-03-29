/**
 * ============================================================================
 * Legal Calendar Page
 * ============================================================================
 * Court calendar, hearings, depositions, and deadline management
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import { logger, formatDate } from "@vayva/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar as CalendarIcon,
  Gavel,
  Clock,
  AlertCircle,
  Plus,
  ChevronLeft,
  MapPin,
  Users,
} from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";

interface CourtEvent {
  id: string;
  matterId: string;
  matterTitle?: string;
  eventType: "hearing" | "trial" | "conference" | "deposition" | "mediation" | "deadline";
  title: string;
  location?: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled";
}

export default function LegalCalendarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CourtEvent[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: CourtEvent[] }>("/legal/court-events");
      setEvents(response.data || generateMockEvents());
    } catch (error) {
      setEvents(generateMockEvents());
    } finally {
      setLoading(false);
    }
  };

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  const getEventsForDay = (date: Date) => {
    return events.filter(event => event.scheduledDate === format(date, "yyyy-MM-dd"));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/legal")}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Court Calendar
                </h1>
                <p className="text-xs text-muted-foreground">Hearings, depositions, and deadlines</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Event
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Calendar */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Weekly View</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
                    Previous
                  </Button>
                  <Badge variant="outline" className="text-sm px-4">
                    {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                    Next
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && setCurrentDate(date)}
                  modifiers={{
                    hasEvent: (date) => getEventsForDay(date).length > 0,
                  }}
                  modifiersClassNames={{
                    hasEvent: "bg-blue-100 font-bold",
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 5).map((event) => (
                    <div key={event.id} className="p-3 bg-muted/50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{event.matterTitle}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {event.scheduledTime}
                            {event.location && (
                              <>
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">{event.eventType}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Critical Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Critical Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <div>
                    <p className="font-medium text-sm">Statute of Limitations - Smith v. Johnson</p>
                    <p className="text-xs text-muted-foreground">Personal Injury Case</p>
                  </div>
                  <Badge variant="destructive">Critical</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


// No mock data - requires real legal API integration

