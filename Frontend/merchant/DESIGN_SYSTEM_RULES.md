# Vayva Merchant Admin - Complete Design System & Designer Skill

> **Purpose:** This is the single source of truth for every visual decision across the entire Vayva Merchant Admin product. This includes: authentication screens, onboarding flows, the dashboard shell (sidebar, header, mobile nav), all 266+ dashboard pages, settings, billing, account, modals, empty states, and error pages.
>
> Any AI agent, developer, or designer building or modifying ANY part of this product MUST follow these rules.

---

## 1. DESIGN PHILOSOPHY

The design follows a **clean, content-first, card-based** aesthetic inspired by tools like Linear, Notion, and Relatel. It prioritizes:

- **Clean white space** over dense layouts
- **Solid white cards with borders** over glassmorphism or heavy shadows
- **Consistent gray scale** throughout — no mixing slate/gray/zinc
- **Status-driven UI** where every item has a visible colored state
- **Scannable metrics** with large numbers and trend indicators
- **Uniform page structure** — every page follows the same skeleton
- **Progressive disclosure** — show summary first, details on click
- **Accessibility-first** — 44px touch targets, 4.5:1 contrast, keyboard nav

---

## 2. FONTS

### 2.1 Font Families

```
Body / UI:     "Inter" (var: --font-inter)
Display:       "Space Grotesk" (var: --font-space-grotesk)  — auth/onboarding headlines ONLY
Monospace:     "JetBrains Mono" — order IDs, codes, API keys only
```

**Rules:**
- **Space Grotesk** is ONLY used for large display text on auth and onboarding screens (hero headlines, welcome text)
- **Inter** is used for EVERYTHING else — all dashboard UI, all buttons, all labels, all body text, all headings inside the dashboard
- Never mix fonts within the same card or section
- Monospace is only for machine-readable strings (IDs, codes, URLs)

### 2.2 Type Scale

| Role | Size | Weight | Tracking | Class | Where Used |
|---|---|---|---|---|---|
| Auth hero headline | 36px | 700 | -0.03em | `text-4xl font-bold tracking-tighter font-display` | Sign in/up, onboarding welcome |
| Auth subheadline | 18px | 400 | 0 | `text-lg text-gray-500` | Auth page subtitles |
| Page title | 24px | 700 | -0.02em | `text-2xl font-bold tracking-tight` | Every dashboard page title |
| Page subtitle | 14px | 400 | 0 | `text-sm text-gray-500` | Below page titles |
| Section header | 14px | 600 | 0 | `text-sm font-semibold text-gray-900` | Card/section titles |
| Big metric | 30px | 700 | -0.02em | `text-3xl font-bold tracking-tight` | Summary widget numbers |
| Medium metric | 24px | 700 | -0.01em | `text-2xl font-bold` | Secondary metrics |
| Small metric | 20px | 700 | 0 | `text-xl font-bold` | Inline stats |
| Body | 14px | 400 | 0 | `text-sm` | Default text |
| Label | 12px | 500 | 0.05em | `text-xs font-medium uppercase tracking-wider` | Above inputs, metric labels |
| Caption | 12px | 400 | 0 | `text-xs text-gray-400` | Timestamps, hints |
| Badge | 12px | 500 | 0 | `text-xs font-medium` | Status badges, tags |
| Button | 14px | 500 | 0 | `text-sm font-medium` | All buttons |
| Input text | 14px | 400 | 0 | `text-sm` | Form inputs |
| Code/ID | 12px | 400 | 0.02em | `text-xs font-mono` | Order IDs, task codes |

### 2.3 Typography Rules

1. **NEVER exceed 36px** anywhere in the product. Auth headlines max at 36px. Dashboard maxes at 30px.
2. **Page titles are always 24px bold** inside the dashboard — no exceptions
3. **Section/card headers are always 14px semibold** — never text-base or text-lg
4. **Metric numbers must be the visually largest element** in their card
5. **Labels above metrics** are always `text-xs font-medium uppercase tracking-wider text-gray-500`
6. **Body text is always 14px** — never use 16px (text-base) for body text in the dashboard
7. **Link text** uses the same size as surrounding text, colored `text-green-600 hover:text-green-700` (green is the link color, not gray-900)

---

## 3. COLOR SYSTEM

### 3.1 Brand Colors

| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| Vayva Green | `#22C55E` | `bg-green-500` / `text-green-500` | **Primary brand color.** All primary buttons, CTAs, active states, links, selected indicators, progress bars, toggles, checkboxes. This is THE action color across the entire product. |
| Vayva Green Hover | `#16A34A` | `bg-green-600` / `hover:bg-green-600` | Hover state for all green primary buttons |
| Vayva Green Light | `#F0FDF4` | `bg-green-50` | Light tint for selected cards, active backgrounds, success states |
| White | `#FFFFFF` | `bg-white` | Card backgrounds, page backgrounds, input backgrounds on focus |

**CRITICAL RULE:** Green (`#22C55E`) is the primary action color everywhere. NOT gray-900. Gray-900 is only for text and headings.

### 3.2 Neutrals (USE GRAY SCALE ONLY)

| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| Black | `#111827` | `gray-900` | Headings, primary text ONLY (not buttons) |
| Dark gray | `#374151` | `gray-700` | Secondary text on white |
| Medium gray | `#6B7280` | `gray-500` | Labels, descriptions, subtitles |
| Muted gray | `#9CA3AF` | `gray-400` | Placeholders, hints, captions, icons |
| Light gray | `#E5E7EB` | `gray-200` | Dividers, borders, chart gridlines |
| Subtle gray | `#F3F4F6` | `gray-100` | Card borders, skeleton loading, hover bg |
| Near white | `#F9FAFB` | `gray-50` | Input background, hover states |
| White | `#FFFFFF` | `white` | Card backgrounds, page backgrounds |

**CRITICAL RULE:** Use `gray-*` exclusively. Do NOT use `slate-*`, `zinc-*`, or `neutral-*` anywhere in the product.

### 3.3 Status Colors

