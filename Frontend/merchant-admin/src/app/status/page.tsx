"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SYSTEM_STATUS = {
  api: "Operational",
  db: "Operational",
  payments: "Operational",
  email: "Degraded",
};

export default function StatusPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">System Status</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(SYSTEM_STATUS).map(([key, status]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="capitalize">{key}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-lg font-bold ${status === "Operational" ? "text-green-600" : "text-amber-600"}`}
              >
                {status}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Detailed Metrics</h2>
        <p>All systems functional.</p>
      </div>
    </div>
  );
}
