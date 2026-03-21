'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, MessageSquare, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Survey {
  id: string;
  projectName: string;
  clientName: string;
  score?: number;
  status: 'pending' | 'sent' | 'completed';
  sentDate: string;
  responseDate?: string;
  feedback?: string;
}

export default function NPSSurveyFeature() {
  const [surveys, setSurveys] = useState<Survey[]>([
    {
      id: '1',
      projectName: 'Website Redesign',
      clientName: 'Acme Corp',
      score: 9,
      status: 'completed',
      sentDate: '2024-03-01',
      responseDate: '2024-03-02',
      feedback: 'Excellent work! Very professional team.',
    },
    {
      id: '2',
      projectName: 'Brand Identity',
      clientName: 'TechStart',
      score: 8,
      status: 'completed',
      sentDate: '2024-02-15',
      responseDate: '2024-02-16',
      feedback: 'Great experience, minor delays but worth it.',
    },
    {
      id: '3',
      projectName: 'Marketing Campaign',
      clientName: 'GlobalRetail',
      status: 'sent',
      sentDate: '2024-03-10',
    },
  ]);

  const [autoSurveysEnabled, setAutoSurveysEnabled] = useState(true);
  const [sendDelay, setSendDelay] = useState(1); // days after project completion

  // Calculate NPS
  const completedSurveys = surveys.filter(s => s.status === 'completed');
  const promoters = completedSurveys.filter(s => (s.score || 0) >= 9).length;
  const passives = completedSurveys.filter(s => (s.score || 0) >= 7 && (s.score || 0) < 9).length;
  const detractors = completedSurveys.filter(s => (s.score || 0) < 7).length;
  const npsScore = completedSurveys.length > 0 
    ? Math.round(((promoters - detractors) / completedSurveys.length) * 100)
    : 0;

  const handleSendSurvey = (id: string) => {
    setSurveys(surveys.map(s => 
      s.id === id ? { ...s, status: 'sent', sentDate: new Date().toISOString() } : s
    ));
    toast.success('NPS survey sent to client');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">NPS Surveys</h1>
          <p className="text-gray-500 mt-1">
            Measure client satisfaction and loyalty
          </p>
        </div>
        <Button onClick={() => toast.info('Manual survey creation coming soon')}>
          <Mail className="h-4 w-4 mr-2" />
          Send Manual Survey
        </Button>
      </div>

      {/* NPS Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              NPS Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-5xl font-bold mb-2">{npsScore}</p>
              <p className="text-sm text-gray-500">
                {npsScore >= 50 ? 'Excellent' : npsScore >= 20 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Promoters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-5xl font-bold text-green-500 mb-2">{promoters}</p>
              <p className="text-sm text-gray-500">
                {completedSurveys.length > 0 ? Math.round((promoters / completedSurveys.length) * 100) : 0}% of respondents
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Response Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-5xl font-bold text-blue-500 mb-2">
                {surveys.length > 0 ? Math.round((completedSurveys.length / surveys.length) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-500">
                {completedSurveys.length} of {surveys.length} responded
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>NPS Automation Settings</CardTitle>
          <CardDescription>
            Configure automatic survey delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Automatic Surveys</Label>
              <p className="text-sm text-gray-500">
                Send NPS surveys automatically after project completion
              </p>
            </div>
            <Switch
              checked={autoSurveysEnabled}
              onCheckedChange={setAutoSurveysEnabled}
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="sendDelay">Send Delay (days after completion)</Label>
            <Input
              id="sendDelay"
              type="number"
              value={sendDelay}
              onChange={(e) => setSendDelay(parseInt(e.target.value))}
              className="w-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Survey List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Surveys</CardTitle>
          <CardDescription>
            Track survey responses and feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className="p-4 border rounded-lg hover:bg-green-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{survey.projectName}</h3>
                      <Badge variant={
                        survey.status === 'completed' ? 'default' :
                        survey.status === 'sent' ? 'secondary' : 'outline'
                      }>
                        {survey.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Client: {survey.clientName}
                    </p>
                    {survey.score && (
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= survey.score!
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">
                          {survey.score}/10
                        </span>
                      </div>
                    )}
                    {survey.feedback && (
                      <p className="text-sm italic text-gray-500">
                        "{survey.feedback}"
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Sent: {new Date(survey.sentDate).toLocaleDateString()}
                      </span>
                      {survey.responseDate && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Responded: {new Date(survey.responseDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {survey.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendSurvey(survey.id)}
                    >
                      <Mail className="h-4 w-4" />
                      Send
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* NPS Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Promoters (9-10)</span>
              <span>{promoters}</span>
            </div>
            <Progress value={(promoters / completedSurveys.length) * 100} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Passives (7-8)</span>
              <span>{passives}</span>
            </div>
            <Progress value={(passives / completedSurveys.length) * 100} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Detractors (0-6)</span>
              <span>{detractors}</span>
            </div>
            <Progress value={(detractors / completedSurveys.length) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add Label import
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
