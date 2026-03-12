import React from "react";

import { Button } from "@vayva/ui"; // Assuming generic UI

import { PublicStore } from "@/types/storefront";

export default function EditorialHome({
  store,
}: {
  store: PublicStore;
}): React.JSX.Element {
  // Mock Data
  const posts = [
    {
      id: 1,
      title: "The Future of Minimalist Design",
      excerpt:
        "Less is more. Discover how 2024 is shaping up to be the year of reduction.",
      image: "/images/blog-1.jpg",
    },
    {
      id: 2,
      title: "Curating Your Workspace",
      excerpt: "A guide to selecting the perfect tools for productivity.",
      image: "/images/blog-2.jpg",
    },
    {
      id: 3,
      title: "Sustainable Materials in Tech",
      excerpt: "Why aluminum and glass are making a comeback.",
      image: "/images/blog-3.jpg",
    },
  ];

  return (
    <div className="bg-transparent min-h-screen font-serif text-gray-900">
      {/* Minimal Header */}
      <header className="py-8 border-b text-center">
        <h1 className="text-4xl font-bold tracking-tighter uppercase">
          {store.name || " The Daily Edit"}
        </h1>
        <nav className="mt-4 space-x-6 text-sm font-medium uppercase text-gray-500">
          <a href="#" className="hover:text-black">
            Culture
          </a>
          <a href="#" className="hover:text-black">
            Design
          </a>
          <a href="#" className="hover:text-black">
            Technology
          </a>
          <a href="#" className="hover:text-black">
            Shop
          </a>
        </nav>
      </header>

      {/* Featured Article */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="aspect-[4/3] bg-gray-200" />
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Featured Story
          </span>
          <h2 className="text-5xl font-medium mt-4 mb-6 leading-tight">
            The Art of Slow Living in a Fast World.
          </h2>
          <p className="text-xl text-gray-500 mb-8">
            We explore how modern creatives are finding balance through
            intentional design.
          </p>
          <Button
            variant="outline"
            className="border-black text-black hover:bg-black hover:text-white rounded-none px-8 h-auto"
            aria-label="Read story"
          >
            Read Story
          </Button>
        </div>
      </section>

      <hr className="mb-16" />

      {/* Article Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
          {posts.map((post) => (
            <div key={post.id} className="group cursor-pointer">
              <div className="aspect-[3/4] bg-background/50 backdrop-blur-sm mb-6 group-hover:opacity-90 transition-opacity" />
              <h3 className="text-2xl font-medium mb-3 group-hover:underline">
                {post.title}
              </h3>
              <p className="text-gray-500 leading-relaxed is-truncated">
                {post.excerpt}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
