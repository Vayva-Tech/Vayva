'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  MessageSquare, 
  FileText, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

interface ClientProject {
  id: string;
  name: string;
  status: string;
  progress: number;
  nextMilestone: string;
  budget: number;
  spent: number;
  timeline: { start: string; end: string };
  team: Array<{ name: string; role: string }>;
  recentFiles: Array<{ name: string; type: string; date: string }>;
  messages: Array<{ from: string; text: string; date: string; unread: boolean }>;
}

export default function ClientPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock client data - in production, this would come from API
  const projects: ClientProject[] = [
    {
      id: '1',
      name: 'Website Redesign',
      status: 'in-progress',
      progress: 65,
      nextMilestone: 'Design Review - Mar 15',
      budget: 25000,
      spent: 16250,
      timeline: { start: '2024-02-01', end: '2024-04-30' },
      team: [
        { name: 'Sarah Chen', role: 'Designer' },
        { name: 'Mike R.', role: 'Developer' }
      ],
      recentFiles: [
        { name: 'Homepage_v3.pdf', type: 'PDF', date: '2024-03-08' },
        { name: 'Brand_Guidelines.pdf', type: 'PDF', date: '2024-03-05' }
      ],
      messages: [
        { from: 'Sarah Chen', text: 'New designs are ready for review!', date: '2 hours ago', unread: true }
      ]
    },
    {
      id: '2',
      name: 'Brand Identity',
      status: 'review',
      progress: 90,
      nextMilestone: 'Final Delivery - Mar 20',
      budget: 15000,
      spent: 14200,
      timeline: { start: '2024-01-15', end: '2024-03-20' },
      team: [
        { name: 'Jessica P.', role: 'Brand Designer' }
      ],
      recentFiles: [
        { name: 'Logo_Package.zip', type: 'ZIP', date: '2024-03-07' }
      ],
      messages: []
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'in-progress': 'bg-blue-500',
      'review': 'bg-amber-500',
      'completed': 'bg-green-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Client Portal</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, Acme Corp
            </p>
          </div>
        </div>
        <Button onClick={() => toast.info('Message composer coming soon')}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Contact Team
        </Button>
      </div>

      {/* Active Projects */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Active Projects</h2>
        <div className="grid gap-6">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{project.name}</CardTitle>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <CardDescription>
                      Timeline: {new Date(project.timeline.start).toLocaleDateString()} - {new Date(project.timeline.end).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="text-lg font-bold">{formatCurrency(project.budget)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Overall Progress</span>
                    <span className="text-muted-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-3" />
                </div>

                {/* Next Milestone */}
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-semibold text-blue-700">Next Milestone</p>
                      <p className="text-sm text-blue-600">{project.nextMilestone}</p>
                    </div>
                  </div>
                </div>

                {/* Budget Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Spent</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(project.spent)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      of {formatCurrency(project.budget)} budget
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">On Track</span>
                    </div>
                    <p className="text-2xl font-bold">Yes</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Within budget & timeline
                    </p>
                  </div>
                </div>

                {/* Project Team */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Your Team
                  </h4>
                  <div className="flex gap-3">
                    {project.team.map((member, idx) => (
                      <div key={idx} className="p-3 border rounded-lg bg-card">
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Files */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Recent Files
                    </h4>
                    <Button variant="link" size="sm">View All</Button>
                  </div>
                  <div className="space-y-2">
                    {project.recentFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {file.type} • {new Date(file.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                {project.messages.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Recent Messages
                        {project.messages.filter(m => m.unread).length > 0 && (
                          <Badge variant="destructive">
                            {project.messages.filter(m => m.unread).length} new
                          </Badge>
                        )}
                      </h4>
                      <Button variant="link" size="sm">View All</Button>
                    </div>
                    <div className="space-y-2">
                      {project.messages.map((msg, idx) => (
                        <div key={idx} className={`p-3 border rounded-lg ${msg.unread ? 'bg-blue-500/10 border-blue-500/20' : ''}`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold">{msg.from}</p>
                            <p className="text-xs text-muted-foreground">{msg.date}</p>
                          </div>
                          <p className="text-sm">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Leave Feedback
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="default" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Approve Milestone
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{projects.length}</p>
              <p className="text-sm text-muted-foreground">Active Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {projects.reduce((sum, p) => sum + p.messages.filter(m => m.unread).length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Unread Messages</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {projects.reduce((sum, p) => sum + p.recentFiles.length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Files Shared</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
