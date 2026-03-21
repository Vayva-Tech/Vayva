import { Button, Icon, type IconName } from "@vayva/ui";
import Link from "next/link";

export function CircleIconButton({
  icon,
  label,
  href,
  onClick,
}: {
  icon: IconName;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const button = (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-full border border-gray-100 bg-white hover:bg-white focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:outline-none transition-all"
      aria-label={label}
      title={label}
      type="button"
      onClick={onClick}
    >
      <Icon name={icon} size={16} className="text-gray-400" />
    </Button>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {button}
      </Link>
    );
  }

  return button;
}