| Status | Background | Text | Use For |
|---|---|---|---|
| Success | `bg-green-50` | `text-green-600` | Completed, delivered, active, published |
| Warning | `bg-orange-50` | `text-orange-600` | Normal priority, needs attention, pending review |
| Danger | `bg-red-50` | `text-red-600` | Urgent, critical, failed, cancelled, overdue |
| Info | `bg-blue-50` | `text-blue-600` | Processing, in progress, informational |
| AI/Premium | `bg-violet-50` | `text-violet-600` | AI features, pro badges, premium |
| Neutral | `bg-gray-100` | `text-gray-600` | Draft, archived, inactive |

### 3.4 Chart Colors

| Purpose | Hex | Tailwind |
|---|---|---|
| Gradient bar start | `#7C3AED` | `violet-600` |
| Gradient bar end | `#EC4899` | `pink-500` |
| Primary line | `#F97316` | `orange-500` |
| Secondary line | `#9CA3AF` | `gray-400` |
| Success fill | `#22C55E` | `green-500` |
| Grid lines | `#E5E7EB` | `gray-200` |
| Tooltip bg | `#1F2937` | `gray-800` |

### 3.5 Trend Indicators

| Direction | Color | Icon |
|---|---|---|
| Positive | `text-green-600` | `↗` or `ArrowUpRight` |
| Negative | `text-red-500` | `↘` or `ArrowDownRight` |
| Neutral | `text-gray-400` | `→` or `Minus` |

---

## 4. SURFACES, SHADOWS & DEPTH

### 4.1 Card Surfaces

| Surface | Classes | Where |
|---|---|---|
| Auth card | `bg-white rounded-2xl border border-gray-100 p-8` | Sign in/up form card |
| Widget card | `bg-white rounded-2xl border border-gray-100 p-6` | Summary widgets |
| Content card | `bg-white rounded-xl border border-gray-100 p-4` | Kanban cards, item cards |
| Settings section | `bg-white rounded-2xl border border-gray-100 p-6` | Settings form sections |
| Modal/Dialog | `bg-white rounded-2xl shadow-xl p-6` | All modals |
| Dropdown | `bg-white rounded-xl shadow-lg border border-gray-100 p-1` | Menus, popovers |

### 4.2 Shadows

| Level | Value | Usage |
|---|---|---|
| None | — | Default card state (use borders instead) |
| Card hover | `shadow-md` | Interactive cards on hover |
| Dropdown | `shadow-lg` | Menus, selects, popovers |
| Modal | `shadow-xl` | Dialogs, modals, sheets |
| Focus ring | `ring-2 ring-green-500 ring-offset-2` | Keyboard focus |

**Rule:** Cards at rest use `border border-gray-100` with NO shadow. Shadows only appear on hover (interactive cards), dropdowns, and modals.

### 4.3 No Glassmorphism

Remove ALL glassmorphism from content areas:

| REMOVE | REPLACE WITH |
|---|---|
| `bg-white/[0.45]` | `bg-white` |
| `bg-background/70` | `bg-white` |
| `bg-surface-2/50` | `bg-white` |
| `backdrop-blur-xl` | Remove entirely |
| `backdrop-blur-2xl` | Remove entirely |
| `backdrop-blur-sm` | Remove entirely |
| `bg-background/50 backdrop-blur-sm` (inputs) | `bg-gray-50` |
| `border-white/50` | `border-gray-100` |
| `border-border/60` | `border-gray-100` |
| `.glass-panel` class | `bg-white border border-gray-100` |

**Exception:** The AdminShell sidebar/header MAY keep subtle blur for the top bar only. All content inside the main area must be solid white.

### 4.4 Border Radius

| Element | Radius | Class |
|---|---|---|
| Auth form card | 16px | `rounded-2xl` |
| Widget/section cards | 16px | `rounded-2xl` |
| Item/task cards | 12px | `rounded-xl` |
| Buttons (pill CTA) | 9999px | `rounded-full` |
| Buttons (standard) | 12px | `rounded-xl` |
| Input fields | 12px | `rounded-xl` |
| Badges/chips | 6px | `rounded-md` |
| Avatars | 9999px | `rounded-full` |
| Modals/dialogs | 16px | `rounded-2xl` |
| Dropdowns | 12px | `rounded-xl` |
| Onboarding cards | 16px | `rounded-2xl` |

**REMOVE:** `rounded-[28px]` and `rounded-3xl` from all content cards. Only the shell header may keep `rounded-2xl`.

---

## 5. PAGE LAYOUTS

### 5.1 Auth Pages (Sign In, Sign Up, Forgot Password, Reset Password, Verify)

**KEEP THE CURRENT DESIGN.** Auth pages already use the correct split layout. Do NOT redesign.

```
┌──────────────────────────────────────────────────────────┐
│ ┌─────────────────────┐  ┌──────────────────────────────┐│
│ │                     │  │ Having trouble? Get help →   ││
│ │  [Vayva Logo]       │  │                              ││
│ │  Merchant           │  │                              ││
│ │                     │  │  Welcome back                ││
│ │  ┌───────────────┐  │  │  Sign in to your account     ││
│ │  │ Dashboard     │  │  │                              ││
│ │  │ mockup /      │  │  │  [Email input]               ││
│ │  │ hero image    │  │  │  [Password + eye toggle]     ││
│ │  │ [chart bars]  │  │  │                              ││
│ │  └───────────────┘  │  │  [Remember me] [Forgot?]     ││
│ │                     │  │                              ││
│ │  ┌─ Notification ─┐ │  │  [Sign In — full width]     ││
│ │  │ floating card   │ │  │                              ││
│ │  └─────────────────┘ │  │  Don't have an account?     ││
│ │                     │  │  Sign up                    ││
│ │  • Feature 1        │  │                              ││
│ │  • Feature 2        │  │  ─── Terms · Privacy ───     ││
│ └─────────────────────┘  └──────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

**Current Structure (PRESERVE AS-IS):**
- **Split layout** via `SplitAuthLayout` → `AuthLeftPanel` + `AuthRightPanel`
- **Left panel** (38% desktop, hidden mobile):
  - Emerald/green theme (`emerald-200/50` borders, `emerald-50/80` backgrounds)
  - Vayva logo + "Merchant" branding
  - Dashboard mockup with rotated card and chart visualization
  - Floating notification card overlay
  - Feature bullet points with green dot indicators
  - `rounded-3xl` on visual elements
  - Three variants: "signin", "signup", "support"
- **Right panel** (60% desktop, full width mobile):
  - Top nav bar: "Having trouble? Get help" link
  - Form content centered, `max-w-[440px]`
  - Padding: `p-6 lg:p-10`
  - Footer: Terms and Privacy links
- **Background**: Green radial gradients on `#f0fdf4`
- **Form spacing**: `space-y-5`
- **Inputs**: `@vayva/ui` Input components
- **Password fields**: Eye/EyeSlash toggle from `@phosphor-icons`
- **Verify page**: Email/WhatsApp method selector + 6-digit OTP input
- **Reset password**: PasswordStrengthIndicator + requirements checklist

