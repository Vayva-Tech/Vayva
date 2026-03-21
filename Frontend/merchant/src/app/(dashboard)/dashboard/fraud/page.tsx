"use client";

import React, { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiJson } from "@/lib/api-client-shared";
import { formatCurrency } from "@vayva/shared";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  AlertTriangle,
  Clock,
  UserX,
  Activity,
  TrendingDown,
  TrendingUp,
  Globe,
  CreditCard,
  Smartphone,
  Mail,
  Lock,
} from "lucide-react";

// Types
interface FraudCheck {
  id: string;
  orderId: string;
  customerId: string;
  customerEmail: string;
  customerPhone?: string;
  orderAmount: number;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "rejected" | "manual_review";
  triggeredRules: string[];
  velocityData: {
    ordersLast24h: number;
    amountLast24h: number;
    uniqueDevices: number;
    uniqueIps: number;
  };
  deviceFingerprint?: string;
  ipAddress: string;
  ipCountry?: string;
  isVpn: boolean;
  isTor: boolean;
  createdAt: string;
  decisionAt?: string;
  decisionBy?: string;
}

interface FraudRule {
  id: string;
  name: string;
  description: string;
  type: "velocity" | "amount" | "device" | "location" | "behavioral" | "list";
  condition: {
    field: string;
    operator: string;
    value: number | string | boolean;
  };
  action: "flag" | "block" | "review";
  score: number;
  enabled: boolean;
  priority: number;
  createdAt: string;
}

interface FraudStats {
  totalChecks: number;
  approvedCount: number;
  rejectedCount: number;
  reviewCount: number;
  blockedAmount: number;
  avgRiskScore: number;
  fraudRate: number;
  topTriggers: Array<{ rule: string; count: number }>;
  hourlyDistribution: Array<{ hour: number; checks: number; fraudAttempts: number }>;
}

interface BlocklistEntry {
  id: string;
  type: "email" | "phone" | "ip" | "device" | "card";
  value: string;
  reason: string;
  source: "manual" | "auto";
  expiryDate?: string;
  createdAt: string;
  createdBy?: string;
}

const RISK_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-orange-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: { color: "bg-gray-100 text-gray-800", icon: <Clock className="w-3 h-3" />, label: "Pending" },
  approved: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3 h-3" />, label: "Approved" },
  rejected: { color: "bg-red-100 text-red-800", icon: <Ban className="w-3 h-3" />, label: "Rejected" },
  manual_review: { color: "bg-orange-100 text-amber-800", icon: <Eye className="w-3 h-3" />, label: "Manual Review" },
};

