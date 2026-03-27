/**
 * Design System Usage Guide
 * 
 * This document provides guidelines for using the standardized design system
 * across the Vayva Merchant dashboard.
 */

/* ------------------------------------------------------------------ */
/*  SPACING SYSTEM                                                      */
/* ------------------------------------------------------------------ */

/**
 * USE STANDARDIZED SPACING PATTERNS
 * 
 * Instead of arbitrary values, use the SPACING_PATTERNS constant:
 */

// ❌ BAD: Arbitrary spacing
<div className="p-5 gap-7 mb-11">
  <div className="m-3.5">Content</div>
</div>

// ✅ GOOD: Standardized spacing
import { SPACING_PATTERNS } from '@/lib';

<div className={`p-${SPACING_PATTERNS.CARD_PADDING_DESKTOP} gap-${SPACING_PATTERNS.ELEMENT_GAP_LOOSE}`}>
  <div className={`m-${SPACING_PATTERNS.ELEMENT_GAP_TIGHT}`}>Content</div>
</div>

/**
 * COMMON SPACING COMBINATIONS:
 * 
 * Card Layouts:
 * - Mobile: p-4 gap-4 (SPACING_PATTERNS.CARD_PADDING_MOBILE)
 * - Tablet: p-5 gap-5 (SPACING_PATTERNS.CARD_PADDING_TABLET)
 * - Desktop: p-6 gap-6 (SPACING_PATTERNS.CARD_PADDING_DESKTOP)
 * 
 * Section Gaps:
 * - Between sections: gap-6 (mobile), gap-8 (tablet), gap-12 (desktop)
 * - Between cards: gap-4
 * - Between elements in card: gap-2 to gap-4
 * 
 * Page Layouts:
 * - Page padding: p-4 (mobile), p-6 (tablet), p-8 (desktop)
 */

/* ------------------------------------------------------------------ */
/*  COLOR SYSTEM                                                        */
/* ------------------------------------------------------------------ */

/**
 * USE SEMANTIC COLORS
 * 
 * Instead of hardcoded color values, use semantic color tokens:
 */

import { COLORS, INDUSTRY_COLORS } from '@/lib';

// ❌ BAD: Hardcoded colors
<div className="text-green-500 bg-red-500 border-blue-500">
  Status message
</div>

// ✅ GOOD: Semantic colors
<div className="text-success-500 bg-error-50 border-info-500">
  Status message
</div>

// ✅ GOOD: Industry-specific colors (for themed components)
const industryColor = INDUSTRY_COLORS[merchant.industrySlug].primary;

<div style={{ color: industryColor }}>
  Themed content
</div>

/**
 * COLOR USAGE GUIDELINES:
 * 
 * Primary Actions: Use primary[500] or industry primary color
 * Success States: Use success[500]
 * Error States: Use error[500] or error[600]
 * Warnings: Use warning[500] or warning[600]
 * Info: Use info[500]
 * 
 * Backgrounds:
 * - Light backgrounds: gray[50], gray[100]
 * - Cards: white with gray[100] border
 * - Hover states: gray[50]
 * 
 * Text:
 * - Primary text: gray[900]
 * - Secondary text: gray[600]
 * - Disabled text: gray[400]
 * - Links: primary[500] or primary[600]
 */

/* ------------------------------------------------------------------ */
/*  TYPOGRAPHY SYSTEM                                                   */
/* ------------------------------------------------------------------ */

/**
 * USE TYPOGRAPHY SCALE
 */

import { TYPOGRAPHY } from '@/lib';

// ❌ BAD: Inconsistent font sizes
<h1 className="text-[22px] font-[600]">Heading</h1>
<p className="text-[15px] leading-[1.4]">Paragraph</p>

// ✅ GOOD: Typography scale
<h1 className="text-3xl font-semibold">Heading</h1>
<p className="text-base leading-normal">Paragraph</p>

/**
 * TYPOGRAPHY HIERARCHY:
 * 
 * Page Titles: text-3xl font-bold (28px)
 * Section Headers: text-2xl font-bold (24px)
 * Subsection Headers: text-xl font-semibold (20px)
 * Card Titles: text-lg font-semibold (18px)
 * Body Text: text-base (16px)
 * Small Text: text-sm (14px)
 * Captions: text-xs (12px)
 * 
 * Font Weights:
 * - Bold: Headings, important text
 * - Semibold: Subheadings, buttons
 * - Medium: Labels, badges
 * - Normal: Body text
 */

/* ------------------------------------------------------------------ */
/*  COMPONENT SPACING PATTERNS                                          */
/* ------------------------------------------------------------------ */

/**
 * CARD COMPONENTS
 */

// Standard Card Pattern
<Card className="p-6 space-y-4">
  <CardHeader className="space-y-2">
    <CardTitle className="text-lg font-semibold" />
    <CardDescription className="text-sm text-gray-500" />
  </CardHeader>
  <CardContent className="space-y-4" />
  <CardFooter className="flex gap-2" />
</Card>

/**
 * FORM ELEMENTS
 */

// Form Field Pattern
<div className="space-y-2">
  <Label className="text-sm font-medium">Label</Label>
  <Input className="h-10 px-4" />
  <p className="text-sm text-gray-500">Helper text</p>
