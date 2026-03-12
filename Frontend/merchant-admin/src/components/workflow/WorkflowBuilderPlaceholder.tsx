'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Workflow, Play, Save } from "lucide-react";

export function WorkflowBuilderPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Workflow Builder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Workflow builder functionality coming soon
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" disabled>
              <Play className="h-4 w-4 mr-2" />
              Run Workflow
            </Button>
            <Button variant="outline" disabled>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}