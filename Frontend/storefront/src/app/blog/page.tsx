import { StorefrontService } from "@/services/storefront.service";
import Link from "next/link";
import { StoreShell } from "@/components/StoreShell";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

async function getStoreFromHeaders() {
  const headersList = await headers();
  const host = headersList.get("host"); // e.g. demo.vayva?.com
  const slug = host?.split(".")[0];
  if (!slug) return null;
  return await StorefrontService.getStore(slug);
}

export default async function BlogIndexPage() {
  const store = await getStoreFromHeaders();
  if (!store) return notFound();

  const posts = await StorefrontService.getBlogPosts(store.id);

  return (
    <StoreShell>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">The Blog</h1>
          <p className="text-xl text-gray-500">
            Stories, news, and updates from {store.name}.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl">
            <p className="text-gray-400">No articles published yet.</p>
          </div>
        ) : (
          <div className="grid gap-12">
            {posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <article className="flex flex-col md:flex-row gap-8 items-start">
                  {post.featuredImage && (
                    <div className="w-full md:w-72 aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                      {post.tags?.[0] && (
                        <>
                          <span>•</span>
                          <span className="text-black">{post.tags[0]}</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-500 leading-relaxed line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    <span className="text-sm font-bold underline">
                      Read Article
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StoreShell>
  );
}
