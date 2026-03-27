"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DollarSign,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Send,
  Trash2,
  Download,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@vayva/ui";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatCurrency, formatDate } from "@vayva/shared";

interface TeamMember {
  name: string;
  role: string;
  qualifications?: string;
}

interface BudgetItem {
  category: string;
  amount: number;
  description?: string;
}

interface GrantApplication {
  id: string;
  grantId: string;
  projectName: string;
  projectDescription: string;
  requestedAmount: number;
  startDate: string;
  endDate: string;
  teamMembers: TeamMember[];
  budgetBreakdown: BudgetItem[];
  expectedOutcomes: string[];
  sustainabilityPlan?: string;
  supportingDocuments?: string[];
  notes?: string;
  status: string;
  submittedAt?: string;
  reviewedAt?: string;
  awardedAmount?: number;
  feedback?: string;
  grant?: {
    title: string;
    funder: string;
  };
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  submitted: 'bg-blue-500',
  under_review: 'bg-yellow-500',
  awarded: 'bg-green-500',
  rejected: 'bg-red-500',
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<GrantApplication | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      // Fetch applications - in production this would be a single endpoint
      const data = await apiJson<any[]>(`/api/nonprofit/grants/applications`);
      const foundApp = data.find((app: any) => app.id === applicationId);

      if (!foundApp) {
        toast.error('Application not found');
        router.push('/dashboard/nonprofit/grants');
        return;
      }

