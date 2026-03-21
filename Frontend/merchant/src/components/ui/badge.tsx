import { StatusChip } from "@vayva/ui";
import { cn } from "@/lib/utils";

export const Badge = ({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "danger" | "info";
  className?: string;
}) => {
  // Map variants to StatusChip type with more explicit control
  let type: "success" | "warning" | "error" | "info" | "neutral" = "neutral";
  
  if (variant === "default" || variant === "success") type = "success";
  else if (variant === "destructive" || variant === "danger") type = "error";
  else if (variant === "secondary" || variant === "warning") type = "warning";
  else if (variant === "info") type = "info";

  // StatusChip expects 'status' string as content and 'type' as style
  return (
    <div className={cn("inline-flex", className)}>
      <StatusChip status={String(children)} type={type} />
    </div>
  );
};
