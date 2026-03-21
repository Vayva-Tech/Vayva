import { BlogForm } from "../blog-form";
import { createBlogPost } from "../actions";
import { requireAuth } from "@/lib/session.server";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const user = await requireAuth();
  const createAction = createBlogPost.bind(null, user.storeId);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create new post</h1>
      </div>
      <BlogForm action={createAction} submitLabel="Create Post" />
    </div>
  );
}
