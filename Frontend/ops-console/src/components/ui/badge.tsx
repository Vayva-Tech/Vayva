import { StatusChip } from "@vayva/ui";

export const Badge = ({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
}) => {
  // Map variants to StatusChip type
  let type: "success" | "warning" | "error" | "info" | "neutral" = "neutral";
  if (variant === "default") type = "success";
  if (variant === "destructive") type = "error";
  if (variant === "secondary") type = "info";

  // StatusChip expects 'status' string as content and 'type' as style
  return <StatusChip status={String(children)} type={type} />;
};