</div>

/**
 * BUTTON GROUPS
 */

// Button Group Pattern
<div className="flex gap-2">
  <Button variant="outline">Cancel</Button>
  <Button variant="primary">Save</Button>
</div>

// Tight button group (for compact spaces)
<div className="flex gap-1">
  <Button size="sm">Action 1</Button>
  <Button size="sm">Action 2</Button>
</div>

/* ------------------------------------------------------------------ */
/*  LAYOUT PATTERNS                                                     */
/* ------------------------------------------------------------------ */

/**
 * PAGE LAYOUT
 */

// Standard Page Layout
<div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
  {/* Header */}
  <div className="flex items-center justify-between">
    <h1 className="text-3xl font-bold">Page Title</h1>
    <Button>Action</Button>
  </div>
  
  {/* Content Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* Cards */}
  </div>
  
  {/* Data Table */}
  <div className="border rounded-xl overflow-hidden">
    {/* Table content */}
  </div>
</div>

/**
 * RESPONSIVE GRID
 */

// Responsive Card Grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  {/* Cards adapt to screen size */}
</div>

/* ------------------------------------------------------------------ */
/*  ICON STANDARDIZATION                                                */
/* ------------------------------------------------------------------ */

/**
 * ICON LIBRARY CONSISTENCY
 * 
 * Use Phosphor Icons consistently across the dashboard:
 */

import { Settings, Users, ChartLine } from '@phosphor-icons/react';

// ❌ AVOID: Mixing icon libraries
import { Settings } from 'lucide-react';
import { Users } from '@phosphor-icons/react';

// ✅ GOOD: Consistent icon library
import { Settings, Users } from '@phosphor-icons/react';

/**
 * ICON SIZES
 * 
 * Navigation icons: 20px (md)
 * Action icons: 16px (sm) or 20px (md)
 * Status icons: 24px (lg)
 * Hero icons: 32px (xl) or 48px (2xl)
 */

// Navigation icon
<Settings weight="fill" size={20} />

// Action icon
<Users weight="regular" size={20} />

// Status icon
<ChartLine weight="bold" size={24} />

/* ------------------------------------------------------------------ */
/*  ANIMATION GUIDELINES                                                */
/* ------------------------------------------------------------------ */

/**
 * TRANSITION DURATIONS
 * 
 * Instant (75ms): Micro-interactions, hover states
 * Fast (150ms): Button clicks, small movements
 * Normal (300ms): Most UI transitions, modals
 * Slow (500ms): Large panel transitions
 * Very Slow (1000ms): Page transitions
 */

// Button hover transition
<button className="transition-all duration-150 hover:bg-gray-100" />

// Modal transition
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
/>

/**
 * EASING FUNCTIONS
 * 
 * easeInOut: Default for most animations
 * easeOut: For entering elements
 * easeIn: For exiting elements
 */

/* ------------------------------------------------------------------ */
/*  BORDER RADIUS                                                       */
/* ------------------------------------------------------------------ */

/**
 * CORNER RADIUS USAGE
 * 
 * Cards: rounded-xl (12px)
 * Buttons: rounded-lg (8px) or rounded-md (6px)
 * Inputs: rounded-md (6px)
 * Badges: rounded-full (9999px)
 * Modals: rounded-2xl (16px)
 * Images: rounded-lg (8px) or rounded-xl (12px)
 */

<Card className="rounded-xl border shadow-sm" />
<Button className="rounded-lg" />
<Input className="rounded-md" />
<Badge className="rounded-full" />

/* ------------------------------------------------------------------ */
/*  SHADOW USAGE                                                        */
/* ------------------------------------------------------------------ */

/**
 * SHADOW LEVELS
 * 
 * Cards: shadow-sm
 * Dropdowns: shadow-md
 * Floating elements: shadow-lg
 * Modals: shadow-xl
 * Tooltips: shadow-sm
 */

<Card className="shadow-sm hover:shadow-md transition-shadow" />
<Dropdown className="shadow-md" />
<Modal className="shadow-xl" />

/* ------------------------------------------------------------------ */
/*  QUICK REFERENCE                                                     */
/* ------------------------------------------------------------------ */

/**
 * MOST COMMON PATTERNS:
 * 
 * 1. Card with header and content:
 *    <div className="p-6 space-y-4 border rounded-xl bg-white">
 *      <h3 className="text-lg font-semibold">Title</h3>
 *      <p className="text-gray-600">Content</p>
 *    </div>
 * 
 * 2. Form field:
 *    <div className="space-y-2">
 *      <label className="text-sm font-medium">Label</label>
 *      <input className="h-10 px-4 border rounded-md" />
 *    </div>
 * 
 * 3. Button group:
 *    <div className="flex gap-2">
 *      <Button variant="outline">Cancel</Button>
 *      <Button variant="primary">Save</Button>
 *    </div>
 * 
 * 4. Responsive grid:
 *    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 *      {/* Cards */}
 *    </div>
 * 
 * 5. Page layout:
 *    <div className="p-8 space-y-8">
 *      <h1 className="text-3xl font-bold">Page Title</h1>
 *      <div className="grid gap-6">{/* Content */}</div>
 *    </div>
 */

export {};
