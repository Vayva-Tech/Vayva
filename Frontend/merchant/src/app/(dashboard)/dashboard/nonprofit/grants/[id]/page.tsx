"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Calendar,
  DollarSign,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@vayva/ui";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatCurrency, formatDate } from "@vayva/shared";
import ApplicationWizard from "@/components/grants/ApplicationWizard";

interface NonprofitGrant {
  id: string;
  title: string;
  funder: string;
  description: string;
  requestedAmount: number;
  duration: number;
  deadline: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  eligibilityRequirements?: string[];
  requiredDocuments?: string[];
  evaluationCriteria?: string[];
  notes?: string;
  status: string;
  applications?: any[];
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  submitted: 'bg-blue-500',
  under_review: 'bg-yellow-500',
  funded: 'bg-green-500',
  rejected: 'bg-red-500',
  closed: 'bg-purple-500',
};

export default function GrantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const grantId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [grant, setGrant] = useState<NonprofitGrant | null>(null);
  const [showApplicationWizard, setShowApplicationWizard] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const daysUntilDeadline = grant?.deadline
    ? Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  useEffect(() => {
    if (grantId) {
      fetchGrant();
    }
  }, [grantId]);

  const fetchGrant = async () => {
    try {
      setLoading(true);
      // For now, use the old endpoint - will be updated later
      const data = await apiJson<NonprofitGrant[]>(`/api/nonprofit/grants`);
      const foundGrant = data.find(g => g.id === grantId);
      
      if (!foundGrant) {
        toast.error('Grant not found');
        router.push('/dashboard/nonprofit/grants');
        return;
      }

      setGrant(foundGrant);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error('[FETCH_GRANT_DETAIL_ERROR]', { error: _errMsg });
      toast.error(_errMsg || 'Failed to load grant');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiJson(`/api/nonprofit/grants/${grantId}`, { method: 'DELETE' });
      toast.success('Grant deleted successfully');
      setDeleteConfirmOpen(false);
      router.push('/dashboard/nonprofit/grants');
    } catch (error: unknown) {
      logger.error('[DELETE_GRANT_ERROR]', { error });
      toast.error('Failed to delete grant');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading grant details...</p>
        </div>
      </div>
    );
  }

  if (!grant) {
    return null;
  }

  if (showApplicationWizard) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowApplicationWizard(false)}
          >
            ← Back to Grant
          </Button>
        </div>
        <ApplicationWizard
          grantId={grant.id}
          grantTitle={grant.title}
          grantDeadline={grant.deadline}
          onSuccess={() => {
            fetchGrant();
            setActiveTab('applications');
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{grant.title}</h1>
            <Badge className={statusColors[grant.status]}>
              {grant.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Building2 className="h-4 w-4" />
            <span className="font-medium">{grant.funder}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDeleteConfirmOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button onClick={() => setShowApplicationWizard(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Application
          </Button>
        </div>
      </div>

      {/* Deadline Alert */}
      {daysUntilDeadline !== null && (
        <div className={`rounded-lg p-4 border ${
          daysUntilDeadline < 7
            ? 'bg-red-50 border-red-200'
            : daysUntilDeadline < 30
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center gap-3">
            {daysUntilDeadline < 7 ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : daysUntilDeadline < 30 ? (
              <Clock className="h-5 w-5 text-yellow-600" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            <div>
              <p className={`font-semibold ${
                daysUntilDeadline < 7
                  ? 'text-red-900'
                  : daysUntilDeadline < 30
                  ? 'text-yellow-900'
                  : 'text-green-900'
              }`}>
                {daysUntilDeadline < 7
                  ? `URGENT: ${daysUntilDeadline} days until deadline!`
                  : daysUntilDeadline < 30
                  ? `${daysUntilDeadline} days until deadline`
                  : `${daysUntilDeadline} days until deadline`}
              </p>
              <p className={`text-sm ${
                daysUntilDeadline < 7
                  ? 'text-red-700'
                  : daysUntilDeadline < 30
                  ? 'text-yellow-700'
                  : 'text-green-700'
              }`}>
                Deadline: {formatDate(grant.deadline)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requested Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(grant.requestedAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Duration: {grant.duration} months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grant.applications?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deadline</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(grant.deadline).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {daysUntilDeadline !== null && daysUntilDeadline > 0
                ? `${daysUntilDeadline} days remaining`
                : 'Deadline passed'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="applications">Applications ({grant.applications?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{grant.description}</p>
            </CardContent>
          </Card>

          {grant.website && (
            <Card>
              <CardHeader>
                <CardTitle>Website</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={grant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {grant.website}
                </a>
              </CardContent>
            </Card>
          )}

          {grant.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  {grant.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              {grant.eligibilityRequirements && grant.eligibilityRequirements.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {grant.eligibilityRequirements.map((req, i) => (
                    <li key={i} className="text-gray-700">{req}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No specific eligibility requirements listed</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {grant.requiredDocuments && grant.requiredDocuments.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {grant.requiredDocuments.map((doc, i) => (
                    <li key={i} className="text-gray-700">{doc}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No specific documents required</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evaluation Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              {grant.evaluationCriteria && grant.evaluationCriteria.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {grant.evaluationCriteria.map((criteria, i) => (
                    <li key={i} className="text-gray-700">{criteria}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No specific evaluation criteria listed</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {grant.contactName && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Contact Name</p>
                    <p className="text-gray-700">{grant.contactName}</p>
                  </div>
                </div>
              )}

              {grant.contactEmail && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <a href={`mailto:${grant.contactEmail}`} className="text-blue-600 hover:underline">
                      {grant.contactEmail}
                    </a>
                  </div>
                </div>
              )}

              {grant.contactPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <a href={`tel:${grant.contactPhone}`} className="text-blue-600 hover:underline">
                      {grant.contactPhone}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          {grant.applications && grant.applications.length > 0 ? (
            <div className="space-y-4">
              {grant.applications.map((app: any) => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{app.projectName}</CardTitle>
                      <Badge variant={app.status === 'awarded' ? 'default' : 'secondary'}>
                        {app.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Requested Amount</p>
                        <p className="font-medium">${Number(app.requestedAmount).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Submitted</p>
                        <p className="font-medium">{formatDate(app.submittedAt)}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => router.push(`/dashboard/nonprofit/applications/${app.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="font-semibold text-lg">No Applications Yet</h3>
                <p className="text-gray-500 mt-2 mb-4">
                  Create your first application for this grant opportunity
                </p>
                <Button onClick={() => setShowApplicationWizard(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Application
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Grant"
        message={`Are you sure you want to delete "${grant.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
