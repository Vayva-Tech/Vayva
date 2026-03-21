'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  RefreshCcw, 
  Trash2, 
  Edit, 
  Play,
  Clock,
  Mail,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface ScheduledReport {
  id: string;
  storeId: number;
  clientName: string;
  clientEmail: string;
  projectName: string;
  frequency: 'weekly' | 'monthly';
  lastSent?: Date;
  nextSend: Date;
  isActive: boolean;
}

export default function ScheduledReportsAdmin() {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReport, setNewReport] = useState({
    clientName: '',
    clientEmail: '',
    projectName: '',
    frequency: 'weekly' as 'weekly' | 'monthly',
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // In production: fetch from API
      // const response = await fetch('/api/reports/schedule');
      // const data = await response.json();
      
      // Mock data
      setReports([
        {
          id: '1',
          storeId: 1,
          clientName: 'Acme Corp',
          clientEmail: 'contact@acme.com',
          projectName: 'Website Redesign',
          frequency: 'weekly',
          lastSent: new Date('2024-03-04'),
          nextSend: new Date('2024-03-11'),
          isActive: true,
        },
        {
          id: '2',
          storeId: 1,
          clientName: 'TechStart',
          clientEmail: 'hello@techstart.io',
          projectName: 'Brand Identity',
          frequency: 'monthly',
          lastSent: new Date('2024-02-01'),
          nextSend: new Date('2024-03-01'),
          isActive: true,
        },
      ]);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    try {
      // In production: POST to API
      // await fetch('/api/reports/schedule', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newReport),
      // });

      toast.success('Report scheduled successfully');
      setShowCreateModal(false);
      setNewReport({ clientName: '', clientEmail: '', projectName: '', frequency: 'weekly' });
      fetchReports();
    } catch (error) {
      toast.error('Failed to schedule report');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      // In production: PATCH to API
      // await fetch(`/api/reports/schedule/${id}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ isActive }),
      // });

      setReports(reports.map(r => r.id === id ? { ...r, isActive } : r));
      toast.success(isActive ? 'Report activated' : 'Report deactivated');
    } catch (error) {
      toast.error('Failed to update report');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled report?')) return;

    try {
      // In production: DELETE to API
      // await fetch(`/api/reports/schedule/${id}`, { method: 'DELETE' });

      setReports(reports.filter(r => r.id !== id));
      toast.success('Report deleted successfully');
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleRunNow = async (id: string) => {
    try {
      // In production: POST to run endpoint
      // await fetch(`/api/reports/schedule/${id}/run`, { method: 'POST' });

      toast.success('Report sent successfully');
      fetchReports();
    } catch (error) {
      toast.error('Failed to send report');
    }
  };

  const stats = {
    total: reports.length,
    active: reports.filter(r => r.isActive).length,
    dueToday: reports.filter(r => {
      const today = new Date().toDateString();
      return new Date(r.nextSend).toDateString() === today;
    }).length,
    failed: 0, // Would calculate from email logs
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8 text-green-600" />
            Scheduled Reports
          </h1>
          <p className="text-gray-500 mt-1">
            Manage automated client report delivery
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.dueToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Failed (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>
            Automated reports sent to clients on schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Last Sent</TableHead>
                <TableHead>Next Send</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{report.clientName}</div>
                      <div className="text-sm text-gray-500">{report.clientEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{report.projectName}</TableCell>
                  <TableCell>
                    <Badge variant={report.frequency === 'weekly' ? 'default' : 'secondary'}>
                      {report.frequency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {report.lastSent ? (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        {new Date(report.lastSent).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-500">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {new Date(report.nextSend).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={report.isActive ? 'secondary' : 'outline'}>
                      {report.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunNow(report.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(report.id, !report.isActive)}
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(report.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Schedule New Report</CardTitle>
              <CardDescription>
                Set up automated reports for a client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={newReport.clientName}
                  onChange={(e) => setNewReport({...newReport, clientName: e.target.value})}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newReport.clientEmail}
                  onChange={(e) => setNewReport({...newReport, clientEmail: e.target.value})}
                  placeholder="client@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={newReport.projectName}
                  onChange={(e) => setNewReport({...newReport, projectName: e.target.value})}
                  placeholder="Website Redesign"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={newReport.frequency}
                  onValueChange={(value: any) => setNewReport({...newReport, frequency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReport}>
                  Schedule Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
