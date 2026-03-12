import { StorefrontService } from "@/services/storefront.service";
import Link from "next/link";
import { StoreShell } from "@/components/StoreShell";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import ReactMarkdown from "react-markdown";

async function getStoreFromHeaders() {
  const headersList = await headers();
  const host = headersList.get("host");
  const slug = host?.split(".")[0];
  if (!slug) return null;
  return await StorefrontService.getStore(slug);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreFromHeaders();
  if (!store) return notFound();

  const post = await StorefrontService.getBlogPost(slug, store.id);
  if (!post) return notFound();

  return (
    <StoreShell>
      <article className="max-w-3xl mx-auto px-4 py-16">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Blog
        </Link>

        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">
            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            {post.tags?.[0] && (
              <>
                <span>•</span>
                <span className="text-black">{post.tags[0]}</span>
              </>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8 leading-tight">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
              {post.excerpt}
            </p>
          )}
        </header>

        {post.featuredImage && (
          <div className="w-full aspect-[21/9] bg-gray-100 rounded-2xl overflow-hidden mb-16 shadow-sm">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg prose-gray mx-auto">
          <ReactMarkdown>{post.content || ""}</ReactMarkdown>
        </div>
      </article>
    </StoreShell>
  );
}