export default function FraudDetectionDashboard() {
  const [checks, setChecks] = useState<FraudCheck[]>([]);
  const [rules, setRules] = useState<FraudRule[]>([]);
  const [stats, setStats] = useState<FraudStats | null>(null);
  const [blocklist, setBlocklist] = useState<BlocklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCheck, setSelectedCheck] = useState<FraudCheck | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [checksRes, rulesRes, statsRes, blocklistRes] = await Promise.all([
        apiJson<{ checks: FraudCheck[] }>("/api/fraud/checks"),
        apiJson<{ rules: FraudRule[] }>("/api/fraud/rules"),
        apiJson<FraudStats>("/api/fraud/stats"),
        apiJson<{ entries: BlocklistEntry[] }>("/api/fraud/blocklist"),
      ]);

      setChecks(checksRes.checks || []);
      setRules(rulesRes.rules || []);
      setStats(statsRes);
      setBlocklist(blocklistRes.entries || []);
    } catch (error) {
      logger.error("[Fraud] Failed to load:", { error });
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (checkId: string, decision: "approved" | "rejected") => {
    try {
      await apiJson(`/api/fraud/checks/${checkId}/decision`, {
        method: "POST",
        body: JSON.stringify({ decision, reason: "Manual review" }),
      });
      loadData();
      setSelectedCheck(null);
    } catch (error) {
      logger.error("[Fraud] Decision failed:", { error });
    }
  };

  const handleAddToBlocklist = async (type: BlocklistEntry["type"], value: string) => {
    try {
      await apiJson("/api/fraud/blocklist", {
        method: "POST",
        body: JSON.stringify({ type, value, reason: "Fraudulent activity" }),
      });
      loadData();
    } catch (error) {
      logger.error("[Fraud] Blocklist add failed:", { error });
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      await apiJson(`/api/fraud/rules/${ruleId}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled }),
      });
      loadData();
    } catch (error) {
      logger.error("[Fraud] Rule toggle failed:", { error });
    }
  };

  const filteredChecks = checks.filter((check) => {
    if (filterRisk !== "all" && check.riskLevel !== filterRisk) return false;
    if (searchQuery && !check.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7 text-green-600" />
            Fraud Detection
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor, analyze, and prevent fraudulent transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <Activity className="w-3 h-3 mr-1" />
            {stats?.fraudRate.toFixed(2)}% fraud rate
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-2xl font-bold">{stats.approvedCount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Ban className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rejected</p>
                  <p className="text-2xl font-bold">{stats.rejectedCount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Eye className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">In Review</p>
                  <p className="text-2xl font-bold">{stats.reviewCount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Lock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blocked Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.blockedAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="blocklist">Blocklist</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Search by email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={filterRisk} onValueChange={setFilterRisk}>
                    <SelectTrigger className="w-32">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChecks.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell>
                        <span className="font-mono text-sm">#{check.orderId.slice(-6)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{check.customerEmail}</span>
                          <span className="text-xs text-gray-500">{check.ipCountry || "Unknown location"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(check.orderAmount)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-16 h-2 rounded-full ${
                              check.riskScore > 75
                                ? "bg-red-500"
                                : check.riskScore > 50
                                ? "bg-orange-500"
                                : check.riskScore > 25
                                ? "bg-orange-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(check.riskScore, 100)}%` }}
                          />
                          <span className="text-sm font-medium">{check.riskScore}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_CONFIG[check.status].color}>
                          {STATUS_CONFIG[check.status].icon}
                          <span className="ml-1">{STATUS_CONFIG[check.status].label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(check.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCheck(check)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredChecks.length === 0 && (
                <div className="text-center py-12">
                  <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No transactions to review.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Detection Rules</CardTitle>
              <CardDescription>Configure rules that trigger fraud detection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`flex items-start justify-between p-4 rounded-lg border ${
                      rule.enabled ? "border-l-4 border-l-blue-500" : "opacity-60"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{rule.name}</h4>
                        <Badge variant="outline">{rule.type}</Badge>
                        <Badge
                          className={
                            rule.action === "block"
                              ? "bg-red-100 text-red-800"
                              : rule.action === "review"
                              ? "bg-orange-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {rule.action}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-gray-500">
                          Score: <span className="font-medium">+{rule.score}</span>
                        </span>
                        <span className="text-gray-500">
                          Priority: <span className="font-medium">{rule.priority}</span>
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                    />
                  </div>
                ))}

                {rules.length === 0 && (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No rules configured.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocklist Tab */}
        <TabsContent value="blocklist" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="w-5 h-5" />
                Blocklist
              </CardTitle>
              <CardDescription>Blocked emails, IPs, and devices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blocklist.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Badge variant="outline">{entry.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{entry.value}</TableCell>
                      <TableCell>{entry.reason}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {blocklist.length === 0 && (
                <div className="text-center py-12">
                  <UserX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Blocklist is empty.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Top Rule Triggers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.topTriggers.map((trigger, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{trigger.rule}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500"
                            style={{
                              width: `${(trigger.count / (stats.topTriggers[0]?.count || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-10">{trigger.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Fraud Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Fraud Rate (24h)</span>
                    </div>
                    <span className="font-semibold text-green-600">{stats?.fraudRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <span className="text-sm">Average Risk Score</span>
                    <span className="font-semibold">{stats?.avgRiskScore.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <span className="text-sm">Total Checks</span>
                    <span className="font-semibold">{stats?.totalChecks.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Check Details Dialog */}
      {selectedCheck && (
        <Dialog open={!!selectedCheck} onOpenChange={() => setSelectedCheck(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                Transaction Review
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Risk Score */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div>
                  <p className="text-sm text-gray-500">Risk Score</p>
                  <p className={`text-3xl font-bold ${
                    selectedCheck.riskScore > 75
                      ? "text-red-600"
                      : selectedCheck.riskScore > 50
                      ? "text-orange-600"
                      : selectedCheck.riskScore > 25
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}>
                    {selectedCheck.riskScore}/100
                  </p>
                </div>
                <Badge className={RISK_COLORS[selectedCheck.riskLevel]}>
                  {selectedCheck.riskLevel.toUpperCase()} RISK
                </Badge>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    {selectedCheck.customerEmail}
                  </div>
                  {selectedCheck.customerPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Smartphone className="w-4 h-4 text-gray-500" />
                      {selectedCheck.customerPhone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-gray-500" />
                    {selectedCheck.ipAddress}
                    {selectedCheck.ipCountry && ` (${selectedCheck.ipCountry})`}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    {formatCurrency(selectedCheck.orderAmount)}
                  </div>
                  {selectedCheck.isVpn && (
                    <Badge variant="outline" className="text-orange-600">VPN Detected</Badge>
                  )}
                  {selectedCheck.isTor && (
                    <Badge variant="outline" className="text-red-600">Tor Exit Node</Badge>
                  )}
                </div>
              </div>

              {/* Triggered Rules */}
              {selectedCheck.triggeredRules.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Triggered Rules</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCheck.triggeredRules.map((rule, i) => (
                      <Badge key={i} variant="secondary">{rule}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Velocity Data */}
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium mb-3">Velocity Check</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Orders (24h): </span>
                    <span className="font-medium">{selectedCheck.velocityData.ordersLast24h}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount (24h): </span>
                    <span className="font-medium">{formatCurrency(selectedCheck.velocityData.amountLast24h)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Unique Devices: </span>
                    <span className="font-medium">{selectedCheck.velocityData.uniqueDevices}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Unique IPs: </span>
                    <span className="font-medium">{selectedCheck.velocityData.uniqueIps}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedCheck.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => handleDecision(selectedCheck.id, "rejected")}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleDecision(selectedCheck.id, "approved")}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAddToBlocklist("email", selectedCheck.customerEmail)}
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Block Email
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
