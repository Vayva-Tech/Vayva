"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Sparkle as Sparkles,
  TextT,
  Image as ImageIcon,
  Megaphone,
  Robot,
  PaperPlaneRight,
  Spinner as Loader2,
  Copy,
  Check,
} from "@phosphor-icons/react/ssr";
import { logger } from "@vayva/shared";
import { Button, Card, Input, Badge } from "@vayva/ui";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiJson } from "@/lib/api-client-shared";

interface AIResponse {
  result: string;
}

export default function AIPage() {
  const [activeTool, setActiveTool] = useState("text");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    try {
      setLoading(true);
      const endpoint = `/api/ai/${activeTool}`;
      const data = await apiJson<AIResponse>(endpoint, {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      setResult(data.result);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[AI_GENERATE_ERROR]", { error: _errMsg, tool: activeTool });
      toast.error("Failed to generate content");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {navigator?.clipboard?.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  const tools = [
    {
      id: "text",
      name: "Text Generator",
      icon: TextT,
      description: "Generate product descriptions, emails, and more",
      placeholder: "Describe what you want to write...",
    },
    {
      id: "image",
      name: "Image Generator",
      icon: ImageIcon,
      description: "Generate product images and visuals",
      placeholder: "Describe the image you want to create...",
    },
    {
      id: "marketing",
      name: "Marketing Copy",
      icon: Megaphone,
      description: "Generate ad copy and marketing content",
      placeholder: "What product or service do you want to promote?",
    },
    {
      id: "assistant",
      name: "AI Assistant",
      icon: Robot,
      description: "Chat with AI for business advice",
      placeholder: "Ask any business question...",
    },
  ];

  const currentTool = tools.find((t) => t.id === activeTool) || tools[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Tools</h1>
          <p className="text-text-tertiary">
            Boost your productivity with AI-powered tools.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tool Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Select Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  setResult("");
                }}
                variant="ghost"
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  activeTool === tool.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "hover:bg-muted border border-transparent"
                }`}
              >
                <tool.icon className="h-5 w-5" />
                <div>
                  <p className="font-medium text-sm">{tool.name}</p>
                  <p className="text-xs text-text-tertiary">{tool.description}</p>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Generation Interface */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <currentTool.icon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{currentTool.name}</CardTitle>
            </div>
            <p className="text-sm text-text-tertiary">{currentTool.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">Your Prompt</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e: any) => setPrompt(e.target?.value)}
                placeholder={currentTool.placeholder}
                rows={4}
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <PaperPlaneRight className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>

            {result && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <Label>Result</Label>
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    Copy
                  </Button>
                </div>
                <div className="p-4 bg-background/30 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{result}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Tips for Best Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-text-tertiary">
            <li className="flex items-start gap-2">
              <Badge variant="default">1</Badge>
              Be specific about what you want (tone, length, style)
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="default">2</Badge>
              Include key details like product features or target audience
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="default">3</Badge>
              For images, describe visual elements, colors, and composition
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="default">4</Badge>
              You can refine results by asking for adjustments
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
