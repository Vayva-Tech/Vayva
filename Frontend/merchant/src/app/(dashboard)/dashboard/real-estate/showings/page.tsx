/**
 * Real Estate - Showings Management Page
 * Schedule and manage property showings and open houses
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Plus, Clock, Home } from "lucide-react";
import { useState } from "react";

interface Showing {
  id: string;
  propertyAddress: string;
  clientName: string;
  agentName: string;
  dateTime: string;
  duration: number;
  type: "private" | "open-house";
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  feedback?: string;
}

export default function RealEstateShowingsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const showings: Showing[] = [
    { id: "1", propertyAddress: "123 Oak Street, Beverly Hills", clientName: "John & Lisa Smith", agentName: "Sarah Johnson", dateTime: "2024-01-16 14:00", duration: 60, type: "private", status: "confirmed" },
    { id: "2", propertyAddress: "456 Palm Avenue, Miami Beach", clientName: "Multiple Clients", agentName: "Michael Chen", dateTime: "2024-01-17 10:00", duration: 120, type: "open-house", status: "scheduled" },
    { id: "3", propertyAddress: "789 Maple Drive, Austin", clientName: "Tech Executives", agentName: "Emily Rodriguez", dateTime: "2024-01-15 16:00", duration: 90, type: "private", status: "completed", feedback: "Very interested, making offer" },
    { id: "4", propertyAddress: "321 Pine Lane, Seattle", clientName: "Young Family", agentName: "David Park", dateTime: "2024-01-18 11:00", duration: 60, type: "private", status: "scheduled" },
  ];

  const filteredShowings = filter === "all" ? showings : showings.filter(s => s.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/real-estate")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Showings</h1>
            <p className="text-muted-foreground">Schedule property showings and open houses</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/real-estate/showings/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Showing
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        <Button 
          variant={filter === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("all")}
        >
          All Showings
        </Button>
        <Button 
          variant={filter === "scheduled" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("scheduled")}
        >
          Scheduled ({showings.filter(s => s.status === "scheduled").length})
        </Button>
        <Button 
          variant={filter === "confirmed" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("confirmed")}
        >
          Confirmed
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
        {filteredShowings.map((showing) => (
          <Card key={showing.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{showing.propertyAddress}</h3>
                  <p className="text-sm text-muted-foreground">Client: {showing.clientName}</p>
                </div>
                <Badge variant={showing.status === "completed" ? "default" : showing.status === "cancelled" ? "destructive" : showing.status === "confirmed" ? "secondary" : "outline"}>
                  {showing.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>{showing.dateTime.split(' ')[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span>{showing.dateTime.split(' ')[1]} ({showing.duration} min)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-green-600" />
                  <span className="capitalize">{showing.type.replace('-', ' ')}</span>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Agent: <span className="font-medium text-foreground">{showing.agentName}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/real-estate/showings/${showing.id}`)}>
                    View Details
                  </Button>
                  {showing.status === "scheduled" && (
                    <>
                      <Button size="sm">Confirm</Button>
                      <Button variant="destructive" size="sm">Cancel</Button>
                    </>
                  )}
                </div>
              </div>

              {showing.feedback && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-xs font-medium text-green-800">Feedback:</p>
                  <p className="text-sm text-green-700 mt-1">{showing.feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
