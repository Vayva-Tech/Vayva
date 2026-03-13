# Universal Settings Expansion System
## Industry-Specific Settings Architecture for All 22 Industries

**Document Version:** 1.0  
**Scope:** Settings page expansion pattern for all industries  
**Last Updated:** 2026-03-11

---

## Executive Summary

This document defines the universal architecture for expanding the Vayva settings system to support industry-specific configurations while maintaining a consistent user experience across all 22 industries.

### Key Principles

1. **Consistent Structure** - All industries follow the same settings layout pattern
2. **Progressive Disclosure** - Basic settings visible, advanced settings collapsible
3. **Integration-First** - Easy connection to third-party platforms
4. **Compliance-Ready** - Built-in support for industry regulations (HIPAA, etc.)
5. **Role-Based Access** - Different settings available per user role

---

## Settings Architecture

### Base Settings (All Industries)

Every industry has these core settings sections:

```
Settings (Root)
├── General
│   ├── Business Profile
│   ├── Branding & Logo
│   ├── Notifications
│   ├── Team & Permissions
│   └── Billing & Subscription
├── Industry-Specific Section (Dynamic)
│   └── Varies by industry (see below)
└── Integrations
    ├── Connected Platforms
    ├── API Keys
    ├── Webhooks
    └── Data Export
```

### Industry-Specific Extensions

Each industry gets ONE dedicated section in the left sidebar with 4-6 subsections:

| Industry | Section Name | Subsections |
|----------|-------------|-------------|
| **Fashion** | Fashion Specific | Size Guide, Collections, Visual Merch, Inventory, Wholesale, Trend Analytics |
| **Restaurant** | Restaurant Config | Menu Mgmt, Table Mgmt, Kitchen, Staff, Reservations, Delivery |
| **Retail** | Retail Settings | Store Mgmt, Inventory, POS, Channels, Loyalty, Transfers |
| **Real Estate** | Property Settings | Listings, CMA, Showings, Leads, Agents, Contracts |
| **Healthcare** | Practice Settings | Patients, Appointments, Queue, Prescriptions, HIPAA, Billing |
| **Beauty** | Salon Settings | Services, Stylists, Appointments, Gallery, Products, Packages |
| **Events** | Event Settings | Events, Tickets, Venues, Attendees, Sponsors, Vendors |
| **Nightlife** | Venue Settings | Tables, VIP List, Bottle Service, Music, Security, Promoters |
| **Automotive** | Dealership Settings | Inventory, Test Drives, Financing, Service, Parts, Trade-ins |
| **SaaS** | Platform Settings | Subscriptions, Features, Usage, Tenants, API Keys, Webhooks |
| **Education** | Course Settings | Courses, Students, Enrollments, Assignments, Instructors, Certificates |
| **Blog** | Content Settings | Posts, Calendar, Media, Comments, SEO, Newsletter |
| **Travel** | Booking Settings | Bookings, Packages, Itineraries, Destinations, Suppliers, Commissions |
| **Nonprofit** | Organization Settings | Donations, Campaigns, Donors, Volunteers, Grants, Impact |
| **Wellness** | Studio Settings | Classes, Memberships, Trainers, Progress, Facilities, Retreats |
| **Grocery** | Store Settings | Products, Inventory, Delivery, Substitutions, Suppliers, Promotions |
| **Kitchen/KDS** | Kitchen Settings | Recipes, Prep List, Waste Tracking, Food Costs, Allergens |
| **Wholesale** | B2B Settings | Customers, Pricing, Batches, Net Terms, Sales Reps, Minimum Orders |
| **Marketplace** | Platform Settings | Vendors, Commissions, Disputes, Analytics, Moderation, Shipping |
| **Creative** | Studio Settings | Projects, Assets, Client Proofs, Time Tracking, Invoices |
| **Professional** | Firm Settings | Clients, Matters, Time & Billing, Documents, Compliance |
| **Legal** | Law Firm Settings | Cases, Intake, Documents, Conflicts, Trust Accounting |

---

## Settings Page Template

