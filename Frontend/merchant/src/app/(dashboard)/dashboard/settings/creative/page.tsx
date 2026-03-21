'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Save, Clock, Users, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  serviceType: string;
  defaultBudget: number;
  defaultDuration: number;
  phases: TemplatePhase[];
  isActive: boolean;
}

interface TemplatePhase {
  id: string;
  name: string;
  duration: number;
  tasks: string[];
}

export default function CreativeAgencySettings() {
  const [activeTab, setActiveTab] = useState('templates');
  
  // Project Templates State
  const [templates, setTemplates] = useState<ProjectTemplate[]>([
    {
      id: '1',
      name: 'Website Design Project',
      description: 'Complete website design and development',
      serviceType: 'web-design',
      defaultBudget: 15000,
      defaultDuration: 6,
      phases: [
        { id: 'p1', name: 'Discovery', duration: 1, tasks: ['Client briefing', 'Research'] },
        { id: 'p2', name: 'Concept', duration: 2, tasks: ['Wireframes', 'Mood boards'] },
        { id: 'p3', name: 'Design', duration: 2, tasks: ['UI design', 'Revisions'] },
        { id: 'p4', name: 'Development', duration: 1, tasks: ['Build', 'Testing'] },
      ],
      isActive: true,
    },
    {
      id: '2',
      name: 'Brand Identity',
      description: 'Logo and brand guidelines creation',
      serviceType: 'branding',
      defaultBudget: 8000,
      defaultDuration: 4,
      phases: [],
      isActive: true,
    },
  ]);

  const [editingTemplate, setEditingTemplate] = useState<ProjectTemplate | null>(null);

  // Workflow Configuration State
  const [workflowStages, setWorkflowStages] = useState([
    { id: '1', name: 'Discovery', color: 'bg-blue-500', requiresApproval: false },
    { id: '2', name: 'Concept', color: 'bg-purple-500', requiresApproval: true },
    { id: '3', name: 'Production', color: 'bg-orange-500', requiresApproval: false },
    { id: '4', name: 'Review', color: 'bg-orange-500', requiresApproval: true },
    { id: '5', name: 'Delivered', color: 'bg-green-500', requiresApproval: false },
  ]);

  // Resource Planning State
  const [resourceSettings, setResourceSettings] = useState({
    workingHoursPerWeek: 40,
    maxAllocationsPerPerson: 3,
    autoAllocateEnabled: true,
    skillMatchingEnabled: true,
    overallocationThreshold: 100,
    utilizationTarget: 80,
  });

  // Time Tracking State
  const [timeTrackingSettings, setTimeTrackingSettings] = useState({
    minimumIncrement: 15,
    submissionDeadline: 'friday',
    requireApproval: true,
    lockPeriods: true,
    idleDetection: true,
    mobileTimerEnabled: true,
    billableCategories: ['client-work', 'meetings', 'research'],
    autoBillableRules: {
      clientCalls: true,
      presentations: true,
    },
  });

  const handleSaveTemplates = () => {
    toast.success('Project templates saved successfully');
  };

  const handleSaveWorkflow = () => {
    toast.success('Workflow configuration saved successfully');
  };

  const handleSaveResources = () => {
    toast.success('Resource planning settings saved successfully');
  };

  const handleSaveTimeTracking = () => {
    toast.success('Time tracking policies saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creative Agency Settings</h1>
          <p className="text-gray-500 mt-1">
            Configure project templates, workflows, and resource management
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Project Templates
          </TabsTrigger>
          <TabsTrigger value="workflow" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2">
            <Users className="h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="time" className="gap-2">
            <Clock className="h-4 w-4" />
            Time Tracking
          </TabsTrigger>
        </TabsList>

        {/* Tab Content: Project Templates */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Project Templates</CardTitle>
                  <CardDescription>
                    Create reusable templates for different service types
                  </CardDescription>
                </div>
                <Button onClick={() => setEditingTemplate({
                  id: '',
                  name: '',
                  description: '',
                  serviceType: '',
                  defaultBudget: 0,
                  defaultDuration: 0,
                  phases: [],
                  isActive: true,
                })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border rounded-lg bg-white hover:bg-green-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          {template.isActive && (
                            <Badge variant="secondary">Active</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Budget: ${template.defaultBudget.toLocaleString()}</span>
                          <span>Duration: {template.defaultDuration} weeks</span>
                          <span>Phases: {template.phases.length}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          setTemplates(templates.filter(t => t.id !== template.id));
                          toast.success('Template deleted');
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveTemplates}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Content: Workflow Configuration */}
        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Stages</CardTitle>
              <CardDescription>
                Define the stages projects go through from start to finish
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflowStages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className={`w-4 h-4 rounded-full ${stage.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Input
                          value={stage.name}
                          onChange={(e) => {
                            const updated = [...workflowStages];
                            updated[index].name = e.target.value;
                            setWorkflowStages(updated);
                          }}
                          className="w-64"
                        />
                        <ArrowRight className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`approval-${stage.id}`} className="text-sm">
                        Requires Approval
                      </Label>
                      <Switch
                        id={`approval-${stage.id}`}
                        checked={stage.requiresApproval}
                        onCheckedChange={(checked) => {
                          const updated = [...workflowStages];
                          updated[index].requiresApproval = checked;
                          setWorkflowStages(updated);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveWorkflow}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Content: Resource Planning */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Planning Settings</CardTitle>
              <CardDescription>
                Configure team capacity and allocation rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="workingHours">Working Hours per Week</Label>
                  <Input
                    id="workingHours"
                    type="number"
                    value={resourceSettings.workingHoursPerWeek}
                    onChange={(e) => setResourceSettings({
                      ...resourceSettings,
                      workingHoursPerWeek: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAllocations">Max Projects per Person</Label>
                  <Input
                    id="maxAllocations"
                    type="number"
                    value={resourceSettings.maxAllocationsPerPerson}
                    onChange={(e) => setResourceSettings({
                      ...resourceSettings,
                      maxAllocationsPerPerson: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utilizationTarget">Utilization Target (%)</Label>
                  <Input
                    id="utilizationTarget"
                    type="number"
                    value={resourceSettings.utilizationTarget}
                    onChange={(e) => setResourceSettings({
                      ...resourceSettings,
                      utilizationTarget: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overallocationThreshold">Overallocation Threshold (%)</Label>
                  <Input
                    id="overallocationThreshold"
                    type="number"
                    value={resourceSettings.overallocationThreshold}
                    onChange={(e) => setResourceSettings({
                      ...resourceSettings,
                      overallocationThreshold: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Allocation Suggestions</Label>
                    <p className="text-sm text-gray-500">
                      Automatically suggest resource assignments based on skills
                    </p>
                  </div>
                  <Switch
                    checked={resourceSettings.autoAllocateEnabled}
                    onCheckedChange={(checked) => setResourceSettings({
                      ...resourceSettings,
                      autoAllocateEnabled: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Skill-Based Matching</Label>
                    <p className="text-sm text-gray-500">
                      Match team members to projects based on skills
                    </p>
                  </div>
                  <Switch
                    checked={resourceSettings.skillMatchingEnabled}
                    onCheckedChange={(checked) => setResourceSettings({
                      ...resourceSettings,
                      skillMatchingEnabled: checked
                    })}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveResources}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Resource Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Content: Time Tracking */}
        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Tracking Policies</CardTitle>
              <CardDescription>
                Configure timesheet rules and time entry settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minIncrement">Minimum Increment (minutes)</Label>
                  <Select
                    value={timeTrackingSettings.minimumIncrement.toString()}
                    onValueChange={(value) => setTimeTrackingSettings({
                      ...timeTrackingSettings,
                      minimumIncrement: parseInt(value)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 minutes (0.1h)</SelectItem>
                      <SelectItem value="15">15 minutes (0.25h)</SelectItem>
                      <SelectItem value="30">30 minutes (0.5h)</SelectItem>
                      <SelectItem value="60">60 minutes (1h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submissionDeadline">Submission Deadline</Label>
                  <Select
                    value={timeTrackingSettings.submissionDeadline}
                    onValueChange={(value: any) => setTimeTrackingSettings({
                      ...timeTrackingSettings,
                      submissionDeadline: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friday">Friday EOD</SelectItem>
                      <SelectItem value="monday">Monday EOD</SelectItem>
                      <SelectItem value="sunday">Sunday EOD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Manager Approval</Label>
                    <p className="text-sm text-gray-500">
                      Timesheets must be approved before billing
                    </p>
                  </div>
                  <Switch
                    checked={timeTrackingSettings.requireApproval}
                    onCheckedChange={(checked) => setTimeTrackingSettings({
                      ...timeTrackingSettings,
                      requireApproval: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Lock Periods After Submission</Label>
                    <p className="text-sm text-gray-500">
                      Prevent edits after timesheet is submitted
                    </p>
                  </div>
                  <Switch
                    checked={timeTrackingSettings.lockPeriods}
                    onCheckedChange={(checked) => setTimeTrackingSettings({
                      ...timeTrackingSettings,
                      lockPeriods: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Idle Detection</Label>
                    <p className="text-sm text-gray-500">
                      Detect and alert when timer is idle
                    </p>
                  </div>
                  <Switch
                    checked={timeTrackingSettings.idleDetection}
                    onCheckedChange={(checked) => setTimeTrackingSettings({
                      ...timeTrackingSettings,
                      idleDetection: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mobile Timer Support</Label>
                    <p className="text-sm text-gray-500">
                      Enable timer on mobile devices
                    </p>
                  </div>
                  <Switch
                    checked={timeTrackingSettings.mobileTimerEnabled}
                    onCheckedChange={(checked) => setTimeTrackingSettings({
                      ...timeTrackingSettings,
                      mobileTimerEnabled: checked
                    })}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveTimeTracking}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Time Tracking Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
