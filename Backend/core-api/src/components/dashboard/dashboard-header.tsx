import { Skeleton } from "@/components/ui/skeleton";

interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}

export function DashboardHeader({
  heading,
  text,
  children,
  action,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="font-heading text-3xl md:text-4xl">{heading}</h1>
        {text && <p className="text-lg text-muted-foreground">{text}</p>}
      </div>
      {action ? action : children}
    </div>
  );
}

DashboardHeader.Skeleton = function DashboardHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-9 w-24" />
    </div>
  );
};
