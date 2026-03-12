import { StatusChip } from "@vayva/ui";
import { cn } from "@/lib/utils";

export const Badge = ({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}) => {
  // Map variants to StatusChip type
  let type: "success" | "warning" | "error" | "info" | "neutral" = "neutral";
  if (variant === "default") type = "success";
  if (variant === "destructive") type = "error";
  if (variant === "secondary") type = "info";

  // StatusChip expects 'status' string as content and 'type' as style
  return (
    <div className={cn("inline-flex", className)}>
      <StatusChip status={String(children)} type={type} />
    </div>
  );
};
