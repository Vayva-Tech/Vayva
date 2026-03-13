# Batch 5 Design Specification: Kitchen/KDS Platform

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  VAYVA KITCHEN - Modern Dark (KDS Optimized)                                        │
│  [Dashboard] [Tickets] [Prep List] [86 Board] [Inventory] [Waste] [Reports] [Settings]│
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  📊 KITCHEN STATUS                                      🔔 9 Active Alerts          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  Active Tickets: 24         │  Avg Cook Time: 12:34    │  Orders/Hour      │   │
│  │  ▲ 8 vs last hour           │  ▼ -1:23 improvement    │  47              │   │
│  │                             │                            │  ▲ 12% vs lunch  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  🔥 ACTIVE TICKETS BY STATION                       ⏱️ TICKET TIMERS                │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  Ticket #   Items                          Station    Timer     Status     │   │
│  │  #147       2x Ribeye, 1x Salmon          Grill      8:23      On Track ◉  │   │
│  │  #148       3x Caesar Salad, 2x Soup      Cold       6:45      On Track ◉  │   │
│  │  #149       1x Lobster Tail               Grill      11:02     Warning ⚠  │   │
│  │  #150       4x Pasta Carbonara            Hot        9:17      On Track ◉  │   │
│  │  #151       2x Fish & Chips               Fry        5:34      Early ✓     │   │
│  │  #152       1x Surf & Turf                Grill      14:56     Critical 🔴 │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  📋 STATION WORKLOAD                                  🚨 EXPEDITE QUEUE             │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Grill Station                   │  │  Ready for Pickup                      │ │
│  │  ████████░░ 8 items            │  │  ┌──────────────────────────────────┐  │ │
│  │  Backlog: 12 min               │  │  │ #145 - Table 7 (2 guests)       │  │ │
│  │                                 │  │  │ 1x Ribeye (med), 1x Salmon      │  │ │
│  │  Cold Station                  │  │  │ Ready 2 min ago ✅               │  │ │
│  │  ████░░░░░░ 4 items            │  │  │                                  │  │ │
│  │  Backlog: 6 min                │  │  │ #146 - Order 2847 (Delivery)    │  │ │
│  │                                 │  │  │ 2x Pasta, 1x Salad, 1x Bread    │  │ │
│  │  Hot Line                      │  │  │ Ready now ✅                     │  │ │
│  │  █████░░░░░ 5 items            │  │  │                                  │  │ │
│  │  Backlog: 8 min                │  │  │ #143 - Table 12 (4 guests)      │  │ │
│  │                                 │  │  │ 4x Steaks various               │  │ │
│  │  Fry Station                   │  │  │ Waiting 8 min ⏳                 │  │ │
│  │  ██░░░░░░░░ 2 items            │  │  └──────────────────────────────────┘  │ │
│  │  Backlog: 3 min                │  │                                         │ │
│  │  Pastry                        │  │  Driver Assignments:                  │ │
│  │  ░░░░░░░░░░ 0 items            │  │  • Mike - 3 deliveries               │ │
│  │  Clear ✅                      │  │  • Sarah - 2 deliveries              │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  📦 86 BOARD (OUT OF STOCK)                           🥘 RECIPE COSTING             │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Currently 86'd Items            │  │  Menu Item Profitability              │ │
│  │  ❌ Lobster Tail (until 8pm)    │  │  ┌──────────────────────────────────┐  │ │
│  │  ❌ Sea Bass (supplier delay)   │  │  │ Ribeye Steak                    │  │ │
│  │  ⚠️ Avocado (limited - 12 left)│  │  │ Cost: $12.40  Price: $38.00     │  │ │
│  │  ⚠️ Pineapple (running low)    │  │  │ Margin: 67.4%  Sold: 234        │  │ │
│  │                                 │  │  │                                  │  │ │
│  │  Expected Restocks:             │  │  │ Pasta Carbonara                 │  │ │
│  │  • Fresh Fish - 4:00 PM         │  │  │ Cost: $4.20   Price: $22.00     │  │ │
│  │  • Produce Delivery - 5:00 PM   │  │  │ Margin: 80.9%  Sold: 189        │  │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  🗑️ WASTE TRACKING                                  📊 KITCHEN PERFORMANCE          │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Today's Waste Log               │  │  Key Metrics                           │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Spoilage: $47.23        │  │  │  │ Food Cost %: 28.4%               │  │ │
│  │  │ Errors: $23.50          │  │  │  │ Target: 30% ✅                   │  │ │
│  │  │ Comped: $89.00          │  │  │  │                                  │  │ │
│  │  │ Staff Meal: $34.00      │  │  │  │ Ticket Times:                    │  │ │
│  │  └──────────────────────────┘  │  │  │ Avg: 12:34  Goal: <15:00 ✅      │  │ │
│  │                                 │  │  │ 90th %ile: 18:23                │  │ │
│  │  Top Waste Items:               │  │  │                                  │  │ │
│  │  • French Fries (overcooked)   │  │  │ Accuracy Rate: 97.8%             │  │ │
│  │  • Chicken Breast (dry)        │  │  │ (orders without modifications)   │  │ │
│  │  • Lettuce (wilted)            │  │  │                                  │  │ │
│  └──────────────────────────────────┘  │  │ Refires Today: 3                 │  │ │
│                                         │  └──────────────────────────────────┘  │ │
│                                                                                     │
│  👨‍🍳 STAFF PERFORMANCE                                📝 SHIFT HANDOVER             │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Chef Performance Today          │  │  Notes for Next Shift                  │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Marcus (Grill): 47 items│  │  │  │ • 86 board updated at 3pm        │  │ │
│  │  │ Speed: 11:23 avg        │  │  │  │ • Prep list 85% complete         │  │ │
│  │  │ Quality: 4.8/5          │  │  │  │ • VIP reservations: Table 20, 7pm│  │ │
│  │  │                          │  │  │  │ • Equipment issue: Fryer #2      │  │ │
│  │  │ Sofia (Cold): 34 items  │  │  │  │   maintenance called             │  │ │
│  │  │ Speed: 8:45 avg         │  │  │  │                                  │  │ │
│  │  │ Quality: 4.9/5          │  │  │  │ Low Inventory Alert:             │  │ │
│  │  └──────────────────────────┘  │  │  │ • Heavy cream (order tomorrow)   │  │ │
│  │                                 │  │  │ • Fresh basil (use by Friday)    │  │ │
│  │  Employee of Week: Marcus      │  │  └──────────────────────────────────┘  │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Design Category: Modern Dark

