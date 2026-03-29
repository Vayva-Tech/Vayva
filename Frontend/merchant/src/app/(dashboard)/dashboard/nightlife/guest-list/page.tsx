/**
 * Nightlife - Guest List Management Page
 * Manage VIP guests, reservations, and entry access
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Search, Plus, Star, Crown } from "lucide-react";
import { useState } from "react";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "vip" | "regular" | "blacklist";
  status: "approved" | "pending" | "denied";
  partySize: number;
  reservedDate: string;
  notes?: string;
}

export default function NightlifeGuestListPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const guests: Guest[] = [
    { id: "1", name: "Michael Chen", email: "michael@email.com", phone: "+1 (555) 123-4567", type: "vip", status: "approved", partySize: 4, reservedDate: "2024-01-26", notes: "Table 12 preferred" },
    { id: "2", name: "Sarah Johnson", email: "sarah@email.com", phone: "+1 (555) 234-5678", type: "regular", status: "pending", partySize: 2, reservedDate: "2024-01-26" },
    { id: "3", name: "James Wilson", email: "james@email.com", phone: "+1 (555) 345-6789", type: "vip", status: "approved", partySize: 6, reservedDate: "2024-01-27", notes: "Birthday celebration" },
    { id: "4", name: "Emma Davis", email: "emma@email.com", phone: "+1 (555) 456-7890", type: "regular", status: "approved", partySize: 3, reservedDate: "2024-01-26" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/nightlife")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Guest List</h1>
            <p className="text-muted-foreground">Manage VIP guests and reservations</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/nightlife/guest-list/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Guest
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
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
                <p className="text-sm text-muted-foreground">Total Guests</p>
                <p className="text-2xl font-bold">{guests.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">VIP Guests</p>
                <p className="text-2xl font-bold">{guests.filter(g => g.type === "vip").length}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{guests.filter(g => g.status === "approved").length}</p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{guests.filter(g => g.status === "pending").length}</p>
              </div>
              <Users className="h-8 w-8 text-yellow-600" />
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
                  <th className="py-3 px-4 font-medium" scope="col">Guest Name</th>
                  <th className="py-3 px-4 font-medium" scope="col">Contact</th>
                  <th className="py-3 px-4 font-medium" scope="col">Type</th>
                  <th className="py-3 px-4 font-medium" scope="col">Party Size</th>
                  <th className="py-3 px-4 font-medium" scope="col">Date</th>
                  <th className="py-3 px-4 font-medium" scope="col">Notes</th>
                  <th className="py-3 px-4 font-medium" scope="col">Status</th>
                  <th className="py-3 px-4 font-medium" scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr key={guest.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{guest.name}</td>
                    <td className="py-3 px-4">
                      <div className="space-y-1 text-sm">
                        <p className="truncate max-w-[180px]">{guest.email}</p>
                        <p className="text-muted-foreground">{guest.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={guest.type === "vip" ? "default" : guest.type === "blacklist" ? "destructive" : "outline"}>
                        {guest.type === "vip" && <Crown className="h-3 w-3 mr-1" />}
                        {guest.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-bold">{guest.partySize}</td>
                    <td className="py-3 px-4 text-sm">{guest.reservedDate}</td>
                    <td className="py-3 px-4 text-sm truncate max-w-[200px]">{guest.notes || "-"}</td>
                    <td className="py-3 px-4">
                      <Badge variant={guest.status === "approved" ? "default" : guest.status === "pending" ? "secondary" : "outline"}>
                        {guest.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/nightlife/guest-list/${guest.id}`)}>
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
