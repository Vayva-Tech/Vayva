"use client";

import React from "react";
import { Button, Icon, cn } from "@vayva/ui";
import { formatDate } from "@vayva/shared";
import { StatusPill } from "./StatusPill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export interface DeploymentEntry {
  id: string;
  status: "SUCCESS" | "FAILED" | "BUILDING" | "PUBLISHED" | string;
  type: "PREVIEW" | "PUBLISH" | string;
  createdAt: string;
  actorLabel?: string;
  logsUrl?: string;
  previewUrl?: string;
  thumbnailUrl?: string;
}

interface DeploymentTableProps {
  deployments: DeploymentEntry[];
  currentDeploymentId?: string | null;
  draftDeploymentId?: string | null;
  onPreview: (deployment: DeploymentEntry) => void;
  onPublish: (deployment: DeploymentEntry) => void;
  onRollback: (deployment: DeploymentEntry) => void;
  onViewLogs: (deployment: DeploymentEntry) => void;
}

export function DeploymentTable({
  deployments,
  currentDeploymentId,
  draftDeploymentId,
  onPreview,
  onRollback,
  onViewLogs,
}: DeploymentTableProps) {
  return (
    <div className="rounded-[32px] border border-border/40 bg-background/50 backdrop-blur-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-white/30">
          <TableRow className="hover:bg-transparent border-border/40">
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-text-tertiary h-12 px-6">
              Status
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-text-tertiary h-12 px-6">
              Type
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-text-tertiary h-12 px-6">
              Time
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-text-tertiary h-12 px-6">
              User
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-text-tertiary h-12 px-6 text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deployments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-32 text-center text-sm text-text-tertiary"
              >
                No deployment history found.
              </TableCell>
            </TableRow>
          ) : (
            deployments.map((deployment) => (
              <TableRow
                key={deployment.id}
                className="border-border/40 group transition-colors hover:bg-white/20"
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        deployment.status === "SUCCESS" ||
                          deployment.status === "PUBLISHED"
                          ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                          : deployment.status === "FAILED"
                            ? "bg-red-500"
                            : "bg-amber-500 animate-pulse",
                      )}
                    />
                    <span className="text-xs font-bold text-text-primary capitalize">
                      {deployment.status.toLowerCase()}
                    </span>
                    {deployment.id === currentDeploymentId && (
                      <StatusPill
                        status="LIVE"
                        className="scale-75 origin-left ml-1"
                      />
                    )}
                    {deployment.id === draftDeploymentId && (
                      <StatusPill
                        status="DRAFT"
                        className="scale-75 origin-left ml-1"
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Badge className="text-[9px] font-black uppercase bg-white/30 border-border/40 text-text-secondary">
                    {deployment.type}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="text-xs font-medium text-text-secondary">
                    {formatDate(deployment.createdAt)}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                    <Icon
                      name="User"
                      size={12}
                      className="text-text-tertiary"
                    />
                    {deployment.actorLabel}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-white/40 text-text-tertiary hover:text-text-primary"
                      onClick={() => onPreview(deployment)}
                      title="Preview"
                    >
                      <Icon name="Eye" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-white/40 text-text-tertiary hover:text-text-primary"
                      onClick={() => onViewLogs(deployment)}
                      title="View Logs"
                    >
                      <Icon name="FileText" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-white/40 text-text-tertiary hover:text-primary"
                      onClick={() => onRollback(deployment)}
                      title="Rollback"
                    >
                      <Icon name="History" size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
        className,
      )}
    >
      {children}
    </span>
  );
}