**Minor tweaks only (do not change layout or visuals):**
- Ensure input focus rings use `ring-green-500/10` for consistency
- Ensure error states use `text-red-600` on `bg-red-50`
- Ensure success states (forgot-password confirmation) use `text-green-600` on `bg-green-50`
- Keep all existing component styling (SplitAuthLayout, AuthLeftPanel, AuthRightPanel, OTPInput, PasswordStrengthIndicator)

### 5.2 Onboarding Flow

The onboarding follows the same clean, white-card design as the dashboard. Use the design knowledge from the shell — clean cards, green accents, consistent typography.

```
┌──────────────────────────────────────────────────────┐
│  [Fiber Logo]     Step 2 of 7         [Skip / Later] │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  [■ ■ ■ ■ ○ ○ ○]  ← segmented progress bar      │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │                                                    │ │
│  │  Tell us about your business                      │ │
│  │  This helps us customize your dashboard            │ │
│  │                                                    │ │
│  │  [Form fields...]                                 │ │
│  │                                                    │ │
│  │                          [Back]  [Continue →]     │ │
│  │                                                    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└──────────────────────────────────────────────────────┘
```

**Rules:**
- Background: `bg-gray-50` (same subtle off-white as the dashboard)
- Full-width container: `max-w-2xl mx-auto px-4 py-12`
- Logo: Fiber/Vayva green mark (same as sidebar top), left-aligned
- Step indicator: `text-sm text-gray-400` right of header
- Skip button: `text-sm text-gray-400 hover:text-gray-600` — ghost style
- Progress bar: segmented line (not dots)
  - Completed segments: `bg-green-500`
  - Current segment: `bg-green-500`
  - Upcoming segments: `bg-gray-200`
  - Each segment: `h-1 flex-1 rounded-full` in a `flex gap-2` container
- Step card: `bg-white rounded-2xl border border-gray-100 p-8`
- Step headline: `text-2xl font-bold text-gray-900 tracking-tight`
- Step description: `text-sm text-gray-500 mt-2 mb-8`
- Form inputs: `bg-gray-50 border border-gray-200 rounded-xl h-12 px-4 text-sm`
  - Focus: `focus:border-green-400 focus:ring-2 focus:ring-green-500/10 focus:bg-white`
- Labels: `text-sm font-medium text-gray-700 mb-1.5`
- Continue button: `bg-green-500 hover:bg-green-600 text-white rounded-xl px-6 h-12 text-sm font-medium`
- Back button: `bg-white border border-gray-200 text-gray-700 rounded-xl px-6 h-12 text-sm font-medium`
- Footer: `flex justify-between mt-8` with Back (left) and Continue (right)

**Industry Selector:**
- Grid: `grid grid-cols-2 md:grid-cols-3 gap-3`
- Card: `bg-white rounded-xl border border-gray-200 p-4 hover:border-green-500 cursor-pointer transition-colors`
- Selected: `border-green-500 ring-2 ring-green-500 ring-offset-2 bg-green-50`
- Icon: `w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-2`
- Label: `text-sm font-medium text-gray-900`

**Social Connectors:**
- List items: `flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50`
- Platform icon: `w-10 h-10 rounded-xl` with brand color background
- Connect button: secondary button style
- Connected state: `text-xs text-green-600 font-medium` with checkmark

**Transitions:** Simple opacity fade between steps (300ms ease-out), no spring/bounce

### 5.3 Dashboard Shell (Sidebar + Header + Content)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌──────────────────┐  ┌───────────────────────────────────────────┐│
│ │ [Fiber Logo]     │  │ [←] 📁 Tasks > 📁 Tasks report   🔍 Search│
│ │ Merchant Name    │  │                    [Manage] [Share] [CTA] │
│ │ Store Name       │  └───────────────────────────────────────────┘│
│ │                  │                                               │
│ │ Overview ˅       │  ┌───────────────────────────────────────────┐│
│ │  ■ Dashboard     │  │                                           ││
│ │  ■ Calendar      │  │        PAGE CONTENT                       ││
│ │                  │  │        (scrollable)                       ││
│ │ Tasks ˄          │  │                                           ││
│ │  ☐ Backlog    24 │  │                                           ││
│ │  ⚡ In progress 4 │  │                                           ││
│ │  ⚙ Validation  7 │  │                                           ││
│ │  ✓ Done       13 │  │                                           ││
│ │                  │  │                                           ││
│ │ Tools ˅          │  │                                           ││
│ │  🔔 Notification │  │                                           ││
│ │  📥 Inbox        │  │                                           ││
│ │  </> Integration │  │                                           ││
│ │  📊 Reporting    │  │                                           ││
│ │                  │  │                                           ││
│ │ Metrics ˅        │  │                                           ││
│ │  📈 Active    !  │  │                                           ││
│ │  📉 Past         │  │                                           ││
│ │                  │  └───────────────────────────────────────────┘│
│ │──────────────────│                                               │
│ │ ❓ Help Center ↗ │                                               │
│ │ ⚙ Settings       │                                               │
│ │ 👥 Invite teams  │                                               │
│ │──────────────────│                                               │
│ │ 👤 Merchant Name │                                               │
│ │    email@store   │                                               │
│ └──────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────┘
```

#### 5.3.1 Sidebar Structure

The sidebar is a **permanently visible left panel** (not a collapsible icon bar). It stays expanded and shows full labels at all times on desktop.

**Sidebar dimensions:**
- Desktop width: `w-[220px]` — always expanded with icon + label
- Mobile: Hidden by default, slides in as overlay `w-[280px]`
- Background: `bg-white border-r border-gray-100` (solid white, no glass)
- Full height: `h-screen` fixed position
- Internal padding: `px-3 py-4`
- Overflow: `overflow-y-auto` with hidden scrollbar

**Top section — Branding:**
```
┌──────────────────────┐
│ [Fiber Logo] 🟢      │  ← Brand logo (e.g., Fiber/Vayva green mark)
│ Merchant First Name  │  ← text-sm font-semibold text-gray-900
│ store-name           │  ← text-xs text-gray-400
│ ──── collapse « ──── │  ← collapse toggle icon, right-aligned
└──────────────────────┘
```
- Logo: `w-8 h-8` brand mark (green circle/icon)
- Merchant name: `text-sm font-semibold text-gray-900` (first name only)
- Store name: `text-xs text-gray-400` below merchant name
- Collapse button: `«` chevron icon, `text-gray-400 hover:text-gray-600`
- Spacing below: `mb-6`

**Navigation groups — Collapsible sections:**

Each nav group has a section label that acts as a collapsible toggle:

```
Section label:  text-xs font-medium text-gray-400 uppercase tracking-wider
                px-3 py-2 cursor-pointer flex items-center justify-between
                [label] [chevron ˄/˅]