### Standard Layout Pattern

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SETTINGS                                                                    │
├──────────────────┬──────────────────────────────────────────────────────────┤
│                  │                                                          │
│  GENERAL         │  [Industry-Specific Section Header]                      │
│  ├─ Business     │                                                          │
│  ├─ Branding     │  ┌────────────────────────────────────────────────────┐  │
│  ├─ Notifications│  │  CONFIGURATION GROUP 1                              │  │
│  ├─ Team         │  │                                                     │  │
│  ├─ Billing      │  │  Setting Label:                                     │  │
│  │               │  │  [Input Field / Toggle / Dropdown / Multi-select]   │  │
│  ──────────────  │  │                                                     │  │
│                  │  │  Helper text or description                         │  │
│  INDUSTRY SPEC   │  └────────────────────────────────────────────────────┘  │
│  ├─ Subsection 1 │                                                          │
│  ├─ Subsection 2 │  ┌────────────────────────────────────────────────────┐  │
│  ├─ Subsection 3 │  │  CONFIGURATION GROUP 2                              │  │
│  ├─ Subsection 4 │  │  ...                                               │  │
│  ├─ Subsection 5 │  └────────────────────────────────────────────────────┘  │
│  └─ Subsection 6 │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│  INTEGRATIONS    │  │  CONFIGURATION GROUP 3                              │  │
│  ├─ Connected    │  │  ...                                               │  │
│  ├─ API Keys     │  └────────────────────────────────────────────────────┘  │
│  ├─ Webhooks     │                                                          │
│  └─ Export       │  [Save Changes]  [Reset]  [Cancel]                     │
│                  │                                                          │
└──────────────────┴──────────────────────────────────────────────────────────┘
```

---

## Detailed Settings Specifications by Batch

### BATCH 1: Commerce Industries

#### 1. FASHION - Settings Specification

**Section:** Fashion Specific

**Subsections:**

**1.1 Size Guide Management**
```yaml
Size Guide Builder:
  - Default size format: US | UK | EU | CM
  - Include measurements: Yes/No
  - Size converter widget: Enable/Disable
  - Fit recommendations: AI-powered | Manual | Disabled
  
Size Charts:
  - Upload custom chart (PDF/Image)
  - Digital size guide editor
  - Category-specific charts (Tops, Bottoms, Dresses)
  
Model Information:
  - Show model measurements: Yes/No
  - Display size worn: Yes/No
  - Include height: Yes/No
```

**1.2 Collection Management**
```yaml
Collection Settings:
  - Auto-publish collections: On/Off
  - Default view: Grid | List | Timeline
  - Lookbook template: Standard | Editorial | Minimal
  
Seasonal Configuration:
  - Spring/Summer: Enabled/Disabled
  - Fall/Winter: Enabled/Disabled
  - Resort: Enabled/Disabled
  - Holiday Capsule: Enabled/Disabled
  
Display Options:
  - Collection order: Manual | Chronological | Best Selling
  - Show collection descriptions: Yes/No
  - Collection cover images: Auto | Manual
```

**1.3 Visual Merchandising**
```yaml
Lookbook Settings:
  - Aspect ratio: 3:4 Portrait | 1:1 Square | 16:9 Landscape
  - Image quality: High (WebP) | Medium (JPEG) | Optimized
  - Lazy loading: Enabled/Disabled
  
Model Diversity:
  - Show size range: Yes/No
  - Show skin tone range: Yes/No
  - Include plus-size models: Yes/No
  
Templates:
  - Configure lookbook templates
  - Custom CSS overrides
  - Brand color application
```

**1.4 Inventory Management**
```yaml
Stock Alerts:
  - Low stock threshold: [10] units
  - Critical stock: [3] units
  - Alert recipients: [email list]
  
Size Curve Alerts:
  - Enable size-based alerts: Yes/No
  - Restock suggestions: AI Recommendations | Manual
  
Variant Tracking:
  - Track by size: Yes/No
  - Track by color: Yes/No
  - Track by material: Yes/No
```

**1.5 Wholesale Pricing**
```yaml
Wholesale Configuration:
  - Enable wholesale: On/Off
  - Minimum order: [$500]
  
Pricing Tiers:
  - Tier 1 (5-24 units): [40%] off retail
  - Tier 2 (25-99 units): [50%] off retail
  - Tier 3 (100+ units): [55%] off retail
  
Customer Management:
  - Manage wholesale customers
  - Approval workflow: Auto | Manual
  - Custom pricing per customer
