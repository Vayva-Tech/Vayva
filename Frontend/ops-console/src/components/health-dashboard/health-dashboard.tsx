'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Phone,
  Mail,
} from 'lucide-react';

interface HealthScoreData {
  storeId: string;
  storeName: string;
  score: number;
  calculatedAt: string;
  components: {
    factors: Array<{
      type: 'positive' | 'negative' | 'neutral';
      category: string;
      description: string;
      recommendation?: string;
    }>;
    trend: 'improving' | 'declining' | 'stable';
  };
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;
}

interface HealthStats {
  totalStores: number;
  averageScore: number;
  healthy: number;
  atRisk: number;
  critical: number;
}

export function HealthDashboard() {
  const [activeSegment, setActiveSegment] = useState<string>('all');
  const [scores, setScores] = useState<HealthScoreData[]>([]);
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState<string | null>(null);

  useEffect(() => {
    fetchHealthData();
  }, [activeSegment]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const url =
        activeSegment === 'all'
          ? '/api/health-score'
          : `/api/health-score?segment=${activeSegment}`;
      const response = await fetch(url);
      const data = await response.json();
      setScores(data.scores || []);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recalculateScore = async (storeId: string) => {
    try {
      setRecalculating(storeId);
      const response = await fetch('/api/health-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId }),
      });

      if (response.ok) {
        // Wait a moment then refresh
        setTimeout(fetchHealthData, 2000);
      }
    } catch (error) {
      console.error('Failed to recalculate:', error);
    } finally {
      setRecalculating(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return <Badge variant="default">Healthy</Badge>;
    if (score >= 40) return <Badge variant="warning">At Risk</Badge>;
    return <Badge variant="destructive">Critical</Badge>;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <span className="h-4 w-4 text-gray-400">-</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Merchants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">{stats.totalStores}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span
                  className={`text-2xl font-bold ${
                    stats.averageScore >= 70
                      ? 'text-green-600'
                      : stats.averageScore >= 40
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  {stats.averageScore}
                </span>
                <span className="text-gray-400 ml-1">/100</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Healthy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold text-green-600">
                  {stats.healthy}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  ({Math.round((stats.healthy / stats.totalStores) * 100)}%)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-2xl font-bold text-red-600">
                  {stats.atRisk + stats.critical}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  (
                  {Math.round(
                    ((stats.atRisk + stats.critical) / stats.totalStores) * 100
                  )}
                  %)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between">
        <Select value={activeSegment} onValueChange={setActiveSegment}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Merchants</SelectItem>
            <SelectItem value="healthy">Healthy (70-100)</SelectItem>
            <SelectItem value="atRisk">At Risk (40-69)</SelectItem>
            <SelectItem value="critical">Critical (0-39)</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={fetchHealthData} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Health Scores Table */}
      <Card>
        <CardHeader>
          <CardTitle>Merchant Health Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Key Factors</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map((score) => (
                <TableRow key={score.storeId}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{score.storeName}</div>
                      <div className="text-sm text-gray-500">
                        {score.ownerFirstName} {score.ownerLastName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-lg font-bold px-3 py-1 rounded-full ${getScoreColor(
                        score.score
                      )}`}
                    >
                      {score.score}
                    </span>
                  </TableCell>
                  <TableCell>{getScoreBadge(score.score)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getTrendIcon(score.components?.trend || 'stable')}
                      <span className="ml-1 text-sm capitalize">
                        {score.components?.trend || 'stable'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {score.components?.factors
                        ?.filter((f) => f.type === 'negative')
                        .slice(0, 2)
                        .map((factor, idx) => (
                          <div
                            key={idx}
                            className="text-sm text-gray-600 truncate"
                          >
                            • {factor.description}
                          </div>
                        ))}
                      {(!score.components?.factors ||
                        score.components.factors.filter(
                          (f) => f.type === 'negative'
                        ).length === 0) && (
                        <span className="text-sm text-green-600">
                          All metrics good
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {score.ownerPhone && (
                        <a
                          href={`tel:${score.ownerPhone}`}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                      {score.ownerEmail && (
                        <a
                          href={`mailto:${score.ownerEmail}`}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => recalculateScore(score.storeId)}
                      disabled={recalculating === score.storeId}
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          recalculating === score.storeId
                            ? 'animate-spin'
                            : ''
                        }`}
                      />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
