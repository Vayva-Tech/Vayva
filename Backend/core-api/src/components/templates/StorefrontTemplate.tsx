import { Button, cn } from "@vayva/ui";

export type TemplateSection = "home" | "collection" | "product";

export type TemplateConfig = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary?: string;
  accent:
    | "emerald"
    | "amber"
    | "rose"
    | "violet"
    | "blue"
    | "orange"
    | "teal"
    | "slate";
  theme: "light" | "dark";
  heroImage: string;
  productStyle: "card" | "minimal" | "bold";
  badges: string[];
  sections?: Array<
    "categories" | "featured" | "story" | "stats" | "cta" | "footer"
  >;
  categories?: string[];
  stats?: Array<{ label: string; value: string }>;
  storyTitle?: string;
  storyBody?: string;
};

const ACCENT_CLASS: Record<TemplateConfig["accent"], string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  teal: "bg-teal-500",
  slate: "bg-slate-700",
};

const ACCENT_TEXT: Record<TemplateConfig["accent"], string> = {
  emerald: "text-emerald-600",
  amber: "text-amber-600",
  rose: "text-rose-600",
  violet: "text-violet-600",
  blue: "text-blue-600",
  orange: "text-orange-600",
  teal: "text-teal-600",
  slate: "text-slate-700",
};

const demoProducts = Array.from({ length: 8 }).map((_, i) => ({
  id: `product-${i}`,
  name:
    ["Classic", "Studio", "Prime", "Signature", "Essential"][i % 5] + " Item",
  price: (8500 + i * 2200).toLocaleString(),
  image: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=600&fit=crop",
  ][i % 6],
}));

