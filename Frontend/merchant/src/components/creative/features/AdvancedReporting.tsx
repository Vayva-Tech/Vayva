'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  Calendar,
  Download,
  Edit3,
  FileSpreadsheet,
  Filter,
  PieChart,
  Plus,
  Trash2,
  TrendingUp,
  Eye,
} from "lucide-react";
import { toast } from 'sonner';

interface ReportConfig {
  id: string;
  name: string;
  type: string;
  metrics: string[];
  dateRange: string;
  groupBy?: string;
  filters: Array<{ field: string; operator: string; value: string }>;
}

export default function AdvancedReporting() {
  const [activeTab, setActiveTab] = useState('builder');
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    id: '1',
    name: 'Q1 2024 Performance Report',
    type: 'financial',
    metrics: ['revenue', 'expenses', 'profit_margin'],
    dateRange: 'last_quarter',
    groupBy: 'month',
    filters: []
  });

  const reportTemplates = [
    { id: '1', name: 'Monthly Financial Summary', type: 'Financial', lastRun: '2024-03-01' },
    { id: '2', name: 'Project Profitability Analysis', type: 'Projects', lastRun: '2024-02-28' },
    { id: '3', name: 'Team Utilization Report', type: 'Resources', lastRun: '2024-03-05' },
    { id: '4', name: 'Client Satisfaction Metrics', type: 'Clients', lastRun: '2024-03-01' },
  ];

  const metricOptions = [
    { value: 'revenue', label: 'Revenue' },
    { value: 'expenses', label: 'Expenses' },
    { value: 'profit_margin', label: 'Profit Margin' },
    { value: 'hours_billed', label: 'Hours Billed' },
    { value: 'utilization_rate', label: 'Utilization Rate' },
    { value: 'project_count', label: 'Project Count' },
    { value: 'client_satisfaction', label: 'Client Satisfaction' },
  ];

  const handleAddFilter = () => {
    setReportConfig({
      ...reportConfig,
      filters: [...reportConfig.filters, { field: '', operator: 'equals', value: '' }]
    });
  };

  const handleRemoveFilter = (index: number) => {
    setReportConfig({
      ...reportConfig,
      filters: reportConfig.filters.filter((_, i) => i !== index)
    });
  };

  const handleExport = (format: string) => {
    toast.success(`Report exported as ${format.toUpperCase()}`);
  };

  const handleRunReport = () => {
    toast.success('Report generated successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-green-500" />
            Advanced Reporting
          </h1>
          <p className="text-gray-500 mt-1">
            Custom report builder and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button
          variant={activeTab === 'builder' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('builder')}
        >
          Report Builder
        </Button>
        <Button
          variant={activeTab === 'templates' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('templates')}
        >
          Saved Templates
        </Button>
      </div>

      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>
                Build your custom report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportName">Report Name</Label>
                <Input
                  id="reportName"
                  value={reportConfig.name}
                  onChange={(e) => setReportConfig({...reportConfig, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select
                  value={reportConfig.type}
                  onValueChange={(value) => setReportConfig({...reportConfig, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="projects">Projects</SelectItem>
                    <SelectItem value="resources">Resources</SelectItem>
                    <SelectItem value="clients">Clients</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateRange">Date Range</Label>
                <Select
                  value={reportConfig.dateRange}
                  onValueChange={(value) => setReportConfig({...reportConfig, dateRange: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_week">Last Week</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="last_quarter">Last Quarter</SelectItem>
                    <SelectItem value="ytd">Year to Date</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupBy">Group By</Label>
                <Select
                  value={reportConfig.groupBy}
                  onValueChange={(value) => setReportConfig({...reportConfig, groupBy: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Metrics</Label>
                <div className="space-y-2">
                  {metricOptions.map((metric) => (
                    <div key={metric.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={metric.value}
                        checked={reportConfig.metrics.includes(metric.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setReportConfig({
                              ...reportConfig,
                              metrics: [...reportConfig.metrics, metric.value]
                            });
                          } else {
                            setReportConfig({
                              ...reportConfig,
                              metrics: reportConfig.metrics.filter(m => m !== metric.value)
                            });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={metric.value} className="font-normal">
                        {metric.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Filters</Label>
                  <Button variant="outline" size="sm" onClick={handleAddFilter}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Filter
                  </Button>
                </div>
                <div className="space-y-2">
                  {reportConfig.filters.map((filter, index) => (
                    <div key={index} className="flex gap-2">
                      <Select
                        value={filter.field}
                        onValueChange={(value) => {
                          const newFilters = [...reportConfig.filters];
                          newFilters[index].field = value;
                          setReportConfig({...reportConfig, filters: newFilters});
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="project">Project</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="team_member">Team Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFilter(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={handleRunReport}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>
                Live preview of your report data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">$187K</p>
                        <p className="text-xs text-gray-500">Revenue</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-500">$124K</p>
                        <p className="text-xs text-gray-500">Expenses</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-500">68%</p>
                        <p className="text-xs text-gray-500">Profit Margin</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-500">24</p>
                        <p className="text-xs text-gray-500">Projects</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Placeholder */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                        <TrendingUp className="h-12 w-12 text-gray-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Expense Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                        <PieChart className="h-12 w-12 text-gray-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Data Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Detailed Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Month</th>
                            <th className="text-right p-2">Revenue</th>
                            <th className="text-right p-2">Expenses</th>
                            <th className="text-right p-2">Margin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { month: 'Jan', revenue: 58000, expenses: 38000, margin: 34 },
                            { month: 'Feb', revenue: 62000, expenses: 41000, margin: 34 },
                            { month: 'Mar', revenue: 67000, expenses: 45000, margin: 33 },
                          ].map((row, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="p-2">{row.month}</td>
                              <td className="text-right p-2">${row.revenue.toLocaleString()}</td>
                              <td className="text-right p-2">${row.expenses.toLocaleString()}</td>
                              <td className="text-right p-2">{row.margin}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'templates' && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Report Templates</CardTitle>
            <CardDescription>
              Pre-configured reports for quick insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {reportTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border rounded-lg hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="secondary">{template.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Last run: {new Date(template.lastRun).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="default" size="sm">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Run
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