```

When a section is expanded, its child items show. When collapsed, children are hidden.

**Navigation items:**
```
Nav item:       flex items-center gap-3 px-3 py-2 rounded-xl text-sm
                text-gray-500 hover:text-gray-900 hover:bg-gray-50
                transition-colors cursor-pointer

Active item:    text-green-600 bg-green-50 font-medium rounded-xl

Icon:           20px, text-gray-400 (default), text-green-600 (active)

Count badge:    text-xs text-gray-400 ml-auto (e.g., "24", "4", "7", "13")

Notification:   ml-auto, red circle w-5 h-5 bg-red-500 text-white text-xs
                font-medium rounded-full flex items-center justify-center

Alert badge:    ml-auto, yellow/orange ! indicator
```

**Sub-navigation (nested items):**

When a parent item is expanded (e.g., "Tasks ˄"), its children show indented:
```
Parent:     ■ Tasks ˄                    ← has expand/collapse chevron
  Child:      ☐ Backlog        24       ← indented with pl-8, has count
  Child:      ⚡ In progress    4
  Child:      ⚙ Validation     7
  Child:      ✓ Done          13
```
- Children have `pl-8` (left indent) or `ml-6`
- Each child has its own status icon (different per state)
- Count badges right-aligned

**Navigation group order (top to bottom):**
1. **Overview** — Dashboard, Calendar
2. **Commerce** (or industry-specific) — Orders, Products, Bookings, etc.
3. **Tools** — Notification (with red badge count), Inbox, Integration, Reporting
4. **Metrics** — Active (with alert badge), Past

**Bottom section — Footer:**
```
┌──────────────────────┐
│ ─────── divider ──── │  ← border-t border-gray-100
│ ❓ Help Center    ↗  │  ← text-sm text-gray-500, external link icon
│ ⚙  Settings         │  ← text-sm text-gray-500
│ 👥 Invite teams      │  ← text-sm text-gray-500
│ ─────── divider ──── │  ← border-t border-gray-100
│ 👤 Merchant Full Name│  ← text-sm font-medium text-gray-900
│    merchant@email    │  ← text-xs text-gray-400
│                 [●]  │  ← online status indicator, green dot
└──────────────────────┘
```
- Help Center: opens external link (↗ arrow icon)
- Settings: navigates to `/settings`
- Invite teams: opens invite modal
- Divider: `border-t border-gray-100 my-3`
- User section: avatar (w-8 h-8 rounded-full) + name + email
- Online indicator: `w-2 h-2 rounded-full bg-green-500` absolute on avatar

#### 5.3.2 Top Header Bar

The header sits at the top of the content area (to the right of the sidebar).

```
┌─────────────────────────────────────────────────────────────────┐
│ [←] 📁 Tasks > 📁 Tasks report     🔍 Search ⌘K     [Manage] [Share] [Create task] │
└─────────────────────────────────────────────────────────────────┘
```

**Structure:**
- Height: `h-14` (56px)
- Background: `bg-white` (no border-bottom — clean flush with content)
- Layout: `flex items-center justify-between px-6`
- No glass, no blur, no shadows

**Left side — Back button + Breadcrumbs:**
```
[←]  📁 Tasks  >  📁 Tasks report
```
- Back arrow: `w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center`
  - Icon: `ArrowLeft` 18px `text-gray-500`
  - Shows only when navigated into a sub-page (not on root pages)
- Breadcrumb segments: `text-sm text-gray-400`
- Breadcrumb separator: `>` or `ChevronRight` 14px `text-gray-300`
- Each segment has a folder icon: `📁` or `Folder` icon 14px `text-gray-400`
- Current (last) segment: `text-gray-900 font-medium`
- Segments are clickable (navigate back to that level)

**Center — Search:**
```
🔍 Search                                    ⌘K
```
- `bg-gray-50 rounded-xl h-9 px-4 min-w-[200px] max-w-[300px]`
- Left: Search icon 16px `text-gray-400`
- Placeholder: `text-sm text-gray-400` "Search"
- Right: keyboard shortcut badge `text-xs text-gray-300 border border-gray-200 rounded px-1`
- Opens command palette on click or `⌘K`

**Right side — Actions:**
```
[Manage]  [Share]  [Create task]
```
- Manage button: `bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50`
  - Left icon: `Settings` or `Folder` 16px `text-gray-400`
- Share button: `bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50`
  - Left icon: `Share2` or `Link` 16px `text-gray-400`
- Primary CTA: `bg-green-500 hover:bg-green-600 text-white rounded-full px-5 py-2 text-sm font-medium`
  - The label changes per page context: "Create task", "Add Product", "New Order", etc.

#### 5.3.3 Content Area

- Sits to the right of sidebar, below header
- Padding: `px-6 py-6`
- No max-width constraint (fills available space)
- Vertical scroll only, smooth
- Background: `bg-white` or `bg-gray-50` (page-level choice)

#### 5.3.4 Breadcrumb Hierarchy Rules

Breadcrumbs reflect the navigation depth. The folder icon shows the user WHERE they are:

| Page | Breadcrumb |
|---|---|
| Dashboard (root) | No breadcrumb (just title) |
| Orders list | `📁 Orders` |
| Order detail | `[←] 📁 Orders > 📁 Order #1234` |
| Tasks list | `📁 Tasks` |
| Tasks report | `[←] 📁 Tasks > 📁 Tasks report` |
| Product detail | `[←] 📁 Products > 📁 Blue T-Shirt` |
| Settings > Billing | `[←] 📁 Settings > 📁 Billing` |
| Timeline view | `[←] 📁 New microdose website 🎨 > 📁 Timeline` |

