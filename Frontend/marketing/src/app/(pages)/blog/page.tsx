import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@vayva/ui";
import { ArrowRight, Calendar, User, Tag } from "lucide-react";
import { APP_URL } from "@/lib/constants";
import { NewsletterForm } from "@/components/blog/NewsletterForm";

export const metadata = {
  title: "Blog | Vayva Business Growth and WhatsApp Tips",
  description: "Expert advice, success stories, and updates for Nigerian businesses running on WhatsApp.",
};

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorImage: string;
  date: string;
  image: string;
  slug: string;
}

const POSTS: BlogPost[] = [
  {
    id: 1,
    title: "How to Automate WhatsApp Sales Without Losing the Personal Touch",
    excerpt: "Automation does not have to feel robotic. Learn how successful Nigerian brands use Vayva to handle inquiries around the clock while keeping customers happy and engaged with personalized responses.",
    category: "Guides",
    author: "Tola Adesina",
    authorImage: "https://randomuser.me/api/portraits/women/44.jpg",
    date: "Dec 28, 2025",
    image: "/images/step-1-whatsapp.png",
    slug: "automate-whatsapp-sales",
  },
  {
    id: 2,
    title: "5 Nigerian Brands That Scaled to ₦10M/Month on WhatsApp",
    excerpt: "From fashion to food, see how these local businesses transformed their chaotic WhatsApp DMs into streamlined sales channels. Case studies included.",
    category: "Success Stories",
    author: "Chidi Nwafor",
    authorImage: "https://randomuser.me/api/portraits/men/32.jpg",
    date: "Dec 20, 2025",
    image: "/images/calm-solution.jpg",
    slug: "nigerian-brands-scale",
  },
  {
    id: 3,
    title: "Understanding the New CBN KYC Requirements for Online Sellers",
    excerpt: "Confused by the latest banking regulations? We break down exactly what online vendors need to know to keep their business accounts compliant in 2026.",
    category: "Regulation",
    author: "Sarah Okonjo",
    authorImage: "https://randomuser.me/api/portraits/women/68.jpg",
    date: "Dec 15, 2025",
    image: "/images/chaos-problem.jpg",
    slug: "cbn-kyc-requirements",
  },
  {
    id: 4,
    title: "The Ultimate Guide to Inventory Management for IG vendors",
    excerpt: "Stop overselling and disappointing customers. Discover simple strategies to track stock levels across Instagram, WhatsApp, and your physical store.",
    category: "Operations",
    author: "David Ibrahim",
    authorImage: "https://randomuser.me/api/portraits/men/86.jpg",
    date: "Dec 10, 2025",
    image: "/images/mobile-showcase.png",
    slug: "inventory-management-guide",
  },
];

export default function BlogPage(): React.JSX.Element {
  return (
    <div className="relative">
      {/* Header */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            The Vayva Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights, updates, and strategies to help you build a better business on WhatsApp.
          </p>
        </div>
      </section>

      {/* Featured Post (Simulator) */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="relative aspect-video bg-muted rounded-3xl overflow-hidden shadow-lg border border-border">
              {/* Placeholder for featured image since we might not have it yet */}
              <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                <span className="font-bold">Featured Image</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-4 text-sm mb-4">
                <span className="text-primary text-xs font-bold uppercase tracking-wider">
                  Product Update
                </span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar size={14} /> Jan 2, 2026
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                Introducing Vayva Support: Your Around-the-Clock Sales Assistant
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                We've rebuilt our core engine to understand Nigerian slang, handle complex orders, and automatically reconcile payments. See what's new in v2.0.
              </p>
              <Link href={`${APP_URL}/signup`}>
                <Button className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-hover transition-all shadow-card">
                  Read the Announcement
                </Button>
              </Link>
            </div>
          </div>

          {/* Post Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {POSTS.map((post) => (
              <Link
                href={`/blog/${post.slug}`}
                key={post.id}
                className="group flex flex-col bg-background border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[1.6] bg-muted relative overflow-hidden">
                  {/* Placeholder */}
                  <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium group-hover:bg-muted/80 transition-colors">
                    {post.category} Image
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wide">
                    <div className="flex items-center gap-1.5 text-primary">
                      <Tag size={12} />
                      {post.category}
                    </div>
                    <span>{post.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/40">
                    <div className="flex items-center gap-2">
                      {post.authorImage ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
                          <Image
                            src={post.authorImage}
                            alt={post.author}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                          <User size={14} />
                        </div>
                      )}
                      <span className="text-xs font-bold text-foreground">{post.author}</span>
                    </div>
                    <span className="text-primary text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center surface-glass rounded-[40px] border border-border/60 p-10 md:p-14 shadow-card">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Get business tips delivered to your inbox
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join 5,000+ merchants receiving weekly growth strategies.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
