'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  TrendingUp, 
  Brain, 
  RefreshCcw, 
  CheckCircle, 
  ArrowUpRight,
  Clock,
  DollarSign,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface ProjectRisk {
  id: string;
  projectName: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  predictedIssues: string[];
  recommendations: string[];
  confidence: number; // AI confidence percentage
}

interface RiskFactor {
  category: 'budget' | 'timeline' | 'resource' | 'client';
  severity: 'low' | 'medium' | 'high';
  description: string;
  impact: number; // percentage contribution to risk
}

export default function AIPoweredInsights() {
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  // Simulated AI analysis - in production, this would call an ML API
  const analyzeProjects = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock AI-generated insights (replace with actual ML predictions)
      const mockRisks: ProjectRisk[] = [
        {
          id: '1',
          projectName: 'Website Redesign - Acme Corp',
          riskScore: 78,
          riskLevel: 'high',
          confidence: 87,
          factors: [
            {
              category: 'budget',
              severity: 'high',
              description: 'Spending rate 35% above planned burn rate',
              impact: 40
            },
            {
              category: 'timeline',
              severity: 'medium',
              description: '2 milestones delayed by average of 4 days',
              impact: 25
            },
            {
              category: 'resource',
              severity: 'medium',
              description: 'Key designer overallocated at 95% capacity',
              impact: 13
            }
          ],
          predictedIssues: [
            'Budget overrun likely within 2 weeks',
            'Client satisfaction may decrease due to delays',
            'Quality risk if team continues at current pace'
          ],
          recommendations: [
            'Schedule budget review meeting with client',
            'Consider adding contract developer to reduce load',
            'Prioritize remaining features using MoSCoW method'
          ]
        },
        {
          id: '2',
          projectName: 'Brand Identity - TechStart',
          riskScore: 45,
          riskLevel: 'medium',
          confidence: 92,
          factors: [
            {
              category: 'client',
              severity: 'medium',
              description: 'Client response time averaging 5.2 days (industry avg: 2 days)',
              impact: 30
            },
            {
              category: 'timeline',
              severity: 'low',
              description: 'Revision rounds 40% higher than similar projects',
              impact: 15
            }
          ],
          predictedIssues: [
            'Project timeline may extend by 1-2 weeks',
            'Additional revision costs likely'
          ],
          recommendations: [
            'Set clearer feedback deadlines in next check-in',
            'Propose video call instead of email reviews',
            'Document approval process more clearly'
          ]
        },
        {
          id: '3',
          projectName: 'Mobile App - GlobalInc',
          riskScore: 23,
          riskLevel: 'low',
          confidence: 95,
          factors: [
            {
              category: 'resource',
              severity: 'low',
              description: 'Developer availability decreasing in 3 weeks',
              impact: 23
            }
          ],
          predictedIssues: [
            'Potential resource gap in development phase'
          ],
          recommendations: [
            'Begin contractor search as backup option',
            'Cross-train team member on React Native'
          ]
        }
      ];

      setRisks(mockRisks);
      setLastAnalysis(new Date());
      toast.success('AI analysis completed successfully');
    } catch (error) {
      toast.error('Failed to analyze projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeProjects();
  }, []);

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-500',
      medium: 'bg-orange-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500',
    };
    return colors[level];
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      budget: <DollarSign className="h-3 w-3" />,
      timeline: <Clock className="h-3 w-3" />,
      resource: <Users className="h-3 w-3" />,
      client: <TrendingUp className="h-3 w-3" />,
    };
    return icons[category] || null;
  };

  const avgRiskScore = risks.length > 0
    ? Math.round(risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length)
    : 0;

  const highRiskProjects = risks.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-green-500" />
            AI-Powered Insights
          </h1>
          <p className="text-gray-500 mt-1">
            Predictive analytics for project risk management
          </p>
        </div>
        <Button onClick={analyzeProjects} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Re-run Analysis'}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgRiskScore}</div>
            <p className="text-xs text-gray-500 mt-1">
              Across {risks.length} active projects
            </p>
            <Progress value={avgRiskScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">High Risk Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{highRiskProjects}</div>
            <p className="text-xs text-gray-500 mt-1">
              Requiring immediate attention
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              <span>{highRiskProjects > 0 ? 'Action needed' : 'All clear'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {risks.length > 0 
                ? Math.round(risks.reduce((sum, r) => sum + r.confidence, 0) / risks.length)
                : 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Prediction accuracy
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>High reliability</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Analysis */}
      {lastAnalysis && (
        <div className="text-sm text-gray-500">
          Last analysis: {lastAnalysis.toLocaleString()}
        </div>
      )}

      {/* Risk Details */}
      <div className="grid gap-6">
        {risks.map((risk) => (
          <Card key={risk.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{risk.projectName}</CardTitle>
                    <Badge className={getRiskColor(risk.riskLevel)}>
                      {risk.riskLevel} risk
                    </Badge>
                    <Badge variant="outline">
                      Score: {risk.riskScore}/100
                    </Badge>
                  </div>
                  <CardDescription>
                    AI Confidence: {risk.confidence}%
                  </CardDescription>
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Risk Factors */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Risk Factors
                </h4>
                <div className="space-y-3">
                  {risk.factors.map((factor, idx) => (
                    <div key={idx} className="p-3 border rounded-lg bg-white">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(factor.category)}
                        <span className="text-sm font-medium capitalize">{factor.category}</span>
                        <Badge variant={
                          factor.severity === 'high' ? 'destructive' :
                          factor.severity === 'medium' ? 'secondary' : 'outline'
                        }>
                          {factor.severity}
                        </Badge>
                        <span className="text-xs text-gray-500 ml-auto">
                          {factor.impact}% impact
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{factor.description}</p>
                      <Progress value={factor.impact} className="mt-2 h-1" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Predicted Issues */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Predicted Issues
                </h4>
                <ul className="space-y-2">
                  {risk.predictedIssues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <ArrowUpRight className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  AI Recommendations
                </h4>
                <ul className="space-y-2">
                  {risk.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm p-2 bg-green-500/10 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" size="sm">
                  View Project
                </Button>
                <Button variant="outline" size="sm">
                  Schedule Review
                </Button>
                <Button variant="default" size="sm">
                  Create Action Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading State */}
      {loading && risks.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Brain className="h-12 w-12 text-green-500 animate-pulse" />
              <p className="text-gray-500">AI is analyzing your projects...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
