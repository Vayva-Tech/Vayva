/**
 * Wellness - Classes Management Page
 * Manage group fitness classes, schedules, and instructors
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Clock, Calendar, Plus } from "lucide-react";

interface ClassItem {
  id: string;
  name: string;
  instructor: string;
  schedule: string[];
  capacity: number;
  enrolled: number;
  duration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "active" | "inactive";
}

export default function WellnessClassesPage() {
  const router = useRouter();

  const classes: ClassItem[] = [
    { id: "1", name: "CrossFit WOD", instructor: "Mike Johnson", schedule: ["Mon 6:00 AM", "Wed 6:00 AM", "Fri 6:00 AM"], capacity: 20, enrolled: 18, duration: 60, difficulty: "advanced", status: "active" },
    { id: "2", name: "Yoga Flow", instructor: "Sarah Chen", schedule: ["Tue 7:00 AM", "Thu 7:00 AM"], capacity: 25, enrolled: 22, duration: 90, difficulty: "beginner", status: "active" },
    { id: "3", name: "HIIT Training", instructor: "Alex Brown", schedule: ["Mon 5:00 PM", "Wed 5:00 PM"], capacity: 15, enrolled: 15, duration: 45, difficulty: "intermediate", status: "active" },
    { id: "4", name: "Spin Class", instructor: "Emma Wilson", schedule: ["Tue 6:00 PM", "Thu 6:00 PM"], capacity: 20, enrolled: 12, duration: 45, difficulty: "intermediate", status: "active" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/wellness")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Group Classes</h1>
            <p className="text-muted-foreground">Manage fitness class schedules and enrollment</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/wellness/classes/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{classItem.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {classItem.instructor}
                  </p>
                </div>
                <Badge variant={classItem.difficulty === "advanced" ? "destructive" : classItem.difficulty === "intermediate" ? "secondary" : "default"}>
                  {classItem.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>{classItem.schedule.join(", ")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span>{classItem.duration} minutes</span>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Enrollment:</span>
                  <span className="font-medium">{classItem.enrolled}/{classItem.capacity}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${classItem.enrolled === classItem.capacity ? 'bg-red-500' : classItem.enrolled > classItem.capacity * 0.8 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${(classItem.enrolled / classItem.capacity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/wellness/classes/${classItem.id}`)}>
                  Edit
                </Button>
                <Button size="sm" className="flex-1" onClick={() => router.push(`/dashboard/wellness/classes/${classItem.id}/roster`)}>
                  Roster
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
