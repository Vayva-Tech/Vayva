/**
 * Wellness - Trainers & Staff Management Page
 * Manage fitness trainers, instructors, and their schedules
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Plus, Mail, Phone } from "lucide-react";

interface Trainer {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  email: string;
  phone: string;
  classesPerWeek: number;
  rating: number;
  status: "active" | "inactive" | "on-leave";
}

export default function WellnessTrainersPage() {
  const router = useRouter();

  const trainers: Trainer[] = [
    { id: "1", name: "Mike Johnson", role: "Head Trainer", specialties: ["CrossFit", "Strength Training", "HIIT"], email: "mike.j@wellness.com", phone: "+1 (555) 123-4567", classesPerWeek: 12, rating: 4.9, status: "active" },
    { id: "2", name: "Sarah Chen", role: "Yoga Instructor", specialties: ["Vinyasa Yoga", "Meditation", "Flexibility"], email: "sarah.c@wellness.com", phone: "+1 (555) 234-5678", classesPerWeek: 10, rating: 4.8, status: "active" },
    { id: "3", name: "Alex Brown", role: "Fitness Coach", specialties: ["HIIT", "Cardio", "Weight Loss"], email: "alex.b@wellness.com", phone: "+1 (555) 345-6789", classesPerWeek: 8, rating: 4.7, status: "active" },
    { id: "4", name: "Emma Wilson", role: "Spin Instructor", specialties: ["Cycling", "Endurance", "Nutrition"], email: "emma.w@wellness.com", phone: "+1 (555) 456-7890", classesPerWeek: 9, rating: 4.8, status: "active" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/wellness")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Trainers & Staff</h1>
            <p className="text-muted-foreground">Manage fitness team and schedules</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/wellness/trainers/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Trainer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Trainers</p>
                <p className="text-2xl font-bold">{trainers.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{trainers.filter(t => t.status === "active").length}</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{(trainers.reduce((acc, t) => acc + t.rating, 0) / trainers.length).toFixed(1)}</p>
              </div>
              <User className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Classes/Week</p>
                <p className="text-2xl font-bold">{trainers.reduce((acc, t) => acc + t.classesPerWeek, 0)}</p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trainers.map((trainer) => (
          <Card key={trainer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{trainer.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{trainer.role}</p>
                </div>
                <Badge variant={trainer.status === "active" ? "default" : trainer.status === "on-leave" ? "secondary" : "outline"}>
                  {trainer.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>{trainer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span>{trainer.phone}</span>
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Specialties:</p>
                <div className="flex flex-wrap gap-1">
                  {trainer.specialties.map((specialty, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{specialty}</Badge>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Classes/Week</p>
                  <p className="font-semibold text-lg">{trainer.classesPerWeek}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="font-semibold text-lg flex items-center gap-1">
                    ★ {trainer.rating}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/wellness/trainers/${trainer.id}`)}>
                  Profile
                </Button>
                <Button size="sm" className="flex-1" onClick={() => router.push(`/dashboard/wellness/trainers/${trainer.id}/schedule`)}>
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
