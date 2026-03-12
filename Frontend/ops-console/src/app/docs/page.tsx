"use client";

import { useEffect, useState } from "react";
import { Loader2, FileJson, ExternalLink } from "lucide-react";
import { Button } from "@vayva/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ApiEndpoint {
  path: string;
  method: string;
  summary: string;
  tag: string;
}

export default function DocsPage() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/openapi.yaml")
      .then((res) => res.text())
      .then((text) => {
        const lines = text.split("\n");
        const allEndpoints: ApiEndpoint[] = [];
        let currentPath = "";
        let currentMethod = "";
        let currentSummary = "";
        let currentTag = "";
        let inPaths = false;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          if (line.startsWith("paths:")) {
            inPaths = true;
            continue;
          }
          if (!inPaths) continue;
          if (line.startsWith("components:")) break;
          
          // New path
          if (line.match(/^ {2}\/[a-z]/)) {
            currentPath = line.trim().replace(":", "");
            continue;
          }
          
          // HTTP method
          if (line.match(/^ {4}(get|post|put|patch|delete):/)) {
            currentMethod = line.trim().split(":")[0];
            currentSummary = "";
            currentTag = "";
          }
          
          // Summary
          if (line.includes("summary:") && currentMethod) {
            currentSummary = line.split("summary:")[1]?.trim() || "";
          }
          
          // Tags
          if (line.includes("tags:") && currentMethod) {
            const nextLine = lines[i + 1];
            if (nextLine && nextLine.includes("- name:")) {
              currentTag = nextLine.split("- name:")[1]?.trim() || "General";
            }
          }
          
          // Responses indicates end of method block
          if (line.includes("responses:") && currentMethod && currentPath && currentSummary) {
            allEndpoints.push({
              path: currentPath,
              method: currentMethod,
              summary: currentSummary,
              tag: currentTag || "General",
            });
            currentMethod = "";
          }
        }

        setEndpoints(allEndpoints);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case "get": return "bg-blue-500 text-white";
      case "post": return "bg-green-500 text-white";
      case "put": return "bg-yellow-500 text-white";
      case "patch": return "bg-purple-500 text-white";
      case "delete": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const groupedEndpoints = () => {
    const groups: Record<string, ApiEndpoint[]> = {};
    for (const ep of endpoints) {
      if (!groups[ep.tag]) groups[ep.tag] = [];
      groups[ep.tag].push(ep);
    }
    return groups;
  };

  const groups = groupedEndpoints();
  const tags = Object.keys(groups).sort();
  const displayEndpoints = selectedTag ? groups[selectedTag] || [] : endpoints;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading API docs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-destructive">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Ops Console API
              </h1>
              <p className="text-muted-foreground mt-1">
                {endpoints.length} endpoints across {tags.length} categories
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/api/openapi.yaml" target="_blank">
                  <FileJson className="h-4 w-4 mr-2" />
                  YAML
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://petstore.swagger.io/?url=http://localhost:3002/api/openapi.yaml" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Swagger UI
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-4 pb-4 space-y-1">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedTag === null
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    All Endpoints
                    <span className="ml-2 float-right">
                      <Badge variant="secondary">{endpoints.length}</Badge>
                    </span>
                  </button>
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedTag === tag
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {tag}
                      <span className="ml-2 float-right">
                        <Badge variant="secondary">{groups[tag].length}</Badge>
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Endpoints */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedTag || "All Endpoints"} 
                  <span className="text-muted-foreground font-normal ml-2">
                    ({displayEndpoints.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {displayEndpoints.map((ep, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <span className={`w-16 justify-center font-mono text-xs ${getMethodColor(ep.method)}`}>
                        <Badge>{ep.method.toUpperCase()}</Badge>
                      </span>
                      <code className="text-sm font-mono text-foreground">
                        {ep.path}
                      </code>
                      <span className="text-sm text-muted-foreground ml-auto">
                        {ep.summary}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
