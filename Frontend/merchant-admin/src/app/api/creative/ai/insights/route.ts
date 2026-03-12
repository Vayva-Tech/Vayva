import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProjectRiskFactor {
  category: 'budget' | 'timeline' | 'resource' | 'client';
  severity: 'low' | 'medium' | 'high';
  description: string;
  impact: number;
}

interface ProjectRisk {
  id: string;
  projectName: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: ProjectRiskFactor[];
  predictedIssues: string[];
  recommendations: string[];
  confidence: number;
}

/**
 * GET /api/creative/ai/insights
 * Analyze projects and predict risks using AI/ML algorithms
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    // Fetch all active projects for the store
    const projects = await prisma.project.findMany({
      where: {
        storeId: parseInt(storeId),
        status: 'active',
      },
      include: {
        timeEntries: true,
        invoices: true,
        milestones: true,
        tasks: true,
      },
    });

    // Fetch team allocations
    const allocations = await prisma.resourceAllocation.findMany({
      where: {
        storeId: parseInt(storeId),
      },
      include: {
        teamMember: true,
      },
    });

    // Analyze each project
    const risks: ProjectRisk[] = projects.map((project) => {
      const riskAnalysis = analyzeProjectRisk(project, allocations);
      return riskAnalysis;
    });

    // Sort by risk score (highest first)
    risks.sort((a, b) => b.riskScore - a.riskScore);

    return NextResponse.json({
      success: true,
      count: risks.length,
      data: {
        risks,
        summary: {
          totalProjects: projects.length,
          highRisk: risks.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length,
          mediumRisk: risks.filter(r => r.riskLevel === 'medium').length,
          lowRisk: risks.filter(r => r.riskLevel === 'low').length,
          averageRiskScore: Math.round(
            risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length
          ),
        },
      },
    });
  } catch (error) {
    console.error('AI Insights API Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze projects' },
      { status: 500 }
    );
  }
}

/**
 * Analyze individual project for risk factors
 */