The back arrow `[←]` appears whenever breadcrumb has 2+ segments. Clicking it goes to the parent.

#### 5.3.5 Team Avatar Group (Page Header)

On metrics/report pages, show a team avatar group in the top-right of the page header area (below the top bar, aligned with the page title):

```
                                                    [👤][👤][👤][👤] [+]
Store Dashboard
Stay on top of your store...
```

- Position: `absolute right-0` or `flex justify-between` with title
- Avatars: `w-9 h-9 rounded-full border-2 border-white -space-x-2`
- Add button: `w-9 h-9 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center`
  - Icon: `Plus` 14px `text-gray-400`
  - Opens invite/add team member modal

### 5.4 Dashboard Pages (ALL 266+ Pages)

Every dashboard page follows one of these 3 templates:

#### Template A: Metrics + Content Page (Dashboard, Orders, Products, Finance, Marketing, Customers, etc.)

```
┌─────────────────────────────────────────────────────────┐
│ PAGE HEADER                                               │
│ Title + Subtitle + Action buttons                        │
├─────────────────────────────────────────────────────────┤
│ SUMMARY WIDGETS (grid-cols-3)                            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│ │ Metric 1 │ │ Metric 2 │ │ Chart    │                  │
│ └──────────┘ └──────────┘ └──────────┘                  │
├─────────────────────────────────────────────────────────┤
│ TAB NAVIGATION                                           │
│ [Tab 1] [Tab 2] [Tab 3] [Tab 4]        [Filter] [View] │
│ ─────────────────────────────────────────────────────── │
├─────────────────────────────────────────────────────────┤
│ MAIN CONTENT                                             │
│ Kanban board / Data table / Card grid                   │
└─────────────────────────────────────────────────────────┘
```

#### Template B: Settings/Form Page (Settings, Account, Billing, etc.)

```
┌─────────────────────────────────────────────────────────┐
│ PAGE HEADER                                               │
│ Title + Subtitle                                         │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ SECTION CARD                                         │ │
│ │ Section title                                        │ │
│ │ Section description                                  │ │
│ │                                                       │ │
│ │ [Form fields...]                                     │ │
│ │                                                       │ │
│ │                               [Cancel]  [Save]       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ SECTION CARD 2                                       │ │
│ │ ...                                                   │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Template C: Detail/Single Item Page (Order detail, Product edit, etc.)

```
┌─────────────────────────────────────────────────────────┐
│ PAGE HEADER                                               │
│ [← Back] Title + Status badge + Action buttons           │
├─────────────────────────────────────────────────────────┤
│ ┌────────────────────────┐  ┌──────────────────────┐    │
│ │ MAIN CONTENT (8 cols)  │  │ SIDEBAR (4 cols)     │    │
│ │                        │  │                      │    │
│ │ Details card           │  │ Summary card         │    │
│ │ Activity timeline      │  │ Customer info        │    │
│ │ Notes section          │  │ Tags                 │    │
│ │                        │  │ Actions              │    │
│ └────────────────────────┘  └──────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

#### Template D: Timeline / Gantt View (Calendar, Timeline, Scheduling)

```
┌─────────────────────────────────────────────────────────────────┐
│ PAGE HEADER                                                       │
│ Title + Subtitle                              [Avatars] [+]      │
├─────────────────────────────────────────────────────────────────┤
│ [Day] [Week] [Month]    < 27 Dec - 4 Jan >                      │
│                                    [Show done 🔘] [Sort] [Filter]│
├─────────────────────────────────────────────────────────────────┤
│ December 2024                    │ January 2025                   │
│ M23  T24  W25  T26  F27  S28  S28  M30  T31 │ W1  T2  F3  S4  S5│
│──────────────────────────────────────────────────────────────────│
│ ┌─── Spline animated logo ──────────────┐                        │
│ │   🎨 Logo        👤👤    ⋮            │                        │
│ └───────────────────────────────────────┘          ┌─ Case ─┐   │
│                                                     │ studies│   │
│ ┌─── Contact page ──────┐                          └────────┘   │
│ │   📝 Contact us  👤👤 │                                        │
│ └────────────────────────┘                                       │
│                    ┌─── New microdose website ──────────────────┐ │
│                    │   🎨 New Homepage  👤👤👤👤+3               │ │
│                    └──────────────── (gradient bar) ────────────┘ │
│                                                                   │
│ ┌─── Input Styleguide ──────────┐                                │
│ │   ✏️ Contact   👤👤👤                                          │
│ └───────────────────────────────┘                                │
└─────────────────────────────────────────────────────────────────┘
```

**Timeline rules:**
- **Time scale controls**: `[Day] [Week] [Month]` toggle buttons
  - Active: `bg-gray-900 text-white rounded-lg px-3 py-1 text-sm font-medium`
  - Inactive: `text-gray-500 hover:text-gray-700 px-3 py-1 text-sm`
- **Date range**: `< 27 Dec - 4 Jan >` with left/right arrows, `text-sm text-gray-700`
- **Date header row**: Day abbreviation + date number, `text-xs text-gray-400`
  - Today indicator: vertical purple/green dashed line running full height
