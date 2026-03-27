"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  MapPin,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatDate } from "@vayva/shared";

interface VolunteerShift {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  volunteersNeeded: number;
  volunteersAssigned: string[];
  status: string;
  createdAt: string;
}

interface Volunteer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function VolunteerScheduler() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState<VolunteerShift[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<VolunteerShift | null>(null);

  useEffect(() => {
    fetchShiftsAndVolunteers();
  }, []);

  const fetchShiftsAndVolunteers = async () => {
    try {
      setLoading(true);
      const [shiftsRes, volunteersRes] = await Promise.all([
        apiJson<{ data: any[] }>("/api/nonprofit/volunteers/shifts"),
        apiJson<{ data: any[] }>("/api/nonprofit/volunteers"),
      ]);

      setShifts(shiftsRes.data || []);
      setVolunteers(volunteersRes.data || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_SCHEDULER_ERROR]", { error: _errMsg });
      toast.error("Failed to load scheduler");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return daysInMonth;
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getShiftsForDay = (day: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.startDate);
      return (
        shiftDate.getDate() === checkDate.getDate() &&
        shiftDate.getMonth() === checkDate.getMonth() &&
        shiftDate.getFullYear() === checkDate.getFullYear()
      );
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleCreateShift = async (formData: FormData) => {
    try {
      await apiJson("/api/nonprofit/volunteers/shifts", {
        method: "POST",
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          startDate: formData.get("startDate"),
          endDate: formData.get("endDate"),
          startTime: formData.get("startTime"),
          endTime: formData.get("endTime"),
          location: formData.get("location"),
          volunteersNeeded: parseInt(formData.get("volunteersNeeded") as string),
          status: "scheduled",
        }),
      });

      toast.success("Shift created successfully");
      setIsCreateDialogOpen(false);
      fetchShiftsAndVolunteers();
    } catch (error: unknown) {
      logger.error("[CREATE_SHIFT_ERROR]", { error });
      toast.error("Failed to create shift");
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      await apiJson(`/api/nonprofit/volunteers/shifts/${shiftId}`, { method: "DELETE" });
      toast.success("Shift deleted");
      fetchShiftsAndVolunteers();
    } catch (error: unknown) {
      logger.error("[DELETE_SHIFT_ERROR]", { error });
      toast.error("Failed to delete shift");
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50 border border-gray-200" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayShifts = getShiftsForDay(day);
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === currentDate.getMonth() &&
        new Date().getFullYear() === currentDate.getFullYear();

      days.push(
        <div
          key={day}
          className={`h-32 border border-gray-200 p-2 overflow-hidden ${
            isToday ? "bg-blue-50" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-semibold ${isToday ? "text-blue-600" : "text-gray-700"}`}>
              {day}
            </span>
            {dayShifts.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {dayShifts.length} shift{dayShifts.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {dayShifts.slice(0, 3).map((shift) => (
              <div
                key={shift.id}
                className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded truncate cursor-pointer hover:bg-green-200"
                onClick={() => setSelectedShift(shift)}
              >
                {shift.startTime} - {shift.title}
              </div>
            ))}
            {dayShifts.length > 3 && (
              <div className="text-xs text-gray-500 pl-2">+{dayShifts.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button variant="outline" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Shift
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Volunteer Shift</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateShift(new FormData(e.currentTarget)); }} className="space-y-4">
              <div>
                <Label htmlFor="title">Shift Title</Label>
                <Input id="title" name="title" required placeholder="e.g., Event Setup Crew" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Shift responsibilities..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" required />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="date" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" name="startTime" type="time" required />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" name="endTime" type="time" required />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="Event location or address" />
              </div>
              <div>
                <Label htmlFor="volunteersNeeded">Volunteers Needed</Label>
                <Input id="volunteersNeeded" name="volunteersNeeded" type="number" min="1" defaultValue="5" required />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Create Shift</Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {weekDays.map((day) => (
          <div key={day} className="bg-gray-50 p-2 text-center font-semibold text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">{renderCalendarDays()}</div>

      {/* Shift Details Dialog */}
      {selectedShift && (
        <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedShift.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-700">{selectedShift.description || "No description"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" /> Start
                  </p>
                  <p className="font-medium">{formatDate(selectedShift.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Time
                  </p>
                  <p className="font-medium">
                    {selectedShift.startTime} - {selectedShift.endTime}
                  </p>
                </div>
              </div>
              {selectedShift.location && (
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> Location
                  </p>
                  <p className="font-medium">{selectedShift.location}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Users className="h-4 w-4" /> Volunteers
                </p>
                <p className="font-medium">
                  {selectedShift.volunteersAssigned.length} / {selectedShift.volunteersNeeded} assigned
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push(`/dashboard/nonprofit/volunteers/schedule?edit=${selectedShift.id}`);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="text-red-500"
                  onClick={() => handleDeleteShift(selectedShift.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setSelectedShift(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Total Shifts</p>
              <p className="text-xl font-bold">{shifts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Upcoming Shifts</p>
              <p className="text-xl font-bold">
                {shifts.filter((s) => new Date(s.startDate) > new Date()).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-xl font-bold">{getShiftsForDay(getDaysInMonth(currentDate)).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
