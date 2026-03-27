"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mail, Plus, Edit, Trash2, Save, Copy, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  variables: string[];
  isDefault: boolean;
  createdAt: string;
}

const defaultTemplates: Omit<EmailTemplate, "id" | "createdAt">[] = [
  {
    name: "Thank You - New Donor",
    subject: "Thank You for Your Generous Support! 🎉",
    body: `Dear {{donorName}},

Thank you so much for your generous donation of {{amount}} to {{nonprofitName}}!

Your contribution will help us {{impact}}. We're incredibly grateful for supporters like you who make our mission possible.

A tax receipt has been sent to your email for your records.

With heartfelt gratitude,
The {{nonprofitName}} Team

---
{{nonprofitName}}
{{nonprofitAddress}}
{{website}}`,
    category: "thank-you",
    variables: ["donorName", "amount", "nonprofitName", "impact", "nonprofitAddress", "website"],
    isDefault: true,
  },
  {
    name: "Campaign Milestone",
    subject: "We Did It! {{campaignName}} Reaches {{milestone}}%! 🎯",
    body: `Dear {{donorName}},

Thanks to supporters like you, {{campaignName}} has reached {{milestone}}% of its goal!

Current Total: {{totalRaised}}
Goal: {{goal}}

We're {{remaining}} away from reaching our target. Can you help us get there?

[Donate Now Button]

Together, we can make a difference!

Best regards,
The {{nonprofitName}} Team`,
    category: "campaign",
    variables: ["donorName", "campaignName", "milestone", "totalRaised", "goal", "remaining"],
    isDefault: true,
  },
  {
    name: "Volunteer Shift Reminder",
    subject: "Reminder: Your Volunteer Shift Tomorrow! ⏰",
    body: `Hi {{volunteerName}},

This is a friendly reminder about your upcoming volunteer shift:

📅 Date: {{shiftDate}}
⏰ Time: {{startTime}} - {{endTime}}
📍 Location: {{location}}
👕 Role: {{role}}

Please arrive 10 minutes early for check-in. If you need to cancel or reschedule, please let us know at least 24 hours in advance.

We're excited to have you on the team!

Questions? Reply to this email or call {{contactPhone}}.

See you soon!
The {{nonprofitName}} Volunteer Team`,
    category: "volunteer",
    variables: ["volunteerName", "shiftDate", "startTime", "endTime", "location", "role", "contactPhone"],
    isDefault: true,
  },
  {
    name: "Grant Application Submitted",
    subject: "Grant Application Received - {{grantName}}",
    body: `Dear {{applicantName}},

We have successfully received your grant application for {{grantName}}.

Application Details:
- Submission ID: {{submissionId}}
- Submitted: {{submissionDate}}
- Requested Amount: {{requestedAmount}}

Next Steps:
1. Our team will review your application within {{reviewPeriod}} business days
2. You will receive an email notification once a decision is made
3. If approved, funding will be disbursed within {{disbursementPeriod}} weeks

If you have any questions about your application, please contact us at {{contactEmail}}.

Thank you for applying!

Best regards,
Grants Committee
{{nonprofitName}}`,
    category: "grant",
    variables: ["applicantName", "grantName", "submissionId", "submissionDate", "requestedAmount", "reviewPeriod", "disbursementPeriod", "contactEmail"],
    isDefault: true,
  },
];

export function EmailTemplatesManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      // In production, fetch from API
      // For now, use default templates
      setTemplates(defaultTemplates.map((t, i) => ({ ...t, id: `default-${i}`, createdAt: new Date().toISOString() })));
    } catch (error: unknown) {
      logger.error("[FETCH_TEMPLATES_ERROR]", { error });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (templateData: Partial<EmailTemplate>) => {
    try {
      if (editingTemplate) {
        // Update existing
        setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, ...templateData } : t));
        toast.success("Template updated successfully!");
      } else {
        // Create new
        const newTemplate: EmailTemplate = {
          id: `custom-${Date.now()}`,
          name: templateData.name || "New Template",
          subject: templateData.subject || "",
          body: templateData.body || "",
          category: templateData.category || "general",
          variables: templateData.variables || [],
          isDefault: false,
          createdAt: new Date().toISOString(),
        };
        setTemplates([...templates, newTemplate]);
        toast.success("Template created successfully!");
      }
      setIsCreateDialogOpen(false);
      setEditingTemplate(null);
    } catch (error: unknown) {
      logger.error("[SAVE_TEMPLATE_ERROR]", { error });
      toast.error("Failed to save template");
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    toast.success("Template deleted");
  };

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const duplicated: EmailTemplate = {
      ...template,
      id: `copy-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    setTemplates([...templates, duplicated]);
    toast.success("Template duplicated!");
  };

  const filteredTemplates = selectedCategory === "all"
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Email Templates</h1>
        <Button onClick={() => { setEditingTemplate(null); setIsCreateDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="pt-6">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1 capitalize">{template.category}</Badge>
                </div>
                {template.isDefault && <Badge>Default</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Subject:</p>
                <p className="text-sm font-medium">{template.subject}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setEditingTemplate(template); setIsCreateDialogOpen(true); }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicateTemplate(template)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Duplicate
                </Button>
                {!template.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create New Template"}</DialogTitle>
          </DialogHeader>
          <TemplateForm
            template={editingTemplate}
            onSave={handleSaveTemplate}
            onCancel={() => { setIsCreateDialogOpen(false); setEditingTemplate(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TemplateFormProps {
  template: EmailTemplate | null;
  onSave: (data: Partial<EmailTemplate>) => void;
  onCancel: () => void;
}

function TemplateForm({ template, onSave, onCancel }: TemplateFormProps) {
  const [name, setName] = useState(template?.name || "");
  const [subject, setSubject] = useState(template?.subject || "");
  const [body, setBody] = useState(template?.body || "");
  const [category, setCategory] = useState(template?.category || "general");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract variables from body ({{variable}})
    const variableRegex = /{{(\w+)}}/g;
    const variables: string[] = [];
    let match;
    while ((match = variableRegex.exec(body)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    onSave({ name, subject, body, category, variables });
  };

  const insertVariable = (variable: string) => {
    setBody(body + `{{${variable}}}`);
  };

  const commonVariables = [
    "donorName", "amount", "date", "campaignName", "nonprofitName",
    "volunteerName", "shiftDate", "location", "grantName"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Thank You - Major Donor"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thank-you">Thank You</SelectItem>
              <SelectItem value="campaign">Campaign</SelectItem>
              <SelectItem value="volunteer">Volunteer</SelectItem>
              <SelectItem value="grant">Grant</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="subject">Email Subject</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject line"
          required
        />
      </div>

      <div>
        <Label>Quick Insert Variables</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {commonVariables.map(variable => (
            <Badge
              key={variable}
              variant="outline"
              className="cursor-pointer hover:bg-blue-50"
              onClick={() => insertVariable(variable)}
            >
              {`{{${variable}}}`}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="body">Email Body</Label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Email content with {{variables}}"
          rows={12}
          required
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