- **Month labels**: `text-sm font-semibold text-gray-900`
- **Timeline bars**: Horizontal bars representing task duration
  - Default: `bg-gray-100 rounded-lg h-12` with task name + tag + avatar group inside
  - Highlighted/active: gradient bar (orange→pink or brand gradient)
  - Hover: `shadow-md` transition
  - Each bar shows: task name (`text-sm font-medium`), tag below (`text-xs text-gray-400`), avatars right-aligned, three-dot menu
- **Connection lines**: Curved dotted lines between dependent tasks (`stroke-green-400 stroke-dasharray-4`)
- **Milestone dots**: `w-3 h-3 rounded-full bg-green-500` at key dates
- **Toggle**: "Show done" toggle switch (green when on)
- **Sort/Filter**: Ghost button style, `text-sm text-gray-500`
- **Scrolling**: Horizontal scroll for time axis, vertical scroll for task rows

#### Template E: Calendar View

```
┌─────────────────────────────────────────────────────────────────┐
│ PAGE HEADER                                                       │
│ Calendar                              [Avatars] [+]              │
├─────────────────────────────────────────────────────────────────┤
│ [Day] [Week] [Month]    < March 2026 >     [Show done] [Filter] │
├─────────────────────────────────────────────────────────────────┤
│ Mon    Tue    Wed    Thu    Fri    Sat    Sun                     │
│ ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐                     │
│ │ 1  ││ 2  ││ 3  ││ 4  ││ 5  ││ 6  ││ 7  │                     │
│ │ •  ││    ││ ••  ││    ││ •  ││    ││    │                     │
│ └────┘└────┘└────┘└────┘└────┘└────┘└────┘                     │
│ ... (more weeks)                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Calendar rules:**
- Day cells: `bg-white border border-gray-100 rounded-lg min-h-[100px] p-2`
- Today: `border-green-500 bg-green-50/30`
- Event dots: `w-1.5 h-1.5 rounded-full` using priority colors
- Event preview: `text-xs text-gray-700 truncate p-1 rounded bg-green-50` (or appropriate status color)
- Other month days: `text-gray-300` (dimmed)

---

## 6. COMPONENT LIBRARY

### 6.1 Page Header

Every page header follows this exact pattern:

```
┌─────────────────────────────────────────────────────────┐
│ Page Title                           [👤👤👤👤] [+]     │
│ Description text below the title                        │
└─────────────────────────────────────────────────────────┘
```

```
Container: flex items-start justify-between mb-6
Left side:
  Title:    text-2xl font-bold text-gray-900 tracking-tight
  Subtitle: text-sm text-gray-500 mt-1 max-w-lg
Right side:
  AvatarGroup + Add button (on report/metrics pages)
  OR action buttons (on CRUD pages)
```

### 6.2 Summary Widget Card

```
Container: bg-white rounded-2xl border border-gray-100 p-6
Grid:      grid grid-cols-1 md:grid-cols-3 gap-4
Header:    flex items-center gap-2 mb-4
           [icon 18px text-gray-500] + [text-sm font-semibold text-gray-900]
           Right side: action icons (pencil, expand, three-dot) text-gray-400 16px
Number:    text-3xl font-bold text-gray-900 tracking-tight
Label:     text-sm text-gray-500
Trend:     text-xs font-medium [text-green-600|text-red-500] + "(7d)"
Chart:     h-20 to h-40, inside the card
```

### 6.3 Tab Navigation

```
Container: border-b border-gray-200 mb-6
Active:    text-sm font-medium text-green-600 border-b-2 border-green-500 pb-3
Inactive:  text-sm font-medium text-gray-500 hover:text-gray-700 pb-3
Gap:       gap-6 between tabs
Right:     "Widgets" + "Filter" buttons with icons
```

### 6.4 Kanban Board

```
Grid:          grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4
Column header: icon 16px + text-sm font-medium text-gray-900 + count text-gray-400 + menu
Cards:         space-y-3 within each column
```

### 6.5 Item Card (Kanban / Grid)

```
Container: bg-white rounded-xl border border-gray-100 p-4
           hover:shadow-md transition-shadow cursor-pointer
Top row:   text-xs text-gray-400 font-mono (ID) + PriorityBadge (right)
Title:     text-sm font-semibold text-gray-900 mt-2
Subtitle:  text-xs text-gray-500 mt-1
Due date:  text-xs text-gray-400 flex items-center gap-1 mt-2
Footer:    flex items-center justify-between mt-3
           Left: AvatarGroup
           Right: comment count + date in text-xs text-gray-400
```

### 6.6 Data Table

```
Container:  bg-white rounded-2xl border border-gray-100 overflow-hidden
Header row: bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider
            px-6 py-3
Body row:   px-6 py-4 border-t border-gray-100 hover:bg-gray-50
            text-sm text-gray-900
Pagination: border-t border-gray-100 px-6 py-4
            text-sm text-gray-500 + page buttons