      setApplication(foundApp);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error('[FETCH_APPLICATION_ERROR]', { error: _errMsg });
      toast.error(_errMsg || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await apiJson(`/api/nonprofit/grants/applications/${applicationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'submitted' }),
      });
      toast.success('Application submitted successfully!');
      setSubmitConfirmOpen(false);
      fetchApplication();
    } catch (error: unknown) {
      logger.error('[SUBMIT_APPLICATION_ERROR]', { error });
      toast.error('Failed to submit application');
    }
  };

  const handleDelete = async () => {
    try {
      await apiJson(`/api/nonprofit/grants/applications/${applicationId}`, {
        method: 'DELETE',
      });
      toast.success('Application deleted successfully');
      setDeleteConfirmOpen(false);
      router.push('/dashboard/nonprofit/grants');
    } catch (error: unknown) {
      logger.error('[DELETE_APPLICATION_ERROR]', { error });
      toast.error('Failed to delete application');
    }
  };

  const handleExportPDF = async () => {
    try {
      if (!application) return;
      
      // Generate a simple PDF-like HTML for now (in production, use a proper PDF library like jsPDF or react-pdf)
      const pdfContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Grant Application - ${application.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              .header { border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: bold; color: #166534; }
              .section { margin: 20px 0; }
              .label { font-weight: bold; color: #374151; }
              .value { color: #6b7280; margin-top: 5px; }
              .amount { font-size: 20px; color: #16a34a; font-weight: bold; }
              .status { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
              .status-pending { background: #fef3c7; color: #92400e; }
              .status-submitted { background: #dbeafe; color: #1e40af; }
              .status-approved { background: #dcfce7; color: #166534; }
              .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">Grant Application</div>
              <div class="value">${application.title}</div>
            </div>
            
            <div class="section">
              <div class="label">Grant Provider</div>
              <div class="value">${application.grantProvider || 'N/A'}</div>
            </div>
            
            <div class="section">
              <div class="label">Amount Requested</div>
              <div class="amount">$${Number(application.amountRequested || 0).toLocaleString()}</div>
            </div>
            
            <div class="section">
              <div class="label">Status</div>
              <span class="status status-${(application.status || 'pending').toLowerCase()}">${application.status || 'Pending'}</span>
            </div>
            
            <div class="section">
              <div class="label">Deadline</div>
              <div class="value">${application.deadline ? new Date(application.deadline).toLocaleDateString() : 'N/A'}</div>
            </div>
            
            <div class="section">
              <div class="label">Description</div>
              <div class="value">${application.description || 'No description provided'}</div>
            </div>
            
            <div class="footer">
              Generated on ${new Date().toLocaleDateString()} from Vayva Nonprofit Dashboard
            </div>
          </body>
        </html>
      `;
      
      // Create blob and download
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `grant-application-${application.id}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Application exported successfully! Open the file in a browser to print as PDF.');
    } catch (error) {
      logger.error('[EXPORT_APPLICATION_ERROR]', { error });
      toast.error('Failed to export application');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const totalBudget = application.budgetBreakdown.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const daysSinceSubmission = application.submittedAt
    ? Math.floor((Date.now() - new Date(application.submittedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{application.projectName}</h1>
            <Badge className={statusColors[application.status]}>
              {application.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-gray-600">
            <span className="font-medium">{application.grant?.title}</span>
            <span>•</span>
            <span className="font-medium">{application.grant?.funder}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {application.status === 'draft' && (
            <>
              <Button variant="outline" onClick={() => setSubmitConfirmOpen(true)}>
                <Send className="h-4 w-4 mr-2" />
                Submit
              </Button>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </>
          )}

          {application.status === 'submitted' && (
            <Button variant="outline" className="text-orange-600">
              Withdraw
            </Button>
          )}

          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>

          <Button
            variant="outline"
            className="text-red-600"
            onClick={() => setDeleteConfirmOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Timeline */}
      {application.submittedAt && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  application.status === 'submitted' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Submitted</p>
                  <p className="text-sm text-gray-500">{formatDate(application.submittedAt)}</p>
                </div>
              </div>

              <div className="flex-1 mx-4 border-t-2 border-gray-200" />

              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                application.status === 'under_review' ? 'bg-yellow-500 text-white' : 'bg-gray-200'
              }`}>
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Under Review</p>
                {application.reviewedAt ? (
                  <p className="text-sm text-gray-500">{formatDate(application.reviewedAt)}</p>
                ) : (
                  <p className="text-sm text-gray-500">
                    {daysSinceSubmission} days pending
                  </p>
                )}
              </div>

              <div className="flex-1 mx-4 border-t-2 border-gray-200" />

              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                application.status === 'awarded' ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Awarded</p>
                {application.awardedAmount ? (
                  <p className="text-sm text-green-600 font-medium">
                    ${application.awardedAmount.toLocaleString()}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Pending decision</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requested Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(application.requestedAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total budget allocated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.ceil(
                (new Date(application.endDate).getTime() - new Date(application.startDate).getTime()) /
                (1000 * 60 * 60 * 24 * 30)
              )} months
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(application.startDate).toLocaleDateString()} - {new Date(application.endDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{application.teamMembers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Team members assigned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{application.projectDescription}</p>
            </CardContent>
          </Card>

          {application.sustainabilityPlan && (
            <Card>
              <CardHeader>
                <CardTitle>Sustainability Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{application.sustainabilityPlan}</p>
              </CardContent>
            </Card>
          )}

          {application.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  {application.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {application.feedback && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Reviewer Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{application.feedback}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {application.teamMembers.map((member, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                      <Badge variant="secondary">Member {index + 1}</Badge>
                    </div>
                    {member.qualifications && (
                      <p className="text-sm text-gray-700">{member.qualifications}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Budget Breakdown</CardTitle>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {application.budgetBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.category}</span>
                        {item.description && (
                          <span className="text-sm text-gray-500">({item.description})</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.amount)}</p>
                      <p className="text-xs text-gray-500">
                        {((item.amount / totalBudget) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual Budget Distribution */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Budget Distribution</h4>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex">
                  {application.budgetBreakdown.map((item, index) => {
                    const percentage = ((item.amount / totalBudget) * 100).toFixed(1);
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];
                    return (
                      <div
                        key={index}
                        className={`${colors[index % colors.length]} h-full`}
                        style={{ width: `${percentage}%` }}
                        title={`${item.category}: ${percentage}%`}
                      />
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expected Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {application.expectedOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{outcome}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Supporting Documents</CardTitle>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {application.supportingDocuments && application.supportingDocuments.length > 0 ? (
                <div className="space-y-2">
                  {application.supportingDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium">{doc}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">No Documents Uploaded</h3>
                  <p className="text-gray-500 mt-2 mb-4">
                    Upload supporting documents for your application
                  </p>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={submitConfirmOpen}
        onClose={() => setSubmitConfirmOpen(false)}
        onConfirm={handleSubmit}
        title="Submit Application"
        message="Are you sure you want to submit this application? You won't be able to make changes after submission."
        confirmText="Submit"
        cancelText="Cancel"
        variant="default"
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Application"
        message={`Are you sure you want to delete "${application.projectName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
