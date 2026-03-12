'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export function EightySixBoard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          86 Board
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Badge variant="destructive">Sold Out Items</Badge>
          <p className="text-sm text-muted-foreground">
            No items currently marked as 86
          </p>
        </div>
      </CardContent>
    </Card>
  );
}