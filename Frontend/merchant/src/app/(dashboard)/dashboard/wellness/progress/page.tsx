/**
 * Wellness - Member Progress Tracking Page
 * Track fitness goals, body metrics, and transformation journeys
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Scale, Ruler } from "lucide-react";

interface MemberProgress {
  id: string;
  memberName: string;
  goalType: string;
  startDate: string;
  targetDate: string;
  currentWeight: number;
  targetWeight: number;
  weightUnit: string;
  progressPercentage: number;
  status: "on-track" | "behind" | "achieved";
}

export default function WellnessProgressPage() {
  const router = useRouter();

  const progress: MemberProgress[] = [
    { id: "1", memberName: "John Smith", goalType: "Weight Loss", startDate: "2024-01-01", targetDate: "2024-06-01", currentWeight: 185, targetWeight: 165, weightUnit: "lbs", progressPercentage: 65, status: "on-track" },
    { id: "2", memberName: "Emily Chen", goalType: "Muscle Gain", startDate: "2024-01-15", targetDate: "2024-07-15", currentWeight: 135, targetWeight: 145, weightUnit: "lbs", progressPercentage: 45, status: "on-track" },
    { id: "3", memberName: "Mike Wilson", goalType: "Weight Loss", startDate: "2023-12-01", targetDate: "2024-05-01", currentWeight: 210, targetWeight: 180, weightUnit: "lbs", progressPercentage: 80, status: "achieved" },
    { id: "4", memberName: "Sarah Johnson", goalType: "Maintenance", startDate: "2024-01-10", targetDate: "2024-12-10", currentWeight: 140, targetWeight: 140, weightUnit: "lbs", progressPercentage: 100, status: "on-track" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/wellness")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Member Progress</h1>
            <p className="text-muted-foreground">Track fitness goals and transformations</p>
          </div>
        </div>
        <Button variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold">847</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Goals Achieved</p>
                <p className="text-2xl font-bold">234</p>
              </div>
              <Scale className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold">523</p>
              </div>
              <Ruler className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Behind</p>
                <p className="text-2xl font-bold">90</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600 rotate-180" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {progress.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{item.memberName}</h3>
                    <p className="text-sm text-muted-foreground">{item.goalType}</p>
                  </div>
                  <Badge variant={item.status === "achieved" ? "default" : item.status === "on-track" ? "secondary" : "destructive"}>
                    {item.status.replace("-", " ")}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current:</span>
                    <span className="ml-2 font-medium">{item.currentWeight} {item.weightUnit}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target:</span>
                    <span className="ml-2 font-medium">{item.targetWeight} {item.weightUnit}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Timeline:</span>
                    <span className="ml-2 font-medium">{item.startDate.split('-')[1]}/{item.targetDate.split('-')[1]}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{item.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.progressPercentage >= 75 ? 'bg-green-500' : item.progressPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${item.progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/wellness/progress/${item.id}`)}>
                    View Details
                  </Button>
                  <Button size="sm" onClick={() => router.push(`/dashboard/wellness/progress/${item.id}/update`)}>
                    Update Progress
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