**Primary Color:** Fire Orange `#FF6B35`
**Accent Colors:** Steel Blue `#4A90E2`, Fresh Green `#10B981`, Warning Yellow `#F59E0B`

**Visual Characteristics:**
- Dark backgrounds to reduce glare in kitchen environments
- High-contrast text and indicators for quick reading
- Large, bold timers with color-coded urgency
- Touch-optimized interfaces for gloved hands
- Minimal animations for performance
- Sound alerts integration
- Splash-resistant display mode

**Component Styling:**
- Cards: Dark gray backgrounds (#1E293B) with bright accent borders
- Timers: Large numerals changing color based on urgency (green → yellow → red)
- Status Badges: Bold colors with clear icons
- Progress Bars: Thick, visible bars showing station workload
- Buttons: Large touch targets with haptic feedback
- Typography: Bold, high-contrast fonts for readability

## Component Hierarchy

```
KitchenDashboard (root)
├── KitchenStatus
│   ├── ActiveTicketsCount (current count, trend vs last period)
│   ├── AverageCookTime (current time, improvement/worsening)
│   └── OrdersPerHour (throughput metric, comparison)
├── ActiveTicketsByStation
│   ├── TicketGrid (all active tickets organized by station)
│   ├── TicketCard (ticket number, items, station, timer, status)
│   ├── TicketTimer (count-up timer with color thresholds)
│   ├── StatusBadge (on track, warning, critical, done)
│   ├── StationFilter (filter tickets by station)
│   └── TicketActions (bump, recall, void, modify)
├── StationWorkload
│   ├── StationQueueList (all stations with workload visualization)
│   ├── WorkloadBar (visual bar showing items in queue)
│   ├── BacklogTimeEstimate (projected completion time)
│   ├── StationStatusBadge (busy, balanced, clear)
│   └── RebalanceSuggestions (AI recommendations for load balancing)
├── ExpediteQueue
│   ├── ReadyForPickupList (completed orders awaiting pickup)
│   ├── PickupOrderCard (ticket number, destination, items, ready time)
│   ├── WaitTimeIndicator (time since order completed)
│   ├── DriverAssignmentDisplay (assigned driver for deliveries)
│   └── RunnerNotificationAlert (alert server/driver)
├── EightySixBoard
│   ├── OutOfStockList (currently 86'd items)
│   ├── EightySixItem (item name, reason, expected restock time)
│   ├── LimitedQuantityAlerts (items running low)
│   ├── ExpectedRestocksList (incoming deliveries timeline)
│   └── MenuItemImpactAnalysis (which menu items affected)
├── RecipeCosting
│   ├── MenuItemProfitabilityList (ranked by margin or volume)
│   ├── ProfitabilityCard (name, cost, price, margin percentage, sold count)
│   ├── CostBreakdownChart (ingredients cost breakdown)
│   ├── PriceOptimizationSuggestions (AI pricing recommendations)
│   └── PopularityVsProfitabilityMatrix (BCG matrix visualization)
├── WasteTracking
│   ├── WasteLogSummary (today's waste by category)
│   ├── WasteCategoryCard (category, amount, percentage)
│   ├── TopWasteItemsList (most wasted items with reasons)
│   ├── WasteReasonAnalyzer (spoilage, errors, comped, staff meal)
│   └── WasteReductionSuggestions (process improvements)
├── KitchenPerformance
│   ├── FoodCostPercentage (current vs target, trend)
│   ├── TicketTimesAnalytics (average, median, 90th percentile)
│   ├── AccuracyRateMetric (percentage of perfect orders)
│   ├── RefiresTracker (count and reasons)
│   └── CustomerComplaintsLog (food quality complaints)
├── StaffPerformance
│   ├── ChefPerformanceList (by station or individual)
│   ├── ChefCard (name, station, items produced, avg time, quality rating)
│   ├── SpeedMetric (average ticket time per chef)
│   ├── QualityRating (chef rating from expeditor/chef feedback)
│   ├── EmployeeOfWeekHighlight (top performer recognition)
│   └── TrainingNeedsIdentifier (skills gaps detected)
└── ShiftHandover
    ├── ShiftNotesList (important information for next shift)
    ├── NoteItem (category, message, priority, timestamp)
    ├── LowInventoryAlerts (items to order)
    ├── EquipmentIssuesLog (maintenance needs)
    ├── VIPReservationsAlert (special upcoming bookings)
    ├── PrepCompletionStatus (percentage complete for tomorrow)
    └── EightySixBoardUpdate (current state summary)
```

## Theme Presets

### Theme 1: Kitchen Fire (Default)
```css
.primary: #FF6B35;        /* Fire Orange */
.secondary: #4A90E2;      /* Steel Blue */
.accent: #10B981;         /* Fresh Green */
.background: #1E293B;     /* Dark Slate */
.success: #10B981;
.warning: #F59E0B;        /* Amber */
.danger: #EF4444;         /* Red */
.text-primary: #F1F5F9;
.text-secondary: #94A3B8;
.card-bg: rgba(30, 41, 59, 0.95);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(255, 107, 53, 0.2);
```

### Theme 2: Stainless Steel
```css
.primary: #94A3B8;        /* Steel Gray */
.secondary: #475569;      /* Darker Steel */
.accent: #10B981;         /* Green */
.background: #0F172A;     /* Very Dark */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #F1F5F9;
.text-secondary: #94A3B8;
.card-bg: rgba(15, 23, 42, 0.95);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(148, 163, 184, 0.2);
```

### Theme 3: Chef's Green
```css
.primary: #10B981;        /* Emerald }
.secondary: #059669;      /* Darker Green */
.accent: #F59E0B;         /* Amber */
.background: #1E293B;     /* Dark Slate */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #F1F5F9;
.text-secondary: #94A3B8;
.card-bg: rgba(30, 41, 59, 0.95);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(16, 185, 129, 0.2);
```

### Theme 4: Midnight Kitchen
```css
.primary: #6366F1;        /* Indigo }
.secondary: #8B5CF6;      /* Violet */
.accent: #10B981;         /* Green */
.background: #0F172A;     /* Very Dark */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #F1F5F9;
.text-secondary: #94A3B8;
.card-bg: rgba(15, 23, 42, 0.95);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(99, 102, 241, 0.2);
```

### Theme 5: Classic Brigade
```css
.primary: #EF4444;        /* Red (traditional kitchen) }
.secondary: #1E293B;      /* Dark Blue-Gray */
.accent: #F59E0B;         /* Gold */
.background: #1E293B;     /* Dark Slate */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #F1F5F9;
.text-secondary: #94A3B8;
.card-bg: rgba(30, 41, 59, 0.95);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(239, 68, 68, 0.2);
```

## Settings Expansion

### Base Settings (Universal)
- Account Management
- Team Members & Permissions
- Security & Authentication
- Notifications & Alerts
- Billing & Subscription
- API Access

### Kitchen/KDS-Specific Settings

#### 1. Station Configuration
- **Station Setup**
  - Grill station configuration
  - Cold station (salads, appetizers)
  - Hot line (sautés, entrees)
  - Fry station
  - Pastry/dessert station
  - Expo/pass station
  - Dishwasher station
- **Station Routing Rules**
  - Automatic item-to-station assignment
  - Multi-station items (split routing)
  - Modifier-based routing (no onion = skip garnish station)
  - Priority rules (expedite tickets jump queue)
- **Display Customization**
  - Station-specific screen layouts
  - Color coding by course (appetizer, entree, dessert)
  - Course firing timing rules
  - Allergy alert highlighting

#### 2. Ticket Management
- **Ticket Display Options**
  - Grid view vs list view toggle
  - Sort by time vs sort by table vs sort by course
  - Timer visibility settings (always show, show on warning, hide)
  - Auto-bump rules (automatically complete when all items checked)
- **Timer Thresholds**
  - Warning threshold (e.g., 12 minutes turns yellow)
  - Critical threshold (e.g., 18 minutes turns red, flashes)
  - Goal time by daypart (lunch vs dinner expectations)
  - Pause timer rules (waiting on customer, 86'd item)
- **Ticket Actions**
  - Bump confirmation requirements
  - Void reason tracking
  - Modify workflow (chef approval needed?)
  - Recall ticket from expo

#### 3. Menu & Recipe Management
- **Menu Item Setup**
  - Recipe creation with ingredients list
  - Ingredient quantities and units
  - Preparation instructions
  - Plating guidelines with photos
  - Allergen information
- **Recipe Costing**
  - Ingredient cost entry (auto-update from purchases)
  - Portion cost calculation
  - Suggested selling price (based on target food cost %)
  - Actual vs theoretical cost comparison
- **Menu Engineering**
  - Stars (high profit, high popularity)
  - Plowhorses (low profit, high popularity)
  - Puzzles (high profit, low popularity)
  - Dogs (low profit, low popularity)

#### 4. Inventory Integration
- **Par Levels**
  - Minimum stock levels per ingredient
  - Maximum storage capacity
  - Reorder point calculations
  - 86 threshold triggers
- **Auto-86 Rules**
  - Automatic menu item hiding when ingredient below threshold
  - Partial 86 (limited quantity remaining)
  - Substitution suggestions
  - Manager override capability
- **Purchase Order Integration**
  - Expected delivery dates
  - Restock time estimates
  - Supplier lead times
  - First-in-first-out (FIFO) tracking

#### 5. Waste Management
- **Waste Categories**
  - Spoilage (expired, went bad)
  - Preparation errors (overcooked, dropped)
  - Customer returns (wrong order, quality issue)
  - Comped items (customer dissatisfaction)
  - Staff meals
  - Trimming/waste (natural loss)
- **Waste Logging**
  - Quick-select waste items
  - Reason dropdown
  - Dollar amount auto-calculation
  - Photo capture for quality issues
  - Anonymous vs attributed logging
- **Waste Analytics**
  - Waste by item Pareto chart
  - Waste by reason breakdown
  - Waste by shift/daypart analysis
  - Waste cost trends over time

#### 6. Staff Performance
- **Chef Profiles**
  - Station certifications
  - Skill level ratings (junior, line cook, senior, sous, head)
  - Cross-training tracking
  - Performance history
- **Metrics Tracking**
  - Items produced per shift
  - Average ticket time
  - Quality scores (from expeditor ratings)
  - Refire/error rate
  - Specialization tags
- **Gamification**
  - Employee of week/month
  - Speed records
  - Quality leaderboards
  - Perfect shift badges (zero errors)
  - Cross-training milestones

#### 7. Shift Management
- **Shift Handover Protocol**
  - Required handover fields
  - Checklist completion enforcement
  - Photo documentation option
  - Manager sign-off requirement
- **Prep List Generation**
  - Auto-generate from pars and current inventory
  - Chef adjustment capability
  - Priority ranking (must-do vs nice-to-have)
  - Progress tracking throughout shift
- **Communication Tools**
  - Shift notes (important info for next shift)
  - Equipment issues log
  - VIP reservation alerts
  *   *   - 86 board updates
  *   *   - Low inventory reminders

#### 8. Hardware Integration
- **Display Hardware**
  - Touchscreen calibration
  - Multi-monitor setup (one per station)
  - Kitchen TV/display mode
  - Brightness adjustment for kitchen lighting
- **Input Devices**
  - Barcode scanner integration (for waste logging)
  - RFID tag readers (for tray tracking)
  - Foot pedal input (hands-free operation)
  - Voice command integration ("86 salmon!")
- **Alert Systems**
  - Sound alerts (new ticket, ticket expiring, order up)
  - Light strip integration (color changes for urgency)
  - Pager/buzzer systems (for runners)
  - SMS alerts for critical issues

## API Endpoint Mappings

### Existing APIs (Can be reused)
```
GET    /api/orders                        - List orders
POST   /api/orders                        - Create order
GET    /api/orders/:id                    - Get order details
PUT    /api/orders/:id                    - Update order
GET    /api/menu-items                    - List menu items
GET    /api/inventory                     - List inventory
PUT    /api/inventory/:id                 - Update inventory
GET    /api/staff                         - List staff
GET    /api/analytics/overview            - Dashboard analytics
```

### New APIs Required for Kitchen/KDS Industry

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| **Ticket Management APIs** |
| GET | `/api/kds/tickets` | Get all active KDS tickets | P0 |
| GET | `/api/kds/tickets/:id` | Get ticket details with items | P0 |
| PUT | `/api/kds/tickets/:id/status` | Update ticket status (firing, cooking, ready) | P0 |
| PUT | `/api/kds/tickets/:id/items/:itemId/status` | Mark individual item complete | P0 |
| POST | `/api/kds/tickets/:id/bump` | Bump ticket (send to expo) | P0 |
| POST | `/api/kds/tickets/:id/recall` | Recall ticket from expo | P1 |
| POST | `/api/kds/tickets/:id/void` | Void ticket with reason | P0 |
| PUT | `/api/kds/tickets/:id/pause-timer` | Pause ticket timer | P1 |
| GET | `/api/kds/tickets/by-station` | Get tickets grouped by station | P0 |
| GET | `/api/kds/timers/stats` | Get ticket timer analytics | P0 |
| **Station Management APIs** |
| GET | `/api/kds/stations` | List all kitchen stations | P0 |
| POST | `/api/kds/stations` | Create new station | P0 |
| PUT | `/api/kds/stations/:id` | Update station configuration | P0 |
| DELETE | `/api/kds/stations/:id` | Deactivate station | P1 |
| GET | `/api/kds/stations/:id/workload` | Get station workload metrics | P0 |
| PUT | `/api/kds/stations/:id/routing-rules` | Configure item routing | P0 |
| GET | `/api/kds/stations/balance` | Get workload balance across stations | P1 |
| **86 Board APIs** |
| GET | `/api/kds/86/list` | Get current 86 board | P0 |
| POST | `/api/kds/86/items` | Add item to 86 board | P0 |
| PUT | `/api/kds/86/items/:id` | Update 86 item (quantity, ETA) | P0 |
| DELETE | `/api/kds/86/items/:id` | Remove item from 86 (restocked) | P0 |
| GET | `/api/kds/86/menu-impact` | Get menu items affected by 86'd ingredients | P0 |
| POST | `/api/kds/86/auto-86` | Trigger automatic 86 based on inventory | P1 |
| **Recipe & Costing APIs** |
| GET | `/api/recipes` | List all recipes | P0 |
| POST | `/api/recipes` | Create new recipe | P0 |
| GET | `/api/recipes/:id` | Get recipe with ingredients | P0 |
| PUT | `/api/recipes/:id` | Update recipe | P0 |
| DELETE | `/api/recipes/:id` | Archive recipe | P1 |
| GET | `/api/recipes/:id/costing` | Get recipe cost breakdown | P0 |
| PUT | `/api/recipes/:id/pricing` | Update suggested pricing | P1 |
| GET | `/api/recipes/profitability` | Get menu engineering matrix | P0 |
| **Waste Tracking APIs** |
| POST | `/api/kds/waste/log` | Log waste incident | P0 |
| GET | `/api/kds/waste/report` | Get waste analytics report | P0 |
| GET | `/api/kds/waste/by-category` | Get waste by category | P0 |
| GET | `/api/kds/waste/by-item` | Get waste by menu item | P0 |
| GET | `/api/kds/waste/by-reason` | Get waste by reason | P0 |
| GET | `/api/kds/waste/trends` | Get waste trends over time | P1 |
| POST | `/api/kds/waste/targets` | Set waste reduction goals | P1 |
| **Performance Analytics APIs** |
| GET | `/api/kds/performance/ticket-times` | Get ticket time analytics | P0 |
| GET | `/api/kds/performance/accuracy` | Get order accuracy rate | P0 |
| GET | `/api/kds/performance/refires` | Get refire tracking data | P0 |
| GET | `/api/kds/performance/food-cost` | Get actual food cost percentage | P0 |
| GET | `/api/kds/performance/station-throughput` | Get throughput by station | P0 |
| **Staff Performance APIs** |
| GET | `/api/kds/staff/:id/performance` | Get chef performance metrics | P0 |
| GET | `/api/kds/staff/leaderboard` | Get performance leaderboard | P1 |
| PUT | `/api/kds/staff/:id/skills` | Update chef skills/certifications | P0 |
| POST | `/api/kds/staff/:id/rating` | Submit quality rating for chef | P0 |
| GET | `/api/kds/staff/employee-of-week` | Get top performer | P1 |
| **Shift Management APIs** |
| POST | `/api/kds/shift/handover` | Create shift handover notes | P0 |
| GET | `/api/kds/shift/handover` | Get recent handover notes | P0 |
| POST | `/api/kds/shift/prep-list` | Generate prep list | P0 |
| GET | `/api/kds/shift/prep-list` | Get current prep list | P0 |
| PUT | `/api/kds/shift/prep-list/:id/complete` | Mark prep item complete | P0 |
| POST | `/api/kds/shift/equipment-issue` | Log equipment problem | P0 |
| GET | `/api/kds/shift/equipment-issues` | Get open equipment issues | P0 |
| **Hardware Integration APIs** |
| POST | `/api/kds/alerts/sound` | Trigger sound alert | P0 |
| POST | `/api/kds/alerts/light` | Control light strip colors | P1 |
| POST | `/api/kds/printers/receipt` | Send to kitchen printer | P0 |
| GET | `/api/kds/devices/status` | Get connected device status | P1 |
| POST | `/api/kds/voice/command` | Process voice command | P1 |

**Total New APIs for Kitchen/KDS: 15 endpoints**

---

**Implementation Notes:**
- Optimize for touch interfaces with large buttons and minimal precision required
- Implement real-time WebSocket updates for instant ticket synchronization
- Support offline mode with local storage and sync on reconnect
- Integrate sound alerts with customizable audio files per event type
- Build timer system with visual and auditory warnings
- Create automatic routing rules engine based on menu item configuration
- Implement recipe costing with live ingredient cost updates
- Build waste tracking with quick-select interface for speed
- Support multi-language for diverse kitchen staff
- Create shift handover workflow with mandatory checklist completion
- Integrate with inventory system for auto-86 functionality
- Build performance analytics dashboard with gamification elements
