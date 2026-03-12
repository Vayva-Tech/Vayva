import { Button, Icon, type IconName } from "@vayva/ui";

export function CircleIconButton({
  icon,
  label,
}: {
  icon: IconName;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-full border border-border/60 bg-background/60 hover:bg-background/30"
      aria-label={label}
      title={label}
      type="button"
    >
      <Icon name={icon} size={16} className="text-text-tertiary" />
    </Button>
  );
}
