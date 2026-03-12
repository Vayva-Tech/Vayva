import React from "react";
import { PDPSkeleton } from "@/components/Skeletons";

export default function Loading(): React.JSX.Element {
  return (
    <div className="bg-background/70 backdrop-blur-xl">
      <PDPSkeleton />
    </div>
  );
}