export function StorefrontTemplate({
  businessName,
  config,
  view = "home",
}: {
  businessName: string;
  config: TemplateConfig;
  view?: TemplateSection;
}) {
  const isDark = config.theme === "dark";
  const sections = config.sections ?? [
    "categories",
    "featured",
    "story",
    "stats",
    "cta",
    "footer",
  ];

  return (
    <div
      className={cn(
        "min-h-screen",
        isDark ? "bg-slate-950 text-white" : "bg-white text-slate-900",
      )}
    >
      <header
        className={cn(
          "border-b",
          isDark ? "border-white/10" : "border-slate-200",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div
              className={cn("h-9 w-9 rounded-xl", ACCENT_CLASS[config.accent])}
            />
            <div>
              <div className="text-sm font-semibold tracking-wide">
                {businessName}
              </div>
              <div
                className={cn(
                  "text-xs",
                  isDark ? "text-white/60" : "text-slate-500",
                )}
              >
                {config.tagline}
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm md:flex">
            <span>Home</span>
            <span>Collections</span>
            <span>About</span>
            <span>Contact</span>
          </div>
          <Button
            className={cn(
              "rounded-full",
              isDark
                ? "bg-white text-slate-900 hover:bg-white/90"
                : "bg-slate-900 text-white hover:bg-black",
            )}
          >
            Shop now
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
              isDark ? "bg-white/10" : "bg-slate-100",
            )}
          >
            <span className={ACCENT_TEXT[config.accent]}>New Season</span>
            <span className={cn(isDark ? "text-white/60" : "text-slate-500")}>
              2026 Collection
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            {config.name}
          </h1>
          <p
            className={cn(
              "mt-4 max-w-xl text-base",
              isDark ? "text-white/70" : "text-slate-600",
            )}
          >
            {config.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className={cn("rounded-full", ACCENT_CLASS[config.accent])}>
              {config.ctaPrimary}
            </Button>
            {config.ctaSecondary && (
              <Button
                variant="outline"
                className={cn(
                  "rounded-full",
                  isDark
                    ? "border-white/20 text-white"
                    : "border-slate-300 text-slate-700",
                )}
              >
                {" "}
                {config.ctaSecondary}{" "}
              </Button>
            )}
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {config.badges.map((badge) => (
              <span
                key={badge}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  isDark ? "bg-white/10" : "bg-slate-100",
                )}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-3xl overflow-hidden border border-white/10">
          <img
            src={config.heroImage}
            alt={config.name}
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {sections.includes("categories") && (
        <section className="mx-auto max-w-6xl px-6 pb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Browse categories</h2>
            <span
              className={cn(
                "text-sm",
                isDark ? "text-white/60" : "text-slate-500",
              )}
            >
              Explore collections
            </span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              config.categories ?? ["New", "Popular", "Featured", "Seasonal"]
            ).map((cat) => (
              <div
                key={cat}
                className={cn(
                  "rounded-2xl border p-4 text-sm font-semibold",
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-slate-200 bg-white",
                )}
              >
                <div
                  className={cn(
                    "text-xs uppercase tracking-wide",
                    isDark ? "text-white/60" : "text-slate-500",
                  )}
                >
                  {cat}
                </div>
                <div className="mt-2">Shop {cat}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {sections.includes("featured") && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {view === "product" ? "Product spotlight" : "Featured picks"}
            </h2>
            <span
              className={cn(
                "text-sm",
                isDark ? "text-white/60" : "text-slate-500",
              )}
            >
              Curated for you
            </span>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {demoProducts.map((product) => (
              <div
                key={product.id}
                className={cn(
                  "rounded-2xl border p-4",
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-slate-200 bg-white",
                )}
              >
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-40 w-full object-cover"
                  />
                </div>
                <div className="mt-3 text-sm font-medium">{product.name}</div>
                <div
                  className={cn(
                    "text-xs",
                    isDark ? "text-white/60" : "text-slate-500",
                  )}
                >
                  ₦{product.price}
                </div>
                <Button
                  variant="outline"
                  className={cn(
                    "mt-3 w-full rounded-full",
                    isDark ? "border-white/20 text-white" : "border-slate-300",
                  )}
                >
                  Add to cart
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {sections.includes("story") && (
        <section className="mx-auto max-w-6xl px-6 pb-14">
          <div
            className={cn(
              "rounded-3xl border p-8",
              isDark
                ? "border-white/10 bg-white/5"
                : "border-slate-200 bg-white",
            )}
          >
            <h3 className="text-2xl font-semibold">
              {config.storyTitle ?? "Built for modern commerce"}
            </h3>
            <p
              className={cn(
                "mt-3 text-sm",
                isDark ? "text-white/70" : "text-slate-600",
              )}
            >
              {config.storyBody ??
                "Tell your story with confidence. Highlight what makes your brand different and guide customers to your best offerings."}
            </p>
          </div>
        </section>
      )}

      {sections.includes("stats") && (
        <section className="mx-auto max-w-6xl px-6 pb-14">
          <div className="grid gap-4 sm:grid-cols-3">
            {(
              config.stats ?? [
                { label: "Trusted buyers", value: "20k+" },
                { label: "Avg. rating", value: "4.9" },
                { label: "Orders delivered", value: "120k" },
              ]
            ).map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "rounded-2xl border p-5",
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-slate-200 bg-white",
                )}
              >
                <div className="text-2xl font-semibold">{stat.value}</div>
                <div
                  className={cn(
                    "text-xs",
                    isDark ? "text-white/60" : "text-slate-500",
                  )}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {sections.includes("cta") && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div
            className={cn(
              "rounded-3xl p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4",
              isDark ? "bg-white/10" : "bg-slate-100",
            )}
          >
            <div>
              <div className="text-lg font-semibold">Ready to get started?</div>
              <div
                className={cn(
                  "text-sm",
                  isDark ? "text-white/70" : "text-slate-600",
                )}
              >
                Launch with the confidence of a polished storefront.
              </div>
            </div>
            <Button className={cn("rounded-full", ACCENT_CLASS[config.accent])}>
              Start shopping
            </Button>
          </div>
        </section>
      )}

      {sections.includes("footer") && (
        <footer
          className={cn(
            "border-t py-10",
            isDark ? "border-white/10" : "border-slate-200",
          )}
        >
          <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">{businessName}</div>
              <div
                className={cn(
                  "text-xs",
                  isDark ? "text-white/60" : "text-slate-500",
                )}
              >
                {config.tagline}
              </div>
            </div>
            <div
              className={cn(
                "text-xs",
                isDark ? "text-white/60" : "text-slate-500",
              )}
            >
              © 2026 {businessName}. All rights reserved.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
