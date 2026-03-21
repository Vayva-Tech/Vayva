"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";

// Schema for validation
const BlogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  featuredImage: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
});

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

export async function getBlogPosts(storeId: string) {
  if (!storeId) return [];

  try {
    const cookieHeader = await getCookieHeader();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/posts`,
      {
        headers: {
          cookie: cookieHeader,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.posts || [];
  } catch {
    return [];
  }
}

export async function getBlogPost(storeId: string, id: string) {
  if (!storeId || !id) return null;

  try {
    const cookieHeader = await getCookieHeader();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/posts/${id}`,
      {
        headers: {
          cookie: cookieHeader,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

export async function createBlogPost(storeId: string, formData: FormData) {
  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    featuredImage: formData.get("featuredImage"),
    status: formData.get("status"),
    metaTitle: formData.get("metaTitle"),
    metaDesc: formData.get("metaDesc"),
  };

  const validated = BlogPostSchema.parse(rawData);

  const cookieHeader = await getCookieHeader();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/posts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
      body: JSON.stringify({
        ...validated,
        storeId,
        publishedAt: validated.status === "PUBLISHED" ? new Date().toISOString() : null,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to create post" }));
    throw new Error(error.error || "Failed to create post");
  }

  const post = await response.json();
  revalidatePath("/blog");
  return { success: true, id: post.id };
}

export async function updateBlogPost(
  storeId: string,
  id: string,
  formData: FormData,
) {
  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    featuredImage: formData.get("featuredImage"),
    status: formData.get("status"),
    metaTitle: formData.get("metaTitle"),
    metaDesc: formData.get("metaDesc"),
  };

  const validated = BlogPostSchema.parse(rawData);

  const cookieHeader = await getCookieHeader();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/posts/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
      body: JSON.stringify({
        ...validated,
        publishedAt: validated.status === "PUBLISHED" ? new Date().toISOString() : null,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to update post" }));
    throw new Error(error.error || "Failed to update post");
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${id}`);
  return { success: true };
}

export async function deleteBlogPost(storeId: string, id: string) {
  const cookieHeader = await getCookieHeader();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/posts/${id}`,
    {
      method: "DELETE",
      headers: {
        cookie: cookieHeader,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Post not found" }));
    throw new Error(error.error || "Post not found");
  }

  revalidatePath("/blog");
  return { success: true };
}
