import * as React from "react";

import { cn } from "../utils";

export interface ToolbarProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function Toolbar({
  left,
  right,
  className,
}: ToolbarProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-2 flex-wrap">{left}</div>
      <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
        {right}
      </div>
    </div>
  );
}
