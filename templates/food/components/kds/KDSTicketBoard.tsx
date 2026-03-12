"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, CheckCircle, Timer } from "lucide-react";
import { Ticket } from "@vayva/industry-restaurant";

interface KDSTicketBoardProps {
  tickets: Ticket[];
  onStartTicket?: (ticketId: string) => void;
  onCompleteTicket?: (ticketId: string) => void;
  onBumpTicket?: (ticketId: string, minutes: number) => void;
}

export function KDSTicketBoard({ 
  tickets, 
  onStartTicket, 
  onCompleteTicket, 
  onBumpTicket 
}: KDSTicketBoardProps) {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950';
      case 'cooking': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950';
      case 'ready': return 'border-l-green-500 bg-green-50 dark:bg-green-950';
      case 'urgent': return 'border-l-red-500 bg-red-50 dark:bg-red-950';
      case 'overdue': return 'border-l-purple-500 bg-purple-50 dark:bg-purple-950';
      default: return 'border-l-gray-500';
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isOverdue = (ticket: Ticket) => {
    return ticket.timerSeconds > 900; // 15 minutes
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tickets.map((ticket) => (
        <Card 
          key={ticket.id} 
          className={`border-l-4 ${getStatusColor(ticket.status)} transition-all hover:shadow-lg`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">
                {ticket.ticketNumber}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={ticket.priority === 'urgent' ? 'destructive' : 'outline'}>
                  {String(ticket.priority)}
                </Badge>
                <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                  isOverdue(ticket) ? 'bg-red-100 text-red-700' : 'bg-gray-100'
                }`}>
                  <Timer className="w-3 h-3" />
                  <span className="text-xs font-mono">{formatTimer(ticket.timerSeconds)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Table {ticket.tableNumber || 'Takeout'}</span>
              </div>
              <div>Server: {String(ticket.serverName)}</div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold mb-2">Items ({ticket.items.length})</h4>
                <ul className="space-y-1">
                  {ticket.items.map((item, idx) => (
                    <li key={idx} className="text-sm flex items-center justify-between">
                      <span>
                        {item.quantity}x {item.name}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({item.modifiers.map(m => m.value).join(', ')})
                          </span>
                        )}
                      </span>
                      <Badge variant={item.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                        {item.station}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>

              {ticket.allergies && ticket.allergies.length > 0 && (
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    ALLERGIES: {ticket.allergies.join(', ')}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                {ticket.status === 'fresh' && (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onStartTicket?.(ticket.id)}
                  >
                    Start
                  </Button>
                )}
                {ticket.status === 'cooking' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => onBumpTicket?.(ticket.id, 5)}
                    >
                      +5 min
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onCompleteTicket?.(ticket.id)}
                    >
                      Complete
                    </Button>
                  </>
                )}
                {ticket.status === 'ready' && (
                  <Button size="sm" className="flex-1" disabled>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Ready
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
