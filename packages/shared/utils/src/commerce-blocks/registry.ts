export type CommerceBlockPropType =
  | "string"
  | "number"
  | "boolean"
  | "select"
  | "list";

export interface CommerceBlockPropDef {
  key: string;
  name: string;
  type: CommerceBlockPropType;
  description?: string;
  options?: { label: string; value: string | number }[]; // For "select"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
}

export interface CommerceBlockDef {
  key: string;
  name: string;
  description: string;
  icon?: string;
  props: CommerceBlockPropDef[];
}

export const COMMERCE_BLOCKS: CommerceBlockDef[] = [
  {
    key: "product-grid",
    name: "Product Grid",
    description: "Display a grid of products from a specific collection",
    icon: "LayoutGrid",
    props: [
      {
        key: "collection",
        name: "Collection",
        type: "string",
        description: "Collection slug (e.g., 'new-arrivals')",
      },
      {
        key: "limit",
        name: "Limit",
        type: "number",
        description: "Number of products to show",
        defaultValue: 8,
      },
      {
        key: "sort",
        name: "Sort By",
        type: "select",
        options: [
          { label: "Newest", value: "newest" },
          { label: "Price: Low to High", value: "price-asc" },
          { label: "Price: High to Low", value: "price-desc" },
        ],
        defaultValue: "newest",
      },
    ],
  },
  {
    key: "featured-products",
    name: "Featured Products",
    description: "Highlight specific products or products with a certain tag",
    icon: "Star",
    props: [
      {
        key: "tag",
        name: "Tag",
        type: "string",
        description: "Show products with this tag",
      },
      {
        key: "productIds",
        name: "Product IDs",
        type: "string",
        description: "Comma-separated list of specific product IDs",
      },
    ],
  },
  {
    key: "product-carousel",
    name: "Product Carousel",
    description: "A horizontally scrolling list of products",
    icon: "ArrowRightCircle",
    props: [
      {
        key: "collection",
        name: "Collection",
        type: "string",
        description: "Collection slug",
      },
      {
        key: "limit",
        name: "Limit",
        type: "number",
        defaultValue: 10,
      },
    ],
  },
  {
    key: "collection-list",
    name: "Collection List",
    description: "Show a list of all your product collections",
    icon: "FolderHeart",
    props: [
      {
        key: "limit",
        name: "Limit",
        type: "number",
        defaultValue: 6,
      },
    ],
  },
  {
    key: "category-tiles",
    name: "Category Tiles",
    description: "Visual tiles representing top categories",
    icon: "Shapes",
    props: [],
  },
  {
    key: "add-to-cart-button",
    name: "Add to Cart Button",
    description: "A standalone button to add a specific product to the cart",
    icon: "ShoppingCart",
    props: [
      {
        key: "productId",
        name: "Product ID",
        type: "string",
        description: "ID of the product to add",
      },
      {
        key: "variantId",
        name: "Variant ID",
        type: "string",
        description: "Specific variant/SKU ID (optional)",
      },
    ],
  },
  {
    key: "mini-cart",
    name: "Mini Cart",
    description: "Floating cart summary with quick access to checkout",
    icon: "ShoppingBag",
    props: [],
  },
];
