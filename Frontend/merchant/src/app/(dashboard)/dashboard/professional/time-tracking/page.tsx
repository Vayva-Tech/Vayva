/**
 * Professional (Legal) - Time Tracking Page
 * Track billable hours and attorney time entries
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Clock, Search, Plus, Timer, Play } from "lucide-react";
import { useState } from "react";

interface TimeEntry {
  id: string;
  attorneyName: string;
  matterReference: string;
  description: string;
  date: string;
  hours: number;
  rate: number;
  totalValue: number;
  status: "billed" | "unbilled" | "in-progress";
}

export default function ProfessionalTimeTrackingPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const timeEntries: TimeEntry[] = [
    { id: "1", attorneyName: "Alex Thompson", matterReference: "MAT-2024-001", description: "Contract review and negotiation", date: "2024-01-22", hours: 3.5, rate: 450, totalValue: 1575, status: "unbilled" },
    { id: "2", attorneyName: "Maria Garcia", matterReference: "MAT-2024-002", description: "Client consultation meeting", date: "2024-01-22", hours: 2.0, rate: 375, totalValue: 750, status: "unbilled" },
    { id: "3", attorneyName: "James Lee", matterReference: "MAT-2023-089", description: "Patent application drafting", date: "2024-01-21", hours: 5.0, rate: 425, totalValue: 2125, status: "billed" },
    { id: "4", attorneyName: "Sarah Johnson", matterReference: "MAT-2023-067", description: "Document preparation", date: "2024-01-21", hours: 1.5, rate: 400, totalValue: 600, status: "billed" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/professional")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Time Tracking</h1>
            <p className="text-muted-foreground">Track billable hours and time entries</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Start Timer
          </Button>
          <Button onClick={() => router.push("/dashboard/professional/time/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Time
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by attorney, matter, or description..."
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
                <p className="text-sm text-muted-foreground">Total Hours (Week)</p>
                <p className="text-2xl font-bold">{timeEntries.reduce((acc, entry) => acc + entry.hours, 0).toFixed(1)}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unbilled Hours</p>
                <p className="text-2xl font-bold">{timeEntries.filter(e => e.status === "unbilled").reduce((acc, entry) => acc + entry.hours, 0).toFixed(1)}h</p>
              </div>
              <Timer className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unbilled Value</p>
                <p className="text-2xl font-bold">${timeEntries.filter(e => e.status === "unbilled").reduce((acc, entry) => acc + entry.totalValue, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rate/Hour</p>
                <p className="text-2xl font-bold">${(timeEntries.reduce((acc, entry) => acc + entry.rate, 0) / timeEntries.length).toFixed(0)}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
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
                  <th className="py-3 px-4 font-medium" scope="col">Attorney</th>
                  <th className="py-3 px-4 font-medium" scope="col">Matter</th>
                  <th className="py-3 px-4 font-medium" scope="col">Description</th>
                  <th className="py-3 px-4 font-medium" scope="col">Date</th>
                  <th className="py-3 px-4 font-medium" scope="col">Hours</th>
                  <th className="py-3 px-4 font-medium" scope="col">Rate</th>
                  <th className="py-3 px-4 font-medium" scope="col">Total</th>
                  <th className="py-3 px-4 font-medium" scope="col">Status</th>
                  <th className="py-3 px-4 font-medium" scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {timeEntries.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{entry.attorneyName}</td>
                    <td className="py-3 px-4 font-mono text-sm">{entry.matterReference}</td>
                    <td className="py-3 px-4 text-sm truncate max-w-[250px]">{entry.description}</td>
                    <td className="py-3 px-4 text-sm">{entry.date}</td>
                    <td className="py-3 px-4 font-semibold">{entry.hours.toFixed(1)}</td>
                    <td className="py-3 px-4 text-sm">${entry.rate}/hr</td>
                    <td className="py-3 px-4 font-bold">${entry.totalValue.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={entry.status === "billed" ? "default" : entry.status === "in-progress" ? "secondary" : "outline"}>
                        {entry.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/professional/time/${entry.id}`)}>
                        Edit
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
