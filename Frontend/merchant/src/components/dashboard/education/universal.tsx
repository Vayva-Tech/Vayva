'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UniversalSectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function UniversalSectionHeader({ 
  title, 
  subtitle, 
  action,
  className = ""
}: UniversalSectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <CardTitle className="text-xl">{title}</CardTitle>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function UniversalCard({ 
  title, 
  subtitle, 
  children,
  action,
  className = ""
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <UniversalSectionHeader 
          title={title} 
          subtitle={subtitle}
          action={action}
        />
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}