'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "lucide-react";

export function ActiveTicketsByStation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Active Tickets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Ticket className="h-12 w-12 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-500">
            Active tickets functionality coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  );
}