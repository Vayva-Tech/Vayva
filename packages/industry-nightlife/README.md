# @vayva/industry-nightlife

Vayva Nightlife Industry Engine - Dashboard and services for nightlife, club, and lounge management.

## Features

- **Table Management**: Floor plan visualization, table status tracking, reservation management
- **VIP Guest List**: Guest categorization, check-in system, table assignments
- **Bottle Service**: Order management, inventory tracking, mixer configuration
- **Door Activity**: Entry statistics, demographics tracking, staff management
- **Promoter Performance**: Guest counts, commission tracking, revenue attribution
- **Security Log**: Incident reporting, resolution tracking, CCTV monitoring
- **AI Insights**: Peak time predictions, staffing recommendations, revenue forecasting (Pro tier)

## Installation

```bash
pnpm add @vayva/industry-nightlife
```

## Usage

```typescript
import { 
  getNightlifeDashboardConfig,
  NightlifeTableService,
  VIPGuestService,
  BottleService
} from '@vayva/industry-nightlife';

// Get dashboard configuration
const config = getNightlifeDashboardConfig();

// Use services
const tables = await NightlifeTableService.getAvailableTables(venueId, date);
const vipList = await VIPGuestService.getGuestList(eventId);
```

## API Reference

### Types
- `NightlifeTable` - Table definition with capacity, location, minimum spend
- `TableReservation` - Reservation details with guest info and bottle service
- `VIPGuest` - Guest information with category, table assignment, status
- `BottleOrder` - Bottle service order with items, mixers, delivery status
- `PromoterSale` - Promoter performance metrics and commissions
- `SecurityIncident` - Security log entry with resolution status
- `DoorEntry` - Door activity record with demographics

### Services
- `NightlifeTableService` - Table management and availability
- `VIPGuestService` - VIP list and check-in operations
- `BottleServiceService` - Bottle orders and inventory
- `PromoterService` - Promoter tracking and commissions
- `SecurityService` - Incident logging and reporting
- `DoorService` - Entry statistics and demographics
- `NightlifeAnalyticsService` - Dashboard metrics and insights

### Dashboard Configuration
- Widget definitions for KPIs, tables, VIP list, bottle service, door activity, security, promoters
- Layout presets for different screen sizes
- Real-time metric subscriptions
- Alert rules and quick actions

## License

MIT
