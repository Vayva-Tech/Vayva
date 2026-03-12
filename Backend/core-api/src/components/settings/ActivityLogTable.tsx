"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, Badge } from "@vayva/ui";
import { Eye } from "@phosphor-icons/react/ssr";

interface LogEntry {
  id: string;
  createdAt: string;
  actorUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  before: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  after: any;
}

interface ActivityLogTableProps {
  logs: LogEntry[];
}

export function ActivityLogTable({ logs }: ActivityLogTableProps) {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  return (
    <div className="bg-background rounded-xl border border-border/40 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-white/40">
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Target</TableHead>
            <TableHead className="text-right">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} className="hover:bg-white/30">
              <TableCell className="text-text-tertiary whitespace-nowrap">
                {format(new Date(log.createdAt), "MMM d, h:mm a")}
              </TableCell>
              <TableCell className="font-medium text-text-primary">
                {log.actorUserId.slice(0, 8)}...
              </TableCell>
              <TableCell>
                <Badge className="font-medium bg-blue-50 text-blue-700 border-blue-100">
                  {log.action}
                </Badge>
              </TableCell>
              <TableCell className="text-text-secondary max-w-[200px] truncate">
                <span className="text-xs uppercase font-bold text-text-tertiary mr-2">
                  {log.targetType}
                </span>
                {log.targetId.slice(0, 8)}...
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLog(log)}
                  className="h-8 w-8 rounded-full p-0 text-text-tertiary hover:text-text-primary"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {logs.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-text-tertiary"
              >
                No activity logs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-tertiary block text-xs uppercase font-bold">
                    Action
                  </span>
                  <span className="font-medium">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-text-tertiary block text-xs uppercase font-bold">
                    Date
                  </span>
                  <span className="font-medium">
                    {format(new Date(selectedLog.createdAt), "PPpp")}
                  </span>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-2 bg-white/40 border-b text-xs font-bold uppercase tracking-wider p-2">
                  <div className="text-red-700">Before</div>
                  <div className="text-green-700">After</div>
                </div>
                <div className="grid grid-cols-2 divide-x h-[300px] overflow-y-auto font-mono text-sm">
                  <div className="p-4 bg-red-50/10">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.before || {}, null, 2)}
                    </pre>
                  </div>
                  <div className="p-4 bg-green-50/10">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.after || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