```

**1.6 Trend Analytics**
```yaml
Data Sources:
  - Internal sales data: Enabled/Disabled
  - Social listening: Enabled/Disabled
  - Industry reports: Enabled/Disabled
  - Competitor analysis: Enabled/Disabled
  
Forecasting:
  - Forecast period: 3 months | 6 months | 12 months
  - Alert threshold: [15%] trend shift
  
Integration:
  - Connect WGSN
  - Connect Trendalytics
  - Connect Edited
```

---

#### 2. RESTAURANT - Settings Specification

**Section:** Restaurant Configuration

**Subsections:**

**2.1 Hours & Service**
```yaml
Operating Hours:
  - Monday-Thursday: [11:00 AM - 10:00 PM]
  - Friday-Saturday: [11:00 AM - 11:00 PM]
  - Sunday: [12:00 PM - 9:00 PM]
  
Service Types:
  - Dine-in: Enabled/Disabled
  - Takeout: Enabled/Disabled
  - Delivery: Enabled/Disabled
  - Reservations: Enabled/Disabled
  - Catering: Enabled/Disabled
  
Rush Hour Settings:
  - Morning rush: Enabled/Disabled [Time range]
  - Lunch rush: Enabled/Disabled [11:30 AM - 2:00 PM]
  - Dinner rush: Enabled/Disabled [5:00 PM - 9:00 PM]
```

**2.2 Table Management**
```yaml
Capacity:
  - Total tables: [31]
  - Total seats: [120]
  
Table Configuration:
  - 2-tops: [8]
  - 4-tops: [12]
  - 6-tops: [6]
  - 8+ tops: [3]
  - Bar seats: [12]
  
Floor Plan:
  - Upload floor plan image
  - Configure table layout editor
  - Table numbering scheme
  
Turn Time Goals:
  - Lunch: [45] minutes
  - Dinner: [60] minutes
  - Bar: [30] minutes
  - Large parties: [90] minutes
```

**2.3 Menu Management**
```yaml
Active Menus:
  - Lunch Menu: Enabled/Disabled
  - Dinner Menu: Enabled/Disabled
  - Weekend Brunch: Enabled/Disabled
  - Happy Hour: Enabled/Disabled
  - Kids Menu: Enabled/Disabled
  - Bar Menu: Enabled/Disabled
  
Display Settings:
  - Show calories: Yes/No
  - Show allergens: Yes/No
  - Dietary icons: Vegan, GF, Spicy
  
86 Board:
  - Auto-update from inventory: Enabled/Disabled
  - Low stock threshold: [10] portions
  
Item Management:
  - Manage menu items
  - Import menu from file
  - Recipe costing integration
```

**2.4 Kitchen Configuration**
```yaml
Stations:
  - Grill: Enabled/Disabled
  - Fryer: Enabled/Disabled
  - Sauté: Enabled/Disabled
  - Cold: Enabled/Disabled
  - Expo: Enabled/Disabled
  - Bar: Enabled/Disabled
  - Pizza: Enabled/Disabled
  - Sushi: Enabled/Disabled
  - Dessert: Enabled/Disabled
  
KDS Settings:
  - Auto-route items: Enabled/Disabled
  - Fire times: Immediate | Delayed
  - Course timing: Apps 0min, Main +15min
  
Ticket Rules:
  - Auto-bump after: [90] minutes
  - Alert at: [45] minutes
  - Urgent at: [75] minutes
```

**2.5 Reservation Rules**
```yaml
Reservations:
  - Accept reservations: Enabled/Disabled
  - Advance booking: [30] days
  - Cutoff time: [2] hours before
  
Party Size:
  - Online max: [8] guests
  - Phone max: Unlimited
  - Auto-assign tables: Enabled/Disabled
  
Deposit Policy:
  - Require deposit for: [6+] people
  - Deposit amount: [$20] per person
  - Cancellation fee: [$10] per person
```

**2.6 Delivery Integration**
```yaml
Platforms:
  - UberEats: Connected/Disconnected
  - DoorDash: Connected/Disconnected
  - Grubhub: Connected/Disconnected
  
Delivery Settings:
  - Delivery radius: [5] miles
  - Delivery fee: [$4.99]
  - Minimum order: [$15]
  
Packaging:
  - Include utensils by default: Yes/No
  - Ventilated bags: Yes/No
  - Separate hot/cold: Yes/No
