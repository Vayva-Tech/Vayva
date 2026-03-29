/**
 * Professional (Legal) - Court Dates & Calendar Page
 * Manage court hearings, deadlines, and legal calendar
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, Search, Plus, Clock, Gavel } from "lucide-react";
import { useState } from "react";

interface CourtDate {
  id: string;
  title: string;
  matterReference: string;
  attorneyName: string;
  dateTime: string;
  type: "hearing" | "trial" | "deposition" | "filing-deadline" | "conference";
  location: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
}

export default function ProfessionalCourtDatesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const courtDates: CourtDate[] = [
    { id: "1", title: "Motion to Dismiss Hearing", matterReference: "MAT-2024-001", attorneyName: "Alex Thompson", dateTime: "2024-01-25 09:30", type: "hearing", location: "Superior Court Room 304", status: "scheduled" },
    { id: "2", title: "Employment Arbitration", matterReference: "MAT-2024-002", attorneyName: "Maria Garcia", dateTime: "2024-01-26 14:00", type: "trial", location: "Arbitration Center", status: "scheduled" },
    { id: "3", title: "Patent Application Deadline", matterReference: "MAT-2023-089", attorneyName: "James Lee", dateTime: "2024-01-30 17:00", type: "filing-deadline", location: "USPTO Electronic Filing", status: "scheduled" },
    { id: "4", title: "Client Settlement Conference", matterReference: "MAT-2023-067", attorneyName: "Sarah Johnson", dateTime: "2024-01-23 11:00", type: "conference", location: "Law Office Conference Room A", status: "scheduled" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/professional")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Court Dates & Calendar</h1>
            <p className="text-muted-foreground">Manage hearings, trials, and legal deadlines</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/professional/court-dates/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Court Date
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, matter, or attorney..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Hearings</p>
                <p className="text-2xl font-bold">{courtDates.filter(cd => cd.type === "hearing" && cd.status === "scheduled").length}</p>
              </div>
              <Gavel className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trials Scheduled</p>
                <p className="text-2xl font-bold">{courtDates.filter(cd => cd.type === "trial" && cd.status === "scheduled").length}</p>
              </div>
              <Gavel className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deadlines (Week)</p>
                <p className="text-2xl font-bold">{courtDates.filter(cd => cd.type === "filing-deadline" && cd.status === "scheduled").length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{courtDates.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" scope="col">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium" scope="col">Title</th>
                  <th className="py-3 px-4 font-medium" scope="col">Matter</th>
                  <th className="py-3 px-4 font-medium" scope="col">Attorney</th>
                  <th className="py-3 px-4 font-medium" scope="col">Type</th>
                  <th className="py-3 px-4 font-medium" scope="col">Date/Time</th>
                  <th className="py-3 px-4 font-medium" scope="col">Location</th>
                  <th className="py-3 px-4 font-medium" scope="col">Status</th>
                  <th className="py-3 px-4 font-medium" scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {courtDates.map((courtDate) => (
                  <tr key={courtDate.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{courtDate.title}</td>
                    <td className="py-3 px-4 font-mono text-sm">{courtDate.matterReference}</td>
                    <td className="py-3 px-4 text-sm">{courtDate.attorneyName}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{courtDate.type.replace("-", " ")}</Badge>
                    </td>
                    <td className="py-3 px-4 font-medium">{new Date(courtDate.dateTime).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm truncate max-w-[200px]">{courtDate.location}</td>
                    <td className="py-3 px-4">
                      <Badge variant={courtDate.status === "scheduled" ? "default" : courtDate.status === "cancelled" ? "destructive" : "secondary"}>
                        {courtDate.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/professional/court-dates/${courtDate.id}`)}>
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
