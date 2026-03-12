"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Ticket } from "@vayva/industry-restaurant";

interface LiveOrderFeedProps {
  tickets: Ticket[];
}

export function LiveOrderFeed({ tickets }: LiveOrderFeedProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh': return 'bg-blue-500';
      case 'cooking': return 'bg-orange-500';
      case 'ready': return 'bg-green-500';
      case 'urgent': return 'bg-red-500';
      case 'overdue': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live Order Feed</span>
          <Badge variant="destructive" className="animate-pulse">
            LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 border rounded-lg bg-card hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(ticket.status)} animate-pulse`} />
                    <span className="font-semibold">{ticket.ticketNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(ticket.startTime || new Date())}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Table:</span>
                    <span className="ml-2 font-medium">{ticket.tableNumber || 'Takeout'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Server:</span>
                    <span className="ml-2 font-medium">{String(ticket.serverName)}</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Items ({ticket.items.length}):</p>
                  {ticket.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <Badge variant={item.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                  {ticket.items.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{ticket.items.length - 3} more items</p>
                  )}
                </div>

                {ticket.allergies && ticket.allergies.length > 0 && (
                  <div className="mt-3 p-2 bg-red-100 dark:bg-red-900 rounded flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      Allergies: {ticket.allergies.join(', ')}
                    </span>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{String(ticket.type)}</Badge>
                    {ticket.priority === 'urgent' && (
                      <Badge variant="destructive">URGENT</Badge>
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    Timer: {Math.floor(ticket.timerSeconds / 60)}:{(ticket.timerSeconds % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
