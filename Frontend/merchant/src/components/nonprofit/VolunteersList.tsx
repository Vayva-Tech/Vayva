'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Volunteer, VolunteerShift, VolunteerStatus } from '@/types/phase4-industry';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Users, 
  Calendar, 
  Mail, 
  Check, 
  Clock,
  Award,
  Filter,
  Download,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CreateVolunteerDialog } from './CreateVolunteerDialog';

const statusColors: Record<VolunteerStatus, string> = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  suspended: 'bg-red-500',
};

export function VolunteersList() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [shifts, setShifts] = useState<VolunteerShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VolunteerStatus | 'all'>('all');
  const [skillsFilter, setSkillsFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchVolunteers();
    fetchShifts();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await fetch('/nonprofit/volunteers');
      if (response.ok) {
        const data = await response.json();
        setVolunteers(data.volunteers || []);
      }
    } catch (error) {
      logger.error('[VolunteersList] Failed to fetch volunteers:', { error });
    }
  };

  const fetchShifts = async () => {
    try {
      const response = await fetch('/nonprofit/volunteers/shifts');
      if (response.ok) {
        const data = await response.json();
        setShifts(data.shifts || []);
      }
    } catch (error) {
      logger.error('[VolunteersList] Failed to fetch shifts:', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = [
        "Name",
        "Email",
        "Status",
        "Total Hours",
        "Shifts Completed",
        "Skills",
        "Joined Date",
      ];

      const csvData = filteredVolunteers.map((volunteer) => [
        `${volunteer.firstName} ${volunteer.lastName}`,
        volunteer.email,
        volunteer.status,
        (volunteer as any).totalHours || 0,
        (volunteer as any).shiftsCompleted || 0,
        (volunteer.skills || []).join("; "),
        new Date(volunteer.createdAt).toLocaleDateString(),
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...csvData.map((row) => row.join(","))].join("\\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `volunteers_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Volunteers exported successfully!");
    } catch (error: unknown) {
      logger.error("[EXPORT_CSV_ERROR]", { error });
      toast.error("Failed to export volunteers");
    }
  };

  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesSearch =
      volunteer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || volunteer.status === statusFilter;
    const matchesSkills = skillsFilter === 'all' || 
      (volunteer.skills && volunteer.skills.includes(skillsFilter));
    const matchesAvailability = availabilityFilter === 'all' || 
      (volunteer.availability && Object.keys(volunteer.availability).length > 0);
    return matchesSearch && matchesStatus && matchesSkills && matchesAvailability;
  });

  const activeVolunteers = volunteers.filter((v) => v.status === 'active').length;
  const totalHours = volunteers.reduce((sum: number, v) => sum + ((v as any).totalHours || 0), 0);
  const upcomingShifts = shifts.filter((s) => new Date(s.startTime) > new Date()).length;

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading volunteers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Volunteer Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dashboard/nonprofit/volunteers/schedule'}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Volunteer
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Total Volunteers</p>
            <p className="text-2xl font-bold">{volunteers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Active Volunteers</p>
            <p className="text-2xl font-bold text-green-600">{activeVolunteers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Total Hours</p>
            <p className="text-2xl font-bold">{totalHours}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Upcoming Shifts</p>
            <p className="text-2xl font-bold text-blue-600">{upcomingShifts}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as VolunteerStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={skillsFilter} onValueChange={(value: string) => setSkillsFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                <SelectItem value="leadership">Leadership</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="physical">Physical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={(value: string) => setAvailabilityFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="available">Has Availability</SelectItem>
                <SelectItem value="unavailable">No Availability Set</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-semibold">Volunteers</h3>
          {filteredVolunteers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No volunteers found</p>
              </CardContent>
            </Card>
          ) : (
            filteredVolunteers.map((volunteer) => (
              <Card key={volunteer.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">
                        {volunteer.firstName} {volunteer.lastName}
                      </h4>
                      <p className="text-sm text-gray-500">{volunteer.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={statusColors[volunteer.status]}>{volunteer.status}</Badge>
                        <span className="text-xs text-gray-500">
                          {(volunteer as any).totalHours || 0} hours
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Upcoming Shifts</h3>
          {shifts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No shifts scheduled</p>
              </CardContent>
            </Card>
          ) : (
            shifts
              .filter((s) => new Date(s.startTime) > new Date())
              .slice(0, 5)
              .map((shift) => (
                <Card key={shift.id}>
                  <CardContent className="p-4">
                    <h4 className="font-semibold">{shift.title}</h4>
                    <p className="text-sm text-gray-500">
                      {formatDate(shift.startTime)} - {formatDate(shift.endTime)}
                    </p>
                    {shift.location && (
                      <p className="text-sm text-gray-500">{shift.location}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Users className="h-3 w-3" />
                      <span className="text-sm">
                        {shift.volunteersAssigned.length} / {shift.volunteersNeeded} volunteers
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </div>

      <CreateVolunteerDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          fetchVolunteers();
        }}
      />
    </div>
  );
}
