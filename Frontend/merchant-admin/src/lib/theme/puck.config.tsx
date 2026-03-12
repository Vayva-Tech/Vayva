import { Config } from "@measured/puck";
import { Icon, Button } from "@vayva/ui";

export type PuckConfig = {
  Hero: { title: string; description: string; imageUrl?: string };
  ProductGrid: { title: string; limit: number };
  CollectionList: { title: string };
  TextBlock: { text: string; align: "left" | "center" | "right" };
};

export const puckConfig: Config<PuckConfig> = {
  components: {
    Hero: {
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
        imageUrl: { type: "text" },
      },
      render: ({ title, description, imageUrl }) => (
        <div className="py-20 bg-white/40 flex flex-col items-center justify-center text-center px-4 rounded-3xl overflow-hidden relative">
          {imageUrl && (
            <div className="absolute inset-0 z-0 opactiy-10">
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-black text-text-primary mb-6">{title}</h1>
            <p className="text-xl text-text-secondary mb-8">{description}</p>
            <Button className="rounded-full font-bold shadow-xl hover:scale-105 transition-transform size-lg bg-black text-white px-8 py-4">
              Shop Now
            </Button>
          </div>
        </div>
      ),
    },
    ProductGrid: {
      fields: {
        title: { type: "text" },
        limit: { type: "number" },
      },
      render: ({ title, limit }) => (
        <div className="py-12 space-y-8">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-2xl font-black text-text-primary">{title}</h2>
            <span className="text-sm font-bold text-text-tertiary uppercase tracking-widest">View All</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(limit || 4)].map((_, i) => (
              <div key={i} className="space-y-3 group cursor-pointer">
                <div className="aspect-[4/5] bg-white/40 rounded-2xl overflow-hidden border border-border/40 relative shadow-sm group-hover:shadow-xl transition-all">
                  <div className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-md rounded-full shadow-sm">
                    <Icon name="Heart" size={16} className="text-text-tertiary" />
                  </div>
                </div>
                <div>
                  <div className="h-4 w-3/4 bg-white/40 rounded animate-pulse" />
                  <div className="mt-2 h-4 w-1/4 bg-white/40 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    CollectionList: {
      fields: {
        title: { type: "text" },
      },
      render: ({ title }) => (
        <div className="py-12 space-y-8">
          <h2 className="text-2xl font-black text-text-primary px-2">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {[1, 2, 3].map((i: number) => (
              <div key={i} className="h-48 rounded-2xl bg-white/40 border border-border/40 flex items-center justify-center group cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors" />
                <span className="relative z-10 text-lg font-black text-text-primary shadow-sm">Collection {i}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    TextBlock: {
      fields: {
        text: { type: "textarea" },
        align: {
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
      },
      render: ({ text, align }) => (
        <div className={`py-12 px-4 ${align === "center" ? "text-center" :
            align === "right" ? "text-right" :
              "text-left"
          }`}>
          <p className="text-2xl md:text-3xl font-bold leading-relaxed text-text-primary max-w-4xl mx-auto italic">
            "{text}"
          </p>
        </div>
      ),
    },
  },
};
