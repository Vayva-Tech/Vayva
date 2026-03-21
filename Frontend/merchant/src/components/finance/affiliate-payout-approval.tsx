"use client";

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Banknote } from "lucide-react";

interface PendingPayout {
  id: string;
  affiliateId: string;
  affiliateName: string;
  affiliateEmail: string;
  amount: number;
  bankName?: string;
  accountNumber?: string;
  requestedAt: string;
}

interface AffiliatePayoutApprovalProps {
  storeId: string;
}

export function AffiliatePayoutApproval({ storeId }: AffiliatePayoutApprovalProps) {
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PendingPayout | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const { toast } = useToast();

  // Fetch pending payouts
  useEffect(() => {
    fetchPendingPayouts();
  }, [storeId]);

  const fetchPendingPayouts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/affiliate/payout/approvals?storeId=${storeId}`);
      const data = await response.json();

      if (data.success) {
        setPendingPayouts(data.approvals);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch pending payouts",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error("[Affiliate Payout Approval] Error fetching:", { error });
      toast({
        title: "Error",
        description: "Failed to fetch pending payouts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (payout: PendingPayout) => {
    try {
      setIsProcessing(payout.id);
      const response = await fetch("/api/affiliate/payout/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId: payout.id,
          approvedBy: "admin", // Should come from auth context
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Payout Approved",
          description: `Transfer initiated for ${payout.affiliateName}. Transfer code: ${data.transferCode}`,
        });
        // Remove from pending list
        setPendingPayouts((prev) => prev.filter((p) => p.id !== payout.id));
      } else {
        toast({
          title: "Approval Failed",
          description: data.error || "Failed to approve payout",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error("[Affiliate Payout Approval] Error approving:", { error });
      toast({
        title: "Error",
        description: "Failed to approve payout",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedPayout) return;

    try {
      setIsProcessing(selectedPayout.id);
      const response = await fetch("/api/affiliate/payout/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId: selectedPayout.id,
          rejectedBy: "admin", // Should come from auth context
          reason: rejectionReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Payout Rejected",
          description: `Payout for ${selectedPayout.affiliateName} has been rejected.`,
        });
        // Remove from pending list
        setPendingPayouts((prev) => prev.filter((p) => p.id !== selectedPayout.id));
        setShowRejectDialog(false);
        setRejectionReason("");
        setSelectedPayout(null);
      } else {
        toast({
          title: "Rejection Failed",
          description: data.error || "Failed to reject payout",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error("[Affiliate Payout Approval] Error rejecting:", { error });
      toast({
        title: "Error",
        description: "Failed to reject payout",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const openRejectDialog = (payout: PendingPayout) => {
    setSelectedPayout(payout);
    setShowRejectDialog(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </CardContent>
      </Card>
    );
  }

  if (pendingPayouts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium">No Pending Approvals</h3>
          <p className="text-sm text-gray-500 mt-1">
            All affiliate payouts are up to date. New requests requiring approval will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Pending Affiliate Payouts
          </CardTitle>
          <CardDescription>
            Review and approve affiliate commission payouts. Amounts over ₦10,000 require manual approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Bank Account</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPayouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>
                    <div className="font-medium">{payout.affiliateName}</div>
                    <div className="text-sm text-gray-500">{payout.affiliateEmail}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="font-mono">
                      {formatCurrency(payout.amount / 100)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {payout.bankName && payout.accountNumber ? (
                      <div className="text-sm">
                        <div>{payout.bankName}</div>
                        <div className="text-gray-500">
                          ****{payout.accountNumber.slice(-4)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-red-500">No bank account</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {new Date(payout.requestedAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRejectDialog(payout)}
                        disabled={isProcessing === payout.id}
                      >
                        {isProcessing === payout.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span className="ml-1">Reject</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(payout)}
                        disabled={isProcessing === payout.id}
                      >
                        {isProcessing === payout.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        <span className="ml-1">Approve</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payout Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject the payout request from{" "}
              <strong>{selectedPayout?.affiliateName}</strong> for{" "}
              <strong>{selectedPayout ? formatCurrency(selectedPayout.amount / 100) : ""}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Rejection Reason (Optional)</Label>
              <Input
                id="reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing === selectedPayout?.id}
            >
              {isProcessing === selectedPayout?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Reject Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