```

### 6.7 Form Elements

**Text Input:**
```
bg-gray-50 border border-gray-200 rounded-xl h-12 px-4 text-sm text-gray-900
placeholder:text-gray-400
focus:border-green-400 focus:ring-2 focus:ring-green-500/10 focus:bg-white
```

**Textarea:**
```
Same as input but min-h-[120px] py-3
```

**Select:**
```
Same base as input + chevron-down icon right
```

**Checkbox:**
```
w-5 h-5 rounded-md border-gray-300
checked:bg-green-500 checked:border-green-500
focus:ring-2 focus:ring-green-500/10
```

**Radio:**
```
w-5 h-5 rounded-full border-gray-300
checked:border-green-500 (with green inner dot)
```

**Toggle/Switch:**
```
w-10 h-6 rounded-full
Off: bg-gray-200
On: bg-green-500
Knob: bg-white w-4 h-4 rounded-full shadow-sm
```

**Label:**
```
text-sm font-medium text-gray-700 mb-1.5
```

**Help text:**
```
text-xs text-gray-400 mt-1.5
```

**Error text:**
```
text-xs text-red-500 mt-1.5
```

**Error input border:**
```
border-red-300 focus:border-red-500 focus:ring-red-500/10
```

### 6.8 Buttons

**Primary:**
```
bg-green-500 hover:bg-green-600 text-white rounded-xl h-10 px-4 text-sm font-medium
transition-colors
```

**Primary (Pill — for page CTAs):**
```
bg-green-500 hover:bg-green-600 text-white rounded-full h-10 px-5 text-sm font-medium
gap-2 (for icon + text)
```

**Primary (Full Width — auth/onboarding):**
```
bg-green-500 hover:bg-green-600 text-white rounded-xl h-12 px-6 text-sm font-medium
w-full (full-width on auth)
```

**Secondary:**
```
bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl h-10 px-4
text-sm font-medium transition-colors
```

**Ghost:**
```
bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-xl h-10 px-3
text-sm font-medium transition-colors
```

**Danger:**
```
bg-red-500 hover:bg-red-600 text-white rounded-xl h-10 px-4 text-sm font-medium
```

**Danger Ghost:**
```
bg-transparent hover:bg-red-50 text-red-600 rounded-xl h-10 px-4 text-sm font-medium
```

**Icon Button:**
```
w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center
text-gray-400 hover:text-gray-600 transition-colors
```

**Disabled state (all buttons):**
```
opacity-50 cursor-not-allowed pointer-events-none
```

### 6.9 Badges / Status Chips

```
Base: inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md

Success: bg-green-50 text-green-600
Warning: bg-orange-50 text-orange-600
Danger:  bg-red-50 text-red-600
Info:    bg-blue-50 text-blue-600
AI:      bg-violet-50 text-violet-600
Neutral: bg-gray-100 text-gray-600
```

### 6.10 Priority Badge (with flag icon)

```
Urgent: bg-red-50 text-red-600 + Flag icon 10px
Normal: bg-orange-50 text-orange-600 + Flag icon 10px
Low:    bg-green-50 text-green-600 + Flag icon 10px
```

### 6.11 Avatar Group

```
Container: flex -space-x-2
Avatar:    w-7 h-7 rounded-full border-2 border-white bg-gray-200
           text-xs font-medium text-gray-600 (for initials)
Overflow:  w-7 h-7 rounded-full border-2 border-white bg-gray-100
           text-xs font-medium text-gray-500 (shows "+N")
Max shown: 3-4
```

### 6.12 Modal / Dialog

```
Overlay:   bg-black/50 fixed inset-0 z-50
Container: bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 mx-4
Title:     text-lg font-semibold text-gray-900
Description: text-sm text-gray-500 mt-1
Footer:    flex justify-end gap-3 mt-6
Close X:   absolute top-4 right-4, text-gray-400 hover:text-gray-600
```

### 6.13 Toast / Notification

```
Container: bg-white rounded-xl border border-gray-100 shadow-lg p-4 max-w-sm
Title:     text-sm font-semibold text-gray-900
Message:   text-sm text-gray-500
Position:  top-right
Duration:  4 seconds
Success:   left border-l-4 border-green-500
Error:     left border-l-4 border-red-500
Warning:   left border-l-4 border-orange-500
Info:      left border-l-4 border-blue-500
```

### 6.14 Empty State

```
Container: flex flex-col items-center justify-center py-16 text-center
Icon:      w-12 h-12 text-gray-300 mb-4
Title:     text-base font-medium text-gray-900
Message:   text-sm text-gray-500 mt-1 max-w-sm
Action:    mt-4, use Secondary button style
```

### 6.15 Error State

```
Same as empty state but:
Icon:      text-red-300
Title:     text-base font-medium text-gray-900 ("Something went wrong")
Action:    "Try again" button, Secondary style
```

### 6.16 Loading / Skeleton

```
Skeleton block: bg-gray-100 animate-pulse rounded-xl
Match the shape: same height/width/radius as the content it replaces
Metric skeleton: h-8 w-20 rounded-lg
Card skeleton:   h-32 rounded-xl
Table row:       h-12 rounded-lg
Never use spinners in cards — always skeleton
Spinner only in: buttons (inline, 16px) and full-page loading
```

### 6.17 Search Bar

```
Container: relative
Input:     bg-gray-50 border border-gray-200 rounded-xl h-10 pl-10 pr-4 text-sm
           focus:border-green-400 focus:ring-2 focus:ring-green-500/10
Icon:      absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 16px
```

### 6.18 Dropdown Menu

```
Container: bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[180px]
Item:      px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer
           flex items-center gap-2
Separator: border-t border-gray-100 my-1
Danger:    text-red-600 hover:bg-red-50
```

### 6.19 Breadcrumbs

```
Container: flex items-center gap-2 text-sm mb-4
Segment:   text-gray-400 hover:text-gray-600 cursor-pointer
Separator: ChevronRight icon, 14px, text-gray-300
Current:   text-gray-900 font-medium (no hover, not clickable)
```

---

## 7. ICONS

**Library:** Lucide React (primary). Phosphor Icons allowed as secondary for navigation.

| Context | Size |
|---|---|
| Navigation sidebar | 20px |
| Section header | 18px |
| Button icon | 16px |
| Card action | 16px |
| Inline with text | 14px |
| Badge icon | 12px |
| Status indicator | 10px |

**Default color:** `text-gray-400`
**Active/hover:** `text-gray-600`
**Inside primary (green) button:** `text-white`
**Inside colored badge:** Inherit badge text color

---

## 8. ANIMATION & MOTION

| Element | Property | Duration | Easing |
|---|---|---|---|
| Button hover | `background-color` | 150ms | ease |
| Card hover shadow | `box-shadow` | 200ms | ease |
| Tab switch | `color, border-color` | 150ms | ease |
| Page entrance | `opacity` | 300ms | ease-out |
| Modal entrance | `opacity, transform` | 200ms | ease-out |
| Dropdown open | `opacity, transform` | 150ms | ease-out |
| Skeleton pulse | `opacity` | 1.5s | ease-in-out (loop) |
| Chart draw | `stroke-dashoffset` | 500ms | ease-out |
| Toast slide-in | `translateX` | 300ms | spring |

**Rules:**
1. No bounce or spring physics on cards
2. No `translateY(-4px)` hover lifts — use shadow only
3. Page transitions: opacity fade only, no slides
4. Loading: skeleton pulse only in cards, spinner only in buttons/full page
5. Framer Motion kept only for: page transitions, sidebar expand, modal enter/exit
6. Everything else uses CSS `transition-*` classes

---

## 9. RESPONSIVE DESIGN

### 9.1 Breakpoints

| Name | Width | Grid Changes |
|---|---|---|
| Mobile | < 768px | Single column everything, bottom nav |
| Tablet | 768-1024px | 2-col widgets, 2-col kanban |
| Desktop | 1024-1280px | 3-col widgets, 4-col kanban |
| Wide | > 1280px | Same as desktop, no max-width |

### 9.2 Mobile Rules

- All grids collapse to single column (`grid-cols-1`)
- Kanban: horizontal scroll with snap points
- Tabs: horizontal scroll with `overflow-x-auto`
- Page header actions collapse into a three-dot menu
- Summary widgets stack vertically
- Forms: single column, full width
- Sidebar: hidden, toggled via hamburger
- Bottom nav: visible, `fixed bottom-0`, 4-5 items
- Touch targets: minimum 44x44px on all interactive elements
- Input font-size: 16px minimum (prevent iOS zoom)
- Cards maintain padding (don't shrink below p-4)
- Avatar groups: max 2 visible + overflow count

### 9.3 Mobile Bottom Navigation

```
Container: fixed bottom-0 inset-x-0 bg-white border-t border-gray-100
           h-[60px] (+ safe area inset)
