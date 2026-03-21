"use client";

import { useState, useMemo } from "react";
import { Button, Input, Label } from "@vayva/ui";
import { Plus, Trash, CaretLeft as ChevronLeft, CaretRight as ChevronRight, Clock, User, Calendar as CalendarIcon } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from "date-fns";

export interface StaffMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  color: string;
}

export interface Shift {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  note?: string;
}

interface StaffSchedulerProps {
  staff: StaffMember[];
  shifts: Shift[];
  onStaffChange: (staff: StaffMember[]) => void;
  onShiftsChange: (shifts: Shift[]) => void;
}

const STAFF_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#d946ef", // fuchsia
  "#f43f5e", // rose
];

export function StaffScheduler({
  staff,
  shifts,
  onStaffChange,
  onShiftsChange,
}: StaffSchedulerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const addStaff = () => {
    if (!newStaffName.trim()) {
      toast.error("Staff name is required");
      return;
    }

    const newMember: StaffMember = {
      id: crypto.randomUUID(),
      name: newStaffName.trim(),
      role: newStaffRole.trim() || "Staff",
      color: STAFF_COLORS[staff.length % STAFF_COLORS.length],
    };

    onStaffChange([...staff, newMember]);
    setNewStaffName("");
    setNewStaffRole("");
    setSelectedStaff(newMember.id);
  };

  const removeStaff = (id: string) => {
    onStaffChange(staff.filter((s) => s.id !== id));
    onShiftsChange(shifts.filter((s) => s.staffId !== id));
    if (selectedStaff === id) setSelectedStaff(null);
  };

  const addShift = (dateStr: string) => {
    if (!selectedStaff) {
      toast.error("Please select a staff member first");
      return;
    }

    const newShift: Shift = {
      id: crypto.randomUUID(),
      staffId: selectedStaff,
      date: dateStr,
      startTime: "09:00",
      endTime: "17:00",
    };

    onShiftsChange([...shifts, newShift]);
  };

  const removeShift = (shiftId: string) => {
    onShiftsChange(shifts.filter((s) => s.id !== shiftId));
  };

  const updateShift = (shiftId: string, updates: Partial<Shift>) => {
    onShiftsChange(
      shifts.map((s) => (s.id === shiftId ? { ...s, ...updates } : s)),
    );
  };

  const getShiftsForDay = (dateStr: string) => {
    return shifts.filter((s) => s.date === dateStr);
  };

  const getShiftsForStaffAndDay = (staffId: string, dateStr: string) => {
    return shifts.filter((s) => s.staffId === staffId && s.date === dateStr);
  };

  const formatDateKey = (date: Date) => format(date, "yyyy-MM-dd");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Staff Schedule</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium min-w-[120px] text-center">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Staff List */}
        <div className="w-full lg:w-64 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Staff ({staff.length})</h4>
          </div>

          <div className="space-y-2">
            {staff.map((member) => (
              <Button
                key={member.id}
                variant="ghost"
                onClick={() => setSelectedStaff(member.id)}
                className={`w-full flex items-center gap-2 p-2 rounded-lg border text-left transition-colors h-auto justify-start ${
                  selectedStaff === member.id
                    ? "border-green-500 bg-green-500/5"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: member.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{member.name}</p>
                  <p className="text-xs text-gray-400">{member.role}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    removeStaff(member.id);
                  }}
                  className="text-gray-400 hover:text-red-500 h-auto p-1"
                >
                  <Trash className="h-3.5 w-3.5" />
                </Button>
              </Button>
            ))}
          </div>

          {/* Add Staff */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <Input
              value={newStaffName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStaffName(e.target.value)}
              placeholder="Staff name"
              className="h-8 text-sm"
            />
            <Input
              value={newStaffRole}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStaffRole(e.target.value)}
              placeholder="Role (e.g., Stylist)"
              className="h-8 text-sm"
            />
            <Button size="sm" variant="outline" onClick={addStaff} className="w-full">
              <Plus className="h-3 w-3 mr-1" />
              Add Staff
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1">
          {/* Week View Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day.toString()}
                className="text-center py-2 text-xs font-medium text-gray-500"
              >
                {format(day, "EEE")}
                <div className="text-lg font-semibold text-gray-900">
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* Week View Shifts */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => {
              const dateKey = formatDateKey(day);
              const dayShifts = getShiftsForDay(dateKey);

              return (
                <div
                  key={day.toString()}
                  className={`min-h-[120px] p-2 rounded-lg border ${
                    isSameDay(day, new Date())
                      ? "border-green-500 bg-green-500/5"
                      : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">
                      {dayShifts.length} shifts
                    </span>
                    <Button
                      onClick={() => addShift(dateKey)}
                      disabled={!selectedStaff}
                      className="text-green-500 hover:bg-green-500/10 rounded p-0.5 disabled:opacity-30"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-1">
                    {dayShifts.map((shift) => {
                      const member = staff.find((s) => s.id === shift.staffId);
                      if (!member) return null;

                      return (
                        <div
                          key={shift.id}
                          className="p-1.5 rounded text-xs bg-white border border-gray-100"
                        >
                          <div className="flex items-center gap-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: member.color }}
                            />
                            <span className="font-medium truncate">
                              {member.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400 mt-1">
                            <Clock className="h-3 w-3" />
                            {shift.startTime} - {shift.endTime}
                          </div>
                          <div className="flex justify-end mt-1">
                            <Button
                              onClick={() => removeShift(shift.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Staff Shifts */}
      {selectedStaff && (
        <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-sm mb-3">
            Shifts for {staff.find((s) => s.id === selectedStaff)?.name}
          </h4>
          <div className="flex flex-wrap gap-2">
            {shifts
              .filter((s) => s.staffId === selectedStaff)
              .map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-100 text-sm"
                >
                  <span className="font-medium">
                    {format(new Date(shift.date), "MMM d")}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Input type="time"
                      value={shift.startTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateShift(shift.id, { startTime: e.target.value })
                      }
                      className="w-16 text-xs border-0 bg-transparent p-0"
                    />
                    <span>-</span>
                    <Input type="time"
                      value={shift.endTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateShift(shift.id, { endTime: e.target.value })
                      }
                      className="w-16 text-xs border-0 bg-transparent p-0"
                    />
                  </div>
                  <Button
                    onClick={() => removeShift(shift.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            {shifts.filter((s) => s.staffId === selectedStaff).length === 0 && (
              <p className="text-sm text-gray-400">
                No shifts assigned. Click the + button on a day to add shifts.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
