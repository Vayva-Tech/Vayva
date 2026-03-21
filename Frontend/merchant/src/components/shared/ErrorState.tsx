"use client";

import { Button, Card, Icon } from "@vayva/ui";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  fullPage?: boolean;
}

export function ErrorState({ message, onRetry, fullPage = false }: ErrorStateProps) {
  const containerClass = fullPage
    ? "max-w-6xl mx-auto py-6 px-4"
    : "max-w-4xl mx-auto py-4 px-4";

  return (
    <div className={containerClass}>
      <Card className="p-12 text-center border-status-danger/20 bg-status-danger/10">
        <Icon
          name="AlertCircle"
          className="h-12 w-12 text-status-danger mx-auto mb-4"
        />
        <h3 className="text-lg font-bold text-status-danger mb-2">Failed to Load</h3>
        <p className="text-status-danger/80 mb-6">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <Icon name="RefreshCw" className="mr-2" size={16} />
            Retry
          </Button>
        )}
      </Card>
    </div>
  );
}
