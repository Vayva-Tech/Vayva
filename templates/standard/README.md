# Standard Storefront Template

A versatile, modern e-commerce template for general retail and online stores. Part of the Vayva full-stack template collection.

## Overview

**Template ID**: `standard`  
**Category**: E-Commerce  
**Industry**: Retail, General  
**Business Model**: B2C, Product Sales  
**Status**: Production Ready

## Features

- 🛍️ Full shopping cart functionality
- 💳 Paystack payment integration  
- 📱 Responsive design (mobile-first)
- 🎨 Clean, modern aesthetic with slate theme
- ⚡ Fast performance (Next.js 14 App Router)
- 🎭 WebStudio customizable
- 🔐 Secure checkout flow
- 📦 Inventory tracking
- 🔔 Order notifications

## Pages

- `/` - Home with hero, features, featured products
- `/shop` - Product listing
- `/product/[id]` - Product detail
- `/cart` - Shopping cart with quantity management
- `/checkout` - Secure checkout with Paystack
- `/about` - Store information
- `/contact` - Contact form

## Design System

### Colors
- Primary: Slate 900 (dark blue-gray)
- Background: White/Light gray
- Accent: White on dark hero sections

### Typography
- Font: Inter (system fallback)
- Headings: Bold, tight tracking (-0.025em)
- Body: Regular weight, 1.5 line height

## Structure

```
base/
├── app/              # Next.js app router pages
│   ├── api/          # API routes (products, checkout)
│   ├── cart/         # Shopping cart page
│   ├── checkout/     # Checkout page with Paystack
│   ├── layout.tsx    # Root layout with StoreProvider
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles
├── components/ui/    # shadcn/ui components
├── lib/              # Utilities and context
│   ├── store-context.tsx  # Cart state management
│   └── utils.ts      # Helper functions
├── package.json      # Dependencies
├── next.config.ts    # Next.js configuration
├── tailwind.config.ts # Tailwind configuration
└── tsconfig.json     # TypeScript configuration
```

## Usage

This template is not meant to be used directly. Instead, copy it and customize for specific industries:

```bash
cp -r templates/base templates/{template-name}
```

Then customize:
1. Update `package.json` name and description
2. Customize pages in `app/`
3. Add industry-specific components
4. Update color scheme in `globals.css`
5. Add template-specific API routes

## Payment Flow

1. Customer adds items to cart
2. Cart data stored in React Context
3. At checkout, customer enters details
4. Frontend calls `/api/checkout/initiate`
5. Backend initializes Paystack payment
6. Customer redirected to Paystack
7. After payment, webhook verifies and creates order

## Database Schema

Templates use shared Prisma schema from `@vayva/db` package:
- Products
- Orders
- OrderItems
- Customers
- Payments

## Environment Variables

See `.env.example` for required variables.

## Building Templates

Each template extends this base and adds:
- Industry-specific UI (colors, layouts)
- Specialized product types
- Industry features (bookings, subscriptions, etc.)
- Custom pages and routes
