"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CalendarBlank as Calendar,
  ShareNetwork as Share2,
} from "@phosphor-icons/react";
import { NewsletterForm } from "@/components/blog/NewsletterForm";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorImage: string;
  authorBio: string;
  date: string;
  image: string;
  slug: string;
  content: string;
  readTime: string;
}

export function BlogClient({
  post,
  relatedPosts,
}: {
  post: BlogPost;
  relatedPosts: BlogPost[];
}): React.JSX.Element {
  return (
    <div className="relative">
      {/* Header */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-medium"
          >
            <ArrowLeft size={18} />
            Back to Blog
          </Link>

          <div className="flex items-center gap-4 text-sm mb-6">
            <span className="text-primary text-xs font-bold uppercase tracking-wider">
              {post.category}
            </span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar size={14} /> {post.date}
            </span>
            <span className="text-muted-foreground">{post.readTime}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            {post.excerpt}
          </p>

          {/* Author */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-background shadow-md">
              <Image
                src={post.authorImage}
                alt={post.author}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div>
              <p className="font-bold text-foreground">{post.author}</p>
              <p className="text-sm text-muted-foreground">{post.authorBio}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <article className="max-w-3xl mx-auto prose prose-lg prose-gray prose-headings:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
          <div
            dangerouslySetInnerHTML={{
              __html: post.content
                .replace(/^## /gm, '<h2 class="text-2xl font-bold mt-12 mb-4">')
                .replace(/^### /gm, '<h3 class="text-xl font-bold mt-8 mb-3">')
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(
                  /\n\n/g,
                  '</p><p class="mb-4 text-muted-foreground leading-relaxed">',
                )
                .replace(/^- /gm, '<li class="ml-4 mb-2">')
                .replace(
                  /\[([^\]]+)\]\(([^)]+)\)/g,
                  '<a href="$2" class="text-primary hover:underline">$1</a>',
                ),
            }}
          />
        </article>
      </section>

      {/* Share */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="text-muted-foreground font-medium">
            Found this helpful? Share it!
          </p>
          <div className="flex gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://vayva.ng/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all"
            >
              <Share2 size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center surface-glass rounded-[40px] border border-border/60 p-10 md:p-14 shadow-card">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Want more tips like this?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join 5,000+ merchants receiving weekly growth strategies.
          </p>
          <NewsletterForm />
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            More Articles
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.id}
                href={`/blog/${relatedPost.slug}`}
                className="group bg-background rounded-2xl border border-border p-6 hover:shadow-lg transition-all"
              >
                <span className="text-xs font-bold text-primary uppercase tracking-wide">
                  {relatedPost.category}
                </span>
                <h3 className="text-lg font-bold text-foreground mt-2 group-hover:text-primary transition-colors line-clamp-2">
                  {relatedPost.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {relatedPost.date}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
