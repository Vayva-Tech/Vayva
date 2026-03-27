/**
 * Blog & Media - Posts Management Page
 */
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

export default function BlogMediaPostsPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/blog-media")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Posts</h1>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Blog Posts Management</h3>
            <p className="text-muted-foreground">Create, edit, and manage all blog content</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
