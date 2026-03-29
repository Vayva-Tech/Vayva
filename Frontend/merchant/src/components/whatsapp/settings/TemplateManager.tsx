"use client";

import { logger } from "@vayva/shared";
import { useState } from "react";
import { format } from "date-fns";
import {
  Plus,
  Trash as Trash2,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  Warning as AlertTriangle,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, Input } from "@vayva/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface TemplateManagerProps {
    templates: any[];
  onRefresh: () => void;
}

import { apiJson } from "@/lib/api-client-shared";

interface TemplateResponse {
  success: boolean;
}

export function TemplateManager(props: TemplateManagerProps) {
  const { templates, onRefresh } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    language: "en",
    category: "UTILITY",
    bodyText: "",
  });

  const handleCreate = async () => {
    if (!newTemplate.name || !newTemplate.bodyText) {
      toast.error("Name and Body Text are required");
      return;
    }

    setIsSubmitting(true);
    try {
      // Transform bodyText into WhatsApp component structure
      const components = [
        {
          type: "BODY",
          text: newTemplate.bodyText,
        },
      ];

      await apiJson<TemplateResponse>("/settings/whatsapp/templates", {
        method: "POST",
        body: JSON.stringify({
          name: newTemplate.name,
          language: newTemplate.language,
          category: newTemplate.category,
          components,
          status: "pending",
        }),
      });

      toast.success("Template created");
      setIsOpen(false);
      setNewTemplate({
        name: "",
        language: "en",
        category: "UTILITY",
        bodyText: "",
      });
      onRefresh();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[CREATE_WHATSAPP_TEMPLATE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to create template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await apiJson<TemplateResponse>(
        `/api/settings/whatsapp/templates?id=${id}`,
        {
          method: "DELETE",
        },
      );
      toast.success("Template deleted");
      onRefresh();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DELETE_WHATSAPP_TEMPLATE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to delete template");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card>
      <ConfirmDialog
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => {
          if (!confirmDelete.id) return;
          const id = confirmDelete.id;
          setConfirmDelete({ open: false, id: null });
          void handleDelete(id);
        }}
        title="Delete template?"
        message="This template will be removed from your workspace."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Message Templates</CardTitle>
          <CardDescription>
            Manage approved WhatsApp templates for notifications.
          </CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Template</DialogTitle>
              <DialogDescription>
                Create a template to send notifications. It will be
                auto-approved in sandbox.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Template Name</Label>
                <Input
                  placeholder="order_update_v1"
                  value={newTemplate.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewTemplate({
                      ...newTemplate,
                      name: e.target.value.toLowerCase().replace(/\s/g, "_"),
                    })
                  }
                />
                <span className="text-xs text-gray-500">
                  LowerCase, underscores only.
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select
                    value={newTemplate.category}
                                        onValueChange={(val: any) =>
                      setNewTemplate({ ...newTemplate, category: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTILITY">Utility</SelectItem>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                      <SelectItem value="AUTHENTICATION">Auth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Language</Label>
                  <Select
                    value={newTemplate.language}
                                        onValueChange={(val: any) =>
                      setNewTemplate({ ...newTemplate, language: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (en)</SelectItem>
                      <SelectItem value="en_US">English (US)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Body Text</Label>
                <Textarea
                  rows={4}
                  placeholder="Hello {{1}}, your order {{2}} has been shipped!"
                  value={newTemplate.bodyText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewTemplate({ ...newTemplate, bodyText: e.target.value })
                  }
                />
                <span className="text-xs text-gray-500">
                  Use {"{{1}}"}, {"{{2}}"} for variables.
                </span>
              </div>

              {/* Live Preview */}
              <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                <span className="text-xs font-semibold text-green-800 dark:text-green-400 mb-1 block">
                  Preview
                </span>
                <p className="text-sm text-gray-900 dark:text-gray-400 whitespace-pre-wrap">
                  {newTemplate.bodyText || "Message content..."}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={isSubmitting}>
                create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates?.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium font-mono text-xs">
                  {t.name}
                </TableCell>
                <TableCell>{t.category}</TableCell>
                <TableCell>{t.language}</TableCell>
                <TableCell>{getStatusBadge(t.status)}</TableCell>
                <TableCell>
                  {format(new Date(t.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setConfirmDelete({ open: true, id: t.id })}
                  >
                    <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!templates || templates.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  No templates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