```

---

#### 3. RETAIL - Settings Specification

**Section:** Retail Settings

**Subsections:**

**3.1 Store Configuration**
```yaml
Business Type:
  - Single Store: Enabled/Disabled
  - Multi-Location: Enabled/Disabled
  - Franchise: Enabled/Disabled
  - Pop-up/Temporary: Enabled/Disabled
  
Default Store:
  - Select default location
  
Tax Settings:
  - Tax rate: [8.5%]
  - Auto-calculate: Enabled/Disabled
  - Tax included in price: Yes/No
  
Barcode:
  - Format: UPC-A | EAN-13 | Code-128
  - Prefix: [123456]
  - Generate barcodes tool
```

**3.2 Multi-Channel Sales**
```yaml
Sales Channels:
  - Online Store (Shopify): Connected
  - Physical POS (Square): Connected
  - Mobile App (Custom): Connected
  - Marketplace (Amazon): Connected
  - Social Commerce: Enabled/Disabled
  
Channel Priority:
  - Drag to reorder priority
  
Inventory Sync:
  - Sync frequency: Real-time | Hourly | Daily
  - Conflict resolution: Online priority | Store priority
  - Buffer stock: [5] units per channel
```

**3.3 Inventory Management**
```yaml
Stock Tracking:
  - Track inventory: Enabled/Disabled
  - Allow backorders: Yes/No
  - Continue selling when OOS: Yes/No
  
Low Stock Alerts:
  - Default threshold: [10] units
  - Alert recipients: [email list]
  
Auto-Reorder:
  - Enable auto-reorder: Yes/No
  - Preferred suppliers: [Set defaults]
  
Transfers:
  - Auto-approve: Yes/No
  - Require manager approval: Yes/No
```

**3.4 Point of Sale**
```yaml
Hardware:
  - Connected registers: [Count]
  - Register status monitoring
  
Payment Methods:
  - Cash: Enabled/Disabled
  - Credit Card: Enabled/Disabled
  - Debit: Enabled/Disabled
  - Gift Card: Enabled/Disabled
  - Store Credit: Enabled/Disabled
  - Apple Pay: Enabled/Disabled
  - Google Pay: Enabled/Disabled
  
Receipt Options:
  - Default: Email | Print | SMS
  - Offer alternatives: Yes/No
  
Offline Mode:
  - Enable offline transactions: Yes/No
  - Auto-sync when online: Yes/No
```

**3.5 Loyalty Program**
```yaml
Program Settings:
  - Enable loyalty: Enabled/Disabled
  - Program name: [VIP Rewards]
  
Earning Rules:
  - $1 spent = [1] point
  - Birthday bonus: [50] points
  - Referral bonus: [100] points
  - Social share: [25] points
  
Redemption Rules:
  - [100] points = [$10] reward
  - Minimum redemption: [500] points
  - Expiration: [12] months
  
Tiers:
  - Manage tier structure
  - Preview program
```

**3.6 Pricing & Promotions**
```yaml
Pricing Strategy:
  - Default markup: [50]%
  - Round prices: Yes/No [.99]
  
Discount Rules:
  - Staff discount: [15]%
  - Manager discount: [25]%
  - Max without approval: [20]%
  
Automatic Promotions:
  - Buy 2 Get 10% off: Enabled/Disabled
  - Spend $100+ Get $15 off: Enabled/Disabled
  - Free shipping over $75: Enabled/Disabled
  
Price Matching:
  - Enable price match: Yes/No
  - Approved competitors: [Configure]
```

---

## Implementation Guidelines

### Component Structure

```typescript
// Base Settings Interface
interface IndustrySettings {
  industry: IndustrySlug;
  sections: SettingsSection[];
}

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  groups: SettingsGroup[];
}

interface SettingsGroup {
  id: string;
  title: string;
  fields: SettingsField[];
}

