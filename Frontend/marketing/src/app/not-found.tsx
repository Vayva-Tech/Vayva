import React from "react";

import Link from "next/link";
import { Button } from "@vayva/ui";

export default function NotFound(): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-4xl font-bold text-foreground mb-4">
        Page Not Found
      </h2>
      <p className="text-muted-foreground mb-8">
        Could not find requested resource
      </p>
      <Link href="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