function analyzeProjectRisk(project: any, allocations: any[]): ProjectRisk {
  const factors: ProjectRiskFactor[] = [];
  let riskScore = 0;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Budget Analysis
  const budgetData = analyzeBudgetHealth(project);
  if (budgetData.risk > 0) {
    factors.push({
      category: 'budget',
      severity: budgetData.severity,
      description: budgetData.description,
      impact: budgetData.impact,
    });
    riskScore += budgetData.impact;
    issues.push(budgetData.issue);
    recommendations.push(budgetData.recommendation);
  }

  // Timeline Analysis
  const timelineData = analyzeTimelineHealth(project);
  if (timelineData.risk > 0) {
    factors.push({
      category: 'timeline',
      severity: timelineData.severity,
      description: timelineData.description,
      impact: timelineData.impact,
    });
    riskScore += timelineData.impact;
    issues.push(timelineData.issue);
    recommendations.push(timelineData.recommendation);
  }

  // Resource Analysis
  const resourceData = analyzeResourceHealth(project, allocations);
  if (resourceData.risk > 0) {
    factors.push({
      category: 'resource',
      severity: resourceData.severity,
      description: resourceData.description,
      impact: resourceData.impact,
    });
    riskScore += resourceData.impact;
    issues.push(resourceData.issue);
    recommendations.push(resourceData.recommendation);
  }

  // Client Engagement Analysis
  const clientData = analyzeClientEngagement(project);
  if (clientData.risk > 0) {
    factors.push({
      category: 'client',
      severity: clientData.severity,
      description: clientData.description,
      impact: clientData.impact,
    });
    riskScore += clientData.impact;
    issues.push(clientData.issue);
    recommendations.push(clientData.recommendation);
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (riskScore >= 75) riskLevel = 'critical';
  else if (riskScore >= 50) riskLevel = 'high';
  else if (riskScore >= 25) riskLevel = 'medium';
  else riskLevel = 'low';

  // Calculate AI confidence based on data quality
  const confidence = calculateConfidence(project);

  return {
    id: project.id,
    projectName: project.name,
    riskScore,
    riskLevel,
    factors,
    predictedIssues: issues,
    recommendations,
    confidence,
  };
}

/**
 * Analyze budget health
 */
function analyzeBudgetHealth(project: any) {
  const totalBudget = project.budget || 0;
  const totalSpent = project.invoices?.reduce(
    (sum: number, inv: any) => sum + (inv.totalAmount || 0),
    0
  ) || 0;

  const burnRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const daysElapsed =
    (new Date().getTime() - new Date(project.startDate).getTime()) /
    (1000 * 60 * 60 * 24);
  const totalDays =
    (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) /
    (1000 * 60 * 60 * 24);
  const expectedBurnRate = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;

  const variance = burnRate - expectedBurnRate;

  if (variance > 30) {
    return {
      risk: 3,
      severity: 'high' as const,
      description: `Spending rate ${Math.round(variance)}% above planned burn rate`,
      impact: 40,
      issue: 'Budget overrun likely within 2 weeks',
      recommendation: 'Schedule budget review meeting with client',
    };
  } else if (variance > 15) {
    return {
      risk: 2,
      severity: 'medium' as const,
      description: `Spending rate ${Math.round(variance)}% above plan`,
      impact: 25,
      issue: 'Potential budget concerns emerging',
      recommendation: 'Review project scope and resource allocation',
    };
  }

  return { risk: 0, severity: 'low' as const, description: '', impact: 0, issue: '', recommendation: '' };
}

/**
 * Analyze timeline health
 */
function analyzeTimelineHealth(project: any) {
  const now = new Date();
  const endDate = new Date(project.endDate);
  const daysRemaining = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  const completedTasks = project.tasks?.filter((t: any) => t.status === 'completed').length || 0;
  const totalTasks = project.tasks?.length || 0;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const delayedMilestones = project.milestones?.filter(
    (m: any) => m.status === 'delayed' || (m.dueDate && new Date(m.dueDate) < now && m.status !== 'completed')
  ).length || 0;

  if (delayedMilestones >= 2 || (daysRemaining < 14 && completionRate < 70)) {
    return {
      risk: 3,
      severity: 'high' as const,
      description: `${delayedMilestones} milestones delayed, ${Math.round(completionRate)}% complete with ${Math.round(daysRemaining)} days remaining`,
      impact: 35,
      issue: 'Project timeline at risk of significant delay',
      recommendation: 'Prioritize remaining features using MoSCoW method',
    };
  } else if (delayedMilestones >= 1 || completionRate < 50) {
    return {
      risk: 2,
      severity: 'medium' as const,
      description: `${delayedMilestones} milestone(s) behind schedule`,
      impact: 20,
      issue: 'Timeline slippage detected',
      recommendation: 'Consider adding resources or adjusting scope',
    };
  }

  return { risk: 0, severity: 'low' as const, description: '', impact: 0, issue: '', recommendation: '' };
}

/**
 * Analyze resource health
 */
function analyzeResourceHealth(project: any, allocations: any[]) {
  const projectAllocations = allocations.filter(a => a.projectId === project.id);
  const overallocatedMembers = projectAllocations.filter(alloc => {
    const memberTotalAllocations = allocations.filter(
      a => a.teamMemberId === alloc.teamMemberId
    ).length;
    return memberTotalAllocations > 2; // More than 2 projects = overallocated
  }).length;

  if (overallocatedMembers >= 2) {
    return {
      risk: 2,
      severity: 'medium' as const,
      description: `${overallocatedMembers} team members overallocated across multiple projects`,
      impact: 25,
      issue: 'Quality risk if team continues at current pace',
      recommendation: 'Consider adding contract developer to reduce load',
    };
  } else if (overallocatedMembers >= 1) {
    return {
      risk: 1,
      severity: 'low' as const,
      description: 'Resource capacity constraints detected',
      impact: 10,
      issue: 'Potential resource bottleneck',
      recommendation: 'Monitor workload and have backup resources ready',
    };
  }

  return { risk: 0, severity: 'low' as const, description: '', impact: 0, issue: '', recommendation: '' };
}

/**
 * Analyze client engagement
 */
function analyzeClientEngagement(project: any) {
  // This would use actual client interaction data
  // For now, simulate based on project age and activity
  const projectAge =
    (new Date().getTime() - new Date(project.startDate).getTime()) /
    (1000 * 60 * 60 * 24);

  const hasRecentActivity = project.timeEntries?.some((te: any) => {
    const entryAge = (new Date().getTime() - new Date(te.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return entryAge < 7; // Activity in last 7 days
  });

  if (!hasRecentActivity && projectAge > 30) {
    return {
      risk: 2,
      severity: 'medium' as const,
      description: 'Low client engagement in past week',
      impact: 20,
      issue: 'Client satisfaction may decrease due to lack of communication',
      recommendation: 'Schedule check-in call with client',
    };
  }

  return { risk: 0, severity: 'low' as const, description: '', impact: 0, issue: '', recommendation: '' };
}

/**
 * Calculate AI confidence score
 */
function calculateConfidence(project: any): number {
  let confidence = 100;

  // Reduce confidence if data is incomplete
  if (!project.budget) confidence -= 20;
  if (!project.tasks || project.tasks.length === 0) confidence -= 15;
  if (!project.invoices || project.invoices.length === 0) confidence -= 15;
  if (!project.timeEntries || project.timeEntries.length === 0) confidence -= 10;

  // Increase confidence with more data points
  const dataPoints =
    (project.tasks?.length || 0) +
    (project.invoices?.length || 0) +
    (project.timeEntries?.length || 0);

  if (dataPoints > 20) confidence += 10;
  else if (dataPoints > 10) confidence += 5;

  return Math.max(Math.min(confidence, 95), 50); // Clamp between 50-95%
}
