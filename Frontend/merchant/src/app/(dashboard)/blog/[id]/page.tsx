import { BlogForm, type BlogFormInitialData } from "../blog-form";
import { getBlogPost, getBlogPosts, updateBlogPost } from "../actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// Generate static params for all blog posts
export async function generateStaticParams() {
  try {
    // Get all blog posts to generate paths for
    const posts = (await getBlogPosts("")) as { id: string }[];
    return posts.map((post) => ({
      id: post.id,
    }));
  } catch (error) {
    console.error("Failed to generate static params:", error);
    return [];
  }
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPage(props: Props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/signin");
  if (!session.user?.storeId) redirect("/onboarding");

  const postRaw = await getBlogPost(session.user?.storeId, params.id);
  if (!postRaw || typeof postRaw !== "object") notFound();

  const post = postRaw as BlogFormInitialData;

  const updateAction = updateBlogPost.bind(
    null,
    session.user?.storeId,
    params.id,
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit post</h1>
      </div>
      <BlogForm
        initialData={post}
        action={updateAction}
        submitLabel="Update Post"
      />
    </div>
  );
}
