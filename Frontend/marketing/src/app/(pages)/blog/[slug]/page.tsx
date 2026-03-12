import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@vayva/ui";
import { ArrowLeft, Calendar, User, Tag, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
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

const POSTS: BlogPost[] = [
  {
    id: 1,
    title: "How to Automate WhatsApp Sales Without Losing the Personal Touch",
    excerpt: "Automation does not have to feel robotic. Learn how successful Nigerian brands use Vayva to handle inquiries around the clock while keeping customers happy and engaged with personalized responses.",
    category: "Guides",
    author: "Tola Adesina",
    authorImage: "https://randomuser.me/api/portraits/women/44.jpg",
    authorBio: "Growth Lead at Vayva. Passionate about helping Nigerian businesses scale.",
    date: "Dec 28, 2025",
    image: "/images/step-1-whatsapp.png",
    slug: "automate-whatsapp-sales",
    readTime: "5 min read",
    content: `
## The Challenge of WhatsApp Sales

Every Nigerian business owner knows the struggle. Your phone buzzes constantly with pricing questions, and you are torn between responding quickly and actually running your business.

## A Better Way With Automation

Vayva helps you keep up with messages while staying focused on fulfillment and growth. Customers get fast, consistent answers and you stay in control.

## How It Works

1. Intent recognition that understands what customers want to buy.
2. Smart responses that include the right price and details.
3. Human handoff when a conversation needs your attention.

## Real Results From Nigerian Businesses

Fashion and food brands report faster replies, fewer missed orders, and happier customers after using Vayva for their WhatsApp conversations.

## Getting Started

1. Connect your WhatsApp Business number.
2. Import your product catalog.
3. Set your brand voice and responses.
4. Go live and monitor conversations.

## The Bottom Line

Automation helps you respond faster while keeping the personal touch. Ready to transform your WhatsApp sales? Get started with Vayva today.
    `,
  },
  {
    id: 2,
    title: "5 Nigerian Brands That Scaled to ₦10M/Month on WhatsApp",
    excerpt: "From fashion to food, see how these local businesses transformed their chaotic WhatsApp DMs into streamlined sales channels. Case studies included.",
    category: "Success Stories",
    author: "Chidi Nwafor",
    authorImage: "https://randomuser.me/api/portraits/men/32.jpg",
    authorBio: "Content Writer at Vayva. Telling stories of Nigerian business success.",
    date: "Dec 20, 2025",
    image: "/images/calm-solution.jpg",
    slug: "nigerian-brands-scale",
    readTime: "8 min read",
    content: `
## Introduction

WhatsApp is more than a messaging app in Nigeria. It is a sales channel. Some businesses have learned how to turn chat into steady revenue and repeat customers.

## What These Brands Did

1. Replied fast and kept customers informed.
2. Kept product catalogs clear with prices.
3. Followed up on every order to completion.
4. Made payments simple and professional.

## Your Turn

These businesses did not have special advantages. They treated WhatsApp as a real sales channel and built consistent habits. Ready to join them? Start your Vayva journey today.
    `,
  },
  {
    id: 3,
    title: "Understanding the New CBN KYC Requirements for Online Sellers",
    excerpt: "Confused by the latest banking regulations? We break down exactly what online vendors need to know to keep their business accounts compliant in 2026.",
    category: "Regulation",
    author: "Sarah Okonjo",
    authorImage: "https://randomuser.me/api/portraits/women/68.jpg",
    authorBio: "Legal & Compliance at Vayva. Making regulations understandable.",
    date: "Dec 15, 2025",
    image: "/images/chaos-problem.jpg",
    slug: "cbn-kyc-requirements",
    readTime: "6 min read",
    content: `
## What Changed

KYC requirements continue to evolve for businesses that accept digital payments in Nigeria. If you sell online, you should expect to provide identity and business details to your payment partners.

## Who Needs To Comply

If you accept digital payments or process customer orders online, you should complete KYC for your business account.

## What You Should Prepare

1. Valid identity documents for the owner or directors.
2. Business registration details when applicable.
3. Proof of address or business location.

## What Vayva Does For You

When you sign up for Vayva, we guide you through the KYC process step by step and show the exact requirements for your account.

## Action Steps

1. Check your current verification status in your dashboard.
2. Gather required documents.
3. Submit through your Vayva dashboard and track progress.

## Need Help

Our compliance team is available to answer questions. Contact support or check the Help Center for the latest guidance.
    `,
  },
  {
    id: 4,
    title: "The Ultimate Guide to Inventory Management for IG vendors",
    excerpt: "Stop overselling and disappointing customers. Discover simple strategies to track stock levels across Instagram, WhatsApp, and your physical store.",
    category: "Operations",
    author: "David Ibrahim",
    authorImage: "https://randomuser.me/api/portraits/men/86.jpg",
    authorBio: "Operations Expert at Vayva. Helping businesses run smoothly.",
    date: "Dec 10, 2025",
    image: "/images/mobile-showcase.png",
    slug: "inventory-management-guide",
    readTime: "7 min read",
    content: `
## The Overselling Problem

Every IG vendor has been there. You post a product, it goes viral, and suddenly you have more orders than stock.

## Why Traditional Methods Fail

Spreadsheets get outdated quickly, memory fails when you are busy, and notes get lost.

## The Vayva Solution

Vayva inventory syncs across all your channels in real time so stock stays accurate.

## Setting Up Your Inventory

1. Import your products with names, prices, and starting quantities.
2. Connect your sales channels so stock updates everywhere.
3. Set alerts for low stock and restock reminders.

## Best Practices

1. Do a physical count monthly.
2. Keep a small buffer for unexpected demand.
3. Track seasonal peaks and plan ahead.
4. Know supplier lead times so you reorder on time.

## The Results

Vendors report fewer stockouts, less time spent on tracking, and more customer satisfaction.

## Get Started

Stop the spreadsheet stress. Sign up for Vayva and get inventory under control today.
    `,
  },
];

export function generateStaticParams() {
  return POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) {
    return {
      title: "Post Not Found | Vayva Blog",
    };
  }
  return {
    title: `${post.title} | Vayva Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

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
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n\n/g, '</p><p class="mb-4 text-muted-foreground leading-relaxed">')
                .replace(/^- /gm, '<li class="ml-4 mb-2">')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
            }}
          />
        </article>
      </section>

      {/* Share */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="text-muted-foreground font-medium">Found this helpful? Share it!</p>
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
          <h2 className="text-2xl font-bold text-foreground mb-8">More Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {POSTS.filter((p) => p.slug !== post.slug)
              .slice(0, 3)
              .map((relatedPost) => (
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
                  <p className="text-sm text-muted-foreground mt-2">{relatedPost.date}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
