/**
 * Professional Services - Tasks Management Page
 * Manage project tasks, assignments, and deadlines
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckSquare, Plus, Calendar, User } from "lucide-react";
import { useState } from "react";

interface Task {
  id: string;
  title: string;
  projectName: string;
  assignee: string;
  dueDate: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in-progress" | "review" | "done";
  completed: boolean;
}

export default function ProfessionalServicesTasksPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const tasks: Task[] = [
    { id: "1", title: "Design homepage mockup", projectName: "Website Redesign", assignee: "Alex T.", dueDate: "2024-01-18", priority: "high", status: "in-progress", completed: false },
    { id: "2", title: "Write content strategy", projectName: "Brand Strategy", assignee: "Maria G.", dueDate: "2024-01-22", priority: "medium", status: "todo", completed: false },
    { id: "3", title: "Setup analytics tracking", projectName: "Marketing Campaign", assignee: "James L.", dueDate: "2024-01-17", priority: "urgent", status: "in-progress", completed: false },
    { id: "4", title: "Client presentation deck", projectName: "SEO Optimization", assignee: "Sophie B.", dueDate: "2024-01-15", priority: "high", status: "done", completed: true },
  ];

  const filteredTasks = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/professional-services")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">Track project tasks and assignments</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/professional-services/tasks/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="done">Done</TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckSquare className={`h-5 w-5 ${task.completed ? 'text-green-600 fill-green-600' : 'text-muted-foreground'}`} />
                      <span className={`font-semibold ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
                      <Badge variant={task.priority === "urgent" ? "destructive" : task.priority === "high" ? "secondary" : "outline"}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{task.assignee}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{task.dueDate}</span>
                      </div>
                      <div className="text-muted-foreground">{task.projectName}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/professional-services/tasks/${task.id}`)}>
                      View
                    </Button>
                    {!task.completed && (
                      <Button size="sm">Complete</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
