import { getBlogPosts } from "./actions";
import { BlogListClient } from "./BlogListClient";
import { requireAuth } from "@/lib/session.server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog Content | Vayva Dashboard",
  description: "Manage your store's blog and articles.",
};

export default async function BlogListPage() {
  const user = await requireAuth();
  const postsResult = await getBlogPosts(user.storeId);

  // Ensure data is serializable for the client component
  const posts = postsResult.map((post: { id: string; title: string; slug: string; status: string; publishedAt: Date | null }) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    status: (post as any).status,
    publishedAt: post.publishedAt ? post.publishedAt?.toISOString() : null,
  }));

  return <BlogListClient posts={posts} />;
}
