'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { TabletKdsViewProps } from './ActiveTicketsByStation';

export function KitchenStatus(_props: TabletKdsViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Kitchen Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Online</Badge>
          <Badge variant="outline">All Systems Operational</Badge>
        </div>
      </CardContent>
    </Card>
  );
}