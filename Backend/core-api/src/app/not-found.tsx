"use client";

import { Button } from "@vayva/ui";
import { useRouter } from "next/navigation";
import { House as Home, ArrowLeft } from "@phosphor-icons/react/ssr";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white/40 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-text-tertiary">404</h1>
          <h2 className="text-2xl font-bold text-text-primary mt-4">
            Page Not Found
          </h2>
          <p className="text-text-tertiary mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