// Example: Fashion Settings
const fashionSettings: IndustrySettings = {
  industry: 'fashion',
  sections: [
    {
      id: 'size-guide',
      title: 'Size Guide Management',
      icon: <RulerIcon />,
      groups: [
        {
          id: 'size-format',
          title: 'Size Format',
          fields: [
            {
              type: 'select',
              key: 'defaultSizeFormat',
              label: 'Default Size Standard',
              options: ['US', 'UK', 'EU', 'CM'],
              defaultValue: 'US'
            },
            // ... more fields
          ]
        }
      ]
    }
  ]
};
```

### Settings Form Pattern

```tsx
// Universal Settings Form Component
function IndustrySettingsForm({ industry }: { industry: IndustrySlug }) {
  const config = getIndustrySettingsConfig(industry);
  
  return (
    <div className="settings-container">
      <SettingsSidebar sections={config.sections} />
      <SettingsContent>
        {config.sections.map(section => (
          <SettingsSection key={section.id} section={section} />
        ))}
        <SettingsActions>
          <SaveButton />
          <ResetButton />
          <CancelButton />
        </SettingsActions>
      </SettingsContent>
    </div>
  );
}
```

---

## API Endpoints for Settings

### Universal Settings APIs

```
GET    /api/settings                    # Get all settings
PUT    /api/settings                    # Update settings
GET    /api/settings/:section           # Get section settings
PUT    /api/settings/:section           # Update section settings
POST   /api/settings/:section/reset     # Reset to defaults
```

### Industry-Specific Settings APIs

```
# Fashion
GET    /api/fashion/settings/size-guide
PUT    /api/fashion/settings/size-guide
POST   /api/fashion/settings/size-guide/upload-chart

# Restaurant
GET    /api/restaurant/settings/kitchen
PUT    /api/restaurant/settings/kitchen
POST   /api/restaurant/settings/menu/import

# Retail
GET    /api/retail/settings/channels
PUT    /api/retail/settings/channels
POST   /api/retail/settings/channels/sync
```

---

## Role-Based Access Control

### Permission Levels

```typescript
enum SettingsPermission {
  VIEW = 'view',
  EDIT = 'edit',
  ADMIN = 'admin'
}

// Example permissions by role
const rolePermissions = {
  owner: {
    general: SettingsPermission.ADMIN,
    industrySpecific: SettingsPermission.ADMIN,
    integrations: SettingsPermission.ADMIN,
    billing: SettingsPermission.ADMIN
  },
  manager: {
    general: SettingsPermission.EDIT,
    industrySpecific: SettingsPermission.EDIT,
    integrations: SettingsPermission.VIEW,
    billing: SettingsPermission.VIEW
  },
  staff: {
    general: SettingsPermission.VIEW,
    industrySpecific: SettingsPermission.VIEW,
    integrations: SettingsPermission.NONE,
    billing: SettingsPermission.NONE
  }
};
```

---

## Compliance & Security

### HIPAA Compliance (Healthcare)

```yaml
HIPAA Settings:
  - Encrypt PHI at rest: Required
  - Encrypt PHI in transit: Required
  - Access logs: Enabled
  - Audit trail: Enabled
  - Auto-logout: [15] minutes
  - Two-factor authentication: Required
  - Business Associate Agreement: Uploaded
```

### PCI Compliance (Payments)

```yaml
PCI Settings:
  - Never store CVV: Required
  - Tokenize card data: Required
  - Secure transmission: TLS 1.3
  - Regular security scans: Enabled
```

### GDPR Compliance (EU)

```yaml
GDPR Settings:
  - Cookie consent: Enabled
  - Data export tool: Available
  - Right to be forgotten: Enabled
  - Privacy policy link: Required
  - Data processing agreement: Uploaded
```

---

## Testing Requirements

### Settings Validation

```typescript
// Validation schema example
const settingsSchema = z.object({
  sizeGuide: z.object({
    defaultFormat: z.enum(['US', 'UK', 'EU', 'CM']),
    includeMeasurements: z.boolean(),
    sizeConverter: z.boolean()
  }),
  inventory: z.object({
    lowStockThreshold: z.number().min(1).max(1000),
    criticalStock: z.number().min(1),
    alertRecipients: z.array(z.string().email())
  })
});
```

### Test Cases

1. ✅ Settings load correctly for each industry
2. ✅ Changes persist after save
3. ✅ Reset restores defaults
4. ✅ Validation errors display properly
5. ✅ Role-based access enforced
6. ✅ Integration connections work
7. ✅ Compliance settings locked for appropriate industries

---

*Universal Settings Expansion System - Supporting all 22 Vayva industries*
