"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@vayva/ui";
import { Plus, PencilSimple as Pencil } from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
}

interface BlogListClientProps {
  posts: BlogPost[];
}

export function BlogListClient({ posts }: BlogListClientProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog posts</h1>
          <p className="text-gray-500">
            Manage your articles and SEO content.
          </p>
        </div>
        <Link href="/dashboard/blog/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-500 mb-4">No posts yet.</p>
            <Link href="/dashboard/blog/new">
              <Button variant="outline">Create your first post</Button>
            </Link>
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-gray-100 data-[state=selected]:bg-gray-100">
                  <th className="h-12 px-4 align-middle font-medium text-gray-500">
                    Title
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-gray-500">
                    Status
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-gray-500">
                    Published
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-gray-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr]:border-b">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b transition-colors hover:bg-gray-100"
                  >
                    <td className="p-4 align-middle font-medium">
                      {post.title}
                      <div className="text-xs text-gray-500 font-normal">
                        /{post.slug}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge
                        variant={post.status === "PUBLISHED" ? "default" : "secondary"
                        }
                      >
                        {post.status}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/blog/${post.id}`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