Items:     flex justify-around items-center
Item:      flex flex-col items-center gap-0.5
           icon 20px + text-[10px] font-medium
Active:    text-green-600
Inactive:  text-gray-400
```

---

## 10. SETTINGS & FORM PAGES SPECIFICS

### 10.1 Page Structure

```
Page background: bg-white or bg-gray-50
Max width:       max-w-3xl (for settings, account, billing)
Spacing:         space-y-6 between section cards
```

### 10.2 Section Card

```
Container:    bg-white rounded-2xl border border-gray-100 p-6
Title:        text-base font-semibold text-gray-900
Description:  text-sm text-gray-500 mt-1 mb-6
Divider:      border-t border-gray-100 mt-6 pt-6 (between sub-sections)
Footer:       flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100
```

### 10.3 Billing Page

- Plan card: highlighted with `border-green-500 bg-green-50` when current plan
- Plan name: `text-lg font-semibold`
- Price: `text-3xl font-bold` + `text-sm text-gray-500` for period
- Feature list: `text-sm text-gray-600` with check icons `text-green-500`
- Upgrade button: Primary pill style
- Invoice table: Standard data table component
- Payment method card: `bg-gray-50 rounded-xl p-4` with card icon + last 4 digits

### 10.4 Account Page

- Profile photo: `w-20 h-20 rounded-full` with change overlay
- Name/email fields: Standard form inputs
- Danger zone: Red-bordered section card `border-red-200` with danger ghost buttons
- Account deletion: Confirmation modal required

---

## 11. INDUSTRY-SPECIFIC CUSTOMIZATION

The layout, typography, colors, and components remain IDENTICAL across all industries. The only things that change per industry are:

1. **Tab labels** (e.g., "Appointments" for wellness vs "Orders" for retail)
2. **Kanban column names** (e.g., "Booked → Confirmed → Completed" for bookings)
3. **Widget metric labels** (e.g., "Properties" for real estate vs "Products" for retail)
4. **Navigation items** (different sidebar modules per industry)
5. **Quick action labels** (e.g., "Add Listing" vs "Add Product")

**Do NOT customize:**
- Card styles, colors, or shadows per industry
- Font sizes or weights per industry
- Layout structure or grid per industry
- Button styles per industry
- Any color themes or gradients per industry (remove VayvaThemeProvider design categories)

---

## 12. DO's AND DON'Ts

### DO:
- Use `gray-*` exclusively for all neutral colors
- Use `bg-white` with `border border-gray-100` for all cards
- Use `rounded-2xl` for section/widget cards, `rounded-xl` for smaller cards
- Use `text-sm` (14px) as the base body size everywhere
- Use the 3 page templates for all pages
- Show summary widgets on every metrics page
- Include tab navigation between widgets and content
- Use skeleton loading for all card content
- Keep 24px padding inside all cards
- Use Lucide icons at documented sizes
- Put trend indicators on every metric

### DON'T:
- Don't use `slate-*`, `zinc-*`, or `neutral-*` — only `gray-*`
- Don't use glassmorphism (`backdrop-blur`, transparent backgrounds) in content
- Don't use shadows on resting cards
- Don't use `rounded-[28px]` or `rounded-3xl` on content cards
- Don't use `text-base` (16px) or `text-lg` (18px) for body text inside dashboard
- Don't use Space Grotesk inside the dashboard — only on auth/onboarding headlines
- Don't use colored card backgrounds (only white)
- Don't use gradient text
- Don't use spring/bounce animations on content
- Don't use spinners inside cards (use skeletons)
- Don't add decorative illustrations or background gradients
- Don't use more than 3 summary widgets in the top row
- Don't exceed 4 kanban columns
- Don't use inline styles for colors or spacing
- Don't vary the design per industry (same components everywhere)

---

## 13. ACCESSIBILITY

- Touch targets: 44x44px minimum (WCAG 2.1 AAA)
- Text contrast: 4.5:1 minimum (text), 3:1 minimum (large text)
- Focus: `focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2`
- Skip-to-content link: Present, visually hidden until focused
- Aria labels: Required on all icon-only buttons
- Status colors: Always paired with text labels, never color-only
- Form errors: Associated with inputs via `aria-describedby`
- Modals: Focus trap, `Escape` to close, `aria-modal="true"`
- Keyboard: All interactive elements reachable via Tab, activatable via Enter/Space
- Screen readers: Semantic HTML (`nav`, `main`, `section`, `header`, `footer`)
- Reduced motion: Respect `prefers-reduced-motion` — disable animations
