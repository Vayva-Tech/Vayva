/**
 * Professional Services - Meetings & Calls Page
 * Schedule and manage client meetings and consultations
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Plus, Video, Phone } from "lucide-react";
import { useState } from "react";

interface Meeting {
  id: string;
  title: string;
  clientName: string;
  type: "in-person" | "video" | "phone";
  dateTime: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled";
}

export default function ProfessionalServicesMeetingsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const meetings: Meeting[] = [
    { id: "1", title: "Q1 Strategy Review", clientName: "Tech Corp", type: "video", dateTime: "2024-01-16 10:00", duration: 60, status: "scheduled" },
    { id: "2", title: "Brand Presentation", clientName: "Finance Plus", type: "in-person", dateTime: "2024-01-16 14:00", duration: 90, status: "scheduled" },
    { id: "3", title: "Weekly Check-in", clientName: "Healthcare Inc", type: "phone", dateTime: "2024-01-15 15:00", duration: 30, status: "completed" },
    { id: "4", title: "Project Kickoff", clientName: "Retail Solutions", type: "video", dateTime: "2024-01-17 11:00", duration: 60, status: "scheduled" },
  ];

  const filteredMeetings = filter === "all" ? meetings : meetings.filter(m => m.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/professional-services")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Meetings & Calls</h1>
            <p className="text-muted-foreground">Schedule client meetings and consultations</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/professional-services/meetings/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        <Button 
          variant={filter === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("all")}
        >
          All Meetings
        </Button>
        <Button 
          variant={filter === "scheduled" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("scheduled")}
        >
          Scheduled ({meetings.filter(m => m.status === "scheduled").length})
        </Button>
        <Button 
          variant={filter === "completed" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("completed")}
        >
          Completed
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredMeetings.map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{meeting.title}</h3>
                  <p className="text-sm text-muted-foreground">{meeting.clientName}</p>
                </div>
                <Badge variant={meeting.status === "completed" ? "default" : meeting.status === "cancelled" ? "destructive" : "secondary"}>
                  {meeting.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>{meeting.dateTime.split(' ')[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span>{meeting.dateTime.split(' ')[1]}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 font-medium">{meeting.duration} min</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  {meeting.type === "video" && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      Video Call
                    </Badge>
                  )}
                  {meeting.type === "phone" && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Phone Call
                    </Badge>
                  )}
                  {meeting.type === "in-person" && (
                    <Badge variant="outline">In-Person</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/professional-services/meetings/${meeting.id}`)}>
                    View
                  </Button>
                  {meeting.status === "scheduled" && (
                    <>
                      <Button size="sm">Reschedule</Button>
                      <Button variant="destructive" size="sm">Cancel</Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
