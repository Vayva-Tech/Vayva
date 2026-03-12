/**
 * Customer Reviews Add-On - Product reviews and ratings
 * 
 * Features:
 * - Display product reviews on product pages
 * - Review submission form
 * - Photo upload support
 * - Review moderation
 * - Star ratings and text reviews
 */

import { AddOnDefinition } from '../../types';

export const REVIEWS_ADDON: AddOnDefinition = {
  id: 'vayva.reviews',
  name: 'Customer Reviews',
  description: 'Collect and display authentic customer reviews with photos, star ratings, and verified purchase badges.',
  tagline: 'Build trust with verified reviews',
  version: '1.0.0',
  category: 'ecommerce',
  
  developer: 'Vayva',
  author: {
    name: 'Vayva',
    isOfficial: true,
    isVerified: true,
  },
  
  icon: 'Star',
  tags: ['reviews', 'ratings', 'social-proof', 'trust', 'feedback'],
  
  compatibleTemplates: ['*'],
  mountPoints: ['product-detail', 'product-card', 'page-sidebar'],
  
  requirements: ['vayva.products'], // Requires products to exist
  
  previewImages: {
    thumbnail: '/addons/reviews/thumbnail.png',
    screenshots: [
      '/addons/reviews/screenshot-1.png',
      '/addons/reviews/screenshot-2.png',
    ],
  },
  
  pricing: {
    type: 'free',
    basePrice: 0,
    currency: 'NGN',
  },
  
  stats: {
    installCount: 0,
    rating: 0,
    reviewCount: 0,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  
  provides: {
    pages: [
      {
        route: '/dashboard/reviews',
        title: 'Product Reviews',
        description: 'Manage customer reviews',
        layout: 'default',
      },
    ],
    components: [
      {
        mountPoint: 'product-detail',
        componentName: 'ProductReviews',
        priority: 50,
        conditions: {
          pageTypes: ['product'],
          authState: 'any',
        },
      },
      {
        mountPoint: 'product-card',
        componentName: 'ReviewBadge',
        priority: 30,
        conditions: {
          pageTypes: ['home', 'category', 'product'],
          authState: 'any',
        },
      },
    ],
    apiRoutes: [
      {
        path: '/api/addons/reviews/submit',
        methods: ['POST'],
        description: 'Submit a product review',
      },
      {
        path: '/api/addons/reviews/:productId',
        methods: ['GET'],
        description: 'Get reviews for a product',
      },
      {
        path: '/api/addons/reviews/moderate',
        methods: ['PATCH', 'DELETE'],
        description: 'Moderate reviews',
      },
    ],
    databaseModels: ['ProductReview', 'ReviewImage'],
  },
  
  configSchema: {
    fields: [
      {
        key: 'requirePurchase',
        label: 'Verified Purchase Only',
        type: 'boolean',
        description: 'Only customers who purchased can leave reviews',
        defaultValue: true,
        required: false,
      },
      {
        key: 'allowPhotos',
        label: 'Allow Photo Uploads',
        type: 'boolean',
        description: 'Let customers upload photos with reviews',
        defaultValue: true,
        required: false,
      },
      {
        key: 'maxPhotos',
        label: 'Max Photos per Review',
        type: 'number',
        description: 'Maximum number of photos allowed',
        defaultValue: 5,
        min: 1,
        max: 10,
        required: false,
      },
      {
        key: 'moderationEnabled',
        label: 'Enable Moderation',
        type: 'boolean',
        description: 'Reviews require approval before showing',
        defaultValue: true,
        required: false,
      },
      {
        key: 'allowGuestReviews',
        label: 'Allow Guest Reviews',
        type: 'boolean',
        description: 'Allow non-logged-in users to leave reviews',
        defaultValue: false,
        required: false,
      },
      {
        key: 'minReviewLength',
        label: 'Minimum Review Length',
        type: 'number',
        description: 'Minimum characters for text reviews',
        defaultValue: 10,
        min: 0,
        max: 500,
        required: false,
      },
      {
        key: 'maxReviewLength',
        label: 'Maximum Review Length',
        type: 'number',
        description: 'Maximum characters for text reviews',
        defaultValue: 1000,
        min: 100,
        max: 5000,
        required: false,
      },
      {
        key: 'showRatingBreakdown',
        label: 'Show Rating Breakdown',
        type: 'boolean',
        description: 'Display distribution of 5, 4, 3, 2, 1 star ratings',
        defaultValue: true,
        required: false,
      },
      {
        key: 'showReviewCount',
        label: 'Show Review Count',
        type: 'boolean',
        description: 'Display total number of reviews',
        defaultValue: true,
        required: false,
      },
      {
        key: 'reviewsPerPage',
        label: 'Reviews Per Page',
        type: 'number',
        description: 'Number of reviews to show at once',
        defaultValue: 10,
        min: 5,
        max: 50,
        required: false,
      },
      {
        key: 'sortOrder',
        label: 'Default Sort Order',
        type: 'select',
        options: [
          { label: 'Most Recent', value: 'newest' },
          { label: 'Highest Rated', value: 'highest' },
          { label: 'Lowest Rated', value: 'lowest' },
          { label: 'Verified First', value: 'verified' },
        ],
        defaultValue: 'newest',
        required: false,
      },
      {
        key: 'allowReviewHelpful',
        label: 'Allow "Helpful" Votes',
        type: 'boolean',
        description: 'Let users mark reviews as helpful',
        defaultValue: true,
        required: false,
      },
      {
        key: 'showResponseFromSeller',
        label: 'Show Seller Response',
        type: 'boolean',
        description: 'Display merchant responses to reviews',
        defaultValue: true,
        required: false,
      },
      {
        key: 'autoApproveThreshold',
        label: 'Auto-Approve Threshold',
        type: 'number',
        description: 'Automatically approve reviews with rating >= N (0 to disable)',
        defaultValue: 0,
        min: 0,
        max: 5,
        required: false,
      },
    ],
  },
  
  defaultConfig: {
    requirePurchase: true,
    allowPhotos: true,
    maxPhotos: 5,
    moderationEnabled: true,
    allowGuestReviews: false,
    minReviewLength: 10,
    maxReviewLength: 1000,
    showRatingBreakdown: true,
    showReviewCount: true,
    reviewsPerPage: 10,
    sortOrder: 'newest',
    allowReviewHelpful: true,
    showResponseFromSeller: true,
    autoApproveThreshold: 0,
  },
  
  configRequired: false,
  installTimeEstimate: 3,
  
  highlights: [
    'Verified purchase badges',
    'Photo upload support',
    'Review moderation tools',
    'Rich star ratings',
    'Seller response feature',
  ],
  
  docs: {
    setup: 'Reviews will automatically appear on product detail pages. Configure moderation settings and review requirements from the dashboard.',
  },
};

// Prisma model extensions for reviews
export const PRODUCT_REVIEW_MODEL = `
model ProductReview {
  id          String   @id @default(uuid())
  storeId     String
  store       Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  
  // Product reference
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  // Reviewer
  customerId  String?
  customer    Customer? @relation(fields: [customerId], references: [id])
  reviewerName String   // Display name (can be anonymized)
  reviewerEmail String
  
  // Review content
  rating      Int      @db.SmallInt // 1-5
  title       String?
  content     String   @db.Text
  
  // Purchase verification
  orderId     String?
  order       Order?   @relation(fields: [orderId], references: [id])
  isVerifiedPurchase Boolean @default(false)
  
  // Status
  status      ReviewStatus @default(PENDING)
  
  // Engagement
  helpfulCount Int     @default(0)
  notHelpfulCount Int  @default(0)
  
  // Seller response
  sellerResponse String? @db.Text
  sellerResponseAt DateTime?
  
  // Images
  images      ReviewImage[]
  
  // Metadata
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([productId, status, createdAt])
  @@index([storeId, status])
  @@index([customerId])
  @@index([orderId])
  @@map("product_reviews")
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
  FLAGGED
}

model ReviewImage {
  id          String   @id @default(uuid())
  reviewId    String
  review      ProductReview @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  url         String
  caption     String?
  
  createdAt   DateTime @default(now())
  
  @@index([reviewId])
  @@map("review_images")
}

model ReviewVote {
  id          String   @id @default(uuid())
  reviewId    String
  review      ProductReview @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  customerId  String?
  ipAddress   String?
  
  isHelpful   Boolean
  
  createdAt   DateTime @default(now())
  
  @@unique([reviewId, customerId])
  @@unique([reviewId, ipAddress])
  @@map("review_votes")
}
`;

export default REVIEWS_ADDON;
