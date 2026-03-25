'use client';

import * as React from 'react';

/** Shims for shadcn-style names not exported from `@vayva/ui`. */
export function CardTitle({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element {
  return (
    <h3
      className={['text-lg font-semibold tracking-tight', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </h3>
  );
}

export function ScrollArea({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={['max-h-[60vh] overflow-y-auto', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
