# Vayva UI - Industry-Specific Design System 🎨

**Premium dashboard components for 22 industries**  
*Built with React, Tailwind CSS, and Vayva branding*

---

## 📦 What's Included

### Foundation Components (Shared)
- ✅ `VayvaCard` - Multi-variant card component (default, glass, bold, dark, natural)
- ✅ `VayvaButton` - Button with variants (primary, secondary, outline, ghost, danger)
- ✅ `VayvaThemeProvider` - Theme management with 5 design categories
- ✅ `useVayvaTheme` - Hook for theme access

### Fashion Industry Components ✨
- ✅ `FashionDashboardPage` - Complete fashion dashboard with glassmorphism
- ✅ `SizeCurveChart` - Size inventory analysis with stockout risk
- ✅ `VisualMerchandisingBoard` - Drag-and-drop product showcase
- ✅ `FashionKPICard` - Gradient KPI display cards
- ✅ `GradientOrbs` - Animated background elements

### Coming Soon
- 🚧 Restaurant (Bold Energy + Cyberpunk KDS)
- 🚧 Retail (Signature Clean)
- 🚧 Real Estate (Premium Glass)
- 🚧 Healthcare (Signature Clean)
- 🚧 Beauty (Premium Glass)
- ... and 17 more industries

---

## 🚀 Quick Start

### 1. Import the Design System

Add to your root layout or page:

```tsx
import { VayvaThemeProvider } from '@/components/vayva-ui';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <VayvaThemeProvider defaultCategory="signature" defaultPreset="default">
          {children}
        </VayvaThemeProvider>
      </body>
    </html>
  );
}
```

### 2. Use Fashion Dashboard

```tsx
import { FashionDashboardPage } from '@/components/vayva-ui';

export default function Page() {
  return <FashionDashboardPage />;
}
```

### 3. Use Individual Components

```tsx
import { 
  VayvaCard, 
  VayvaButton, 
  FashionKPICard,
  SizeCurveChart 
} from '@/components/vayva-ui';

export default function MyComponent() {
  return (
    <div className="p-6">
      <VayvaCard variant="glass">
        <FashionKPICard 
          title="Revenue" 
          value="$124,580" 
          change={12.5}
          gradient="from-indigo-500 via-purple-500 to-pink-500"
        />
      </VayvaCard>
      
      <SizeCurveChart data={sizeData} />
      
      <VayvaButton variant="primary">
        Export Report
      </VayvaButton>
    </div>
  );
}
```

---

## 🎨 Design Categories

### Signature Clean ⭐ (Default)
- White/light backgrounds
- Soft shadows
- Professional appearance
- **Best for:** Retail, Healthcare, B2B, Education

### Premium Glass
- Frosted glass effect
- Gradient backgrounds
- Luxury feel
- **Best for:** Fashion, Beauty, Real Estate, Creative

### Bold Energy
- High contrast
- Dynamic layouts
- Energetic vibe
- **Best for:** Restaurant FOH, Events, Nightlife

### Modern Dark
- Dark backgrounds
- Subtle glows
- Tech-forward
- **Best for:** Kitchen KDS, Automotive, SaaS

### Natural Warmth
- Earth tones
- Organic shapes
- Welcoming feel
- **Best for:** Grocery, Wellness, Nonprofit, Travel

---

## 🎯 Theme Presets (Per Industry)

### Fashion Presets (Glass Category)
1. **Rose Gold** - Pink → Peach gradient
2. **Ocean Breeze** - Blue → Teal gradient
3. **Forest Mist** - Green → Emerald gradient
4. **Midnight Luxe** - Purple → Indigo gradient
5. **Sunset Vibes** - Orange → Pink gradient

### Switch Themes Programmatically

```tsx
import { useVayvaTheme } from '@/components/vayva-ui';

function MyComponent() {
  const { themePreset, setThemePreset } = useVayvaTheme();
  
  return (
    <button onClick={() => setThemePreset('forest-mist')}>
      Switch to Forest Mist
    </button>
  );
}
```

---

## 📐 Component API Reference

### VayvaCard

```tsx
<VayvaCard
  variant="glass"      // 'default' | 'glass' | 'bold' | 'dark' | 'natural'
  size="md"            // 'sm' | 'md' | 'lg'
  hover={true}         // Enable hover lift effect
  className=""         // Custom classes
>
  {children}
</VayvaCard>
```

### VayvaButton

```tsx
<VayvaButton
  variant="primary"    // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size="md"            // 'sm' | 'md' | 'lg'
  isLoading={false}    // Loading state
  leftIcon={<Icon />}  // Left icon
  rightIcon={<Icon />} // Right icon
  fullWidth={false}    // Full width
  onClick={handleClick}
>
  Button Text
</VayvaButton>
```

### FashionKPICard

```tsx
<FashionKPICard
  title="Total Revenue"
  value="$124,580"
  change={12.5}           // Percentage change
  changeLabel="vs last period"
  icon={<DollarIcon />}
  gradient="from-indigo-500 via-purple-500 to-pink-500"
/>
```

### SizeCurveChart

```tsx
<SizeCurveChart
  data={[
    { size: 'M', inventory: 312, sales: 198, stockoutRisk: 'low' },
    { size: 'L', inventory: 189, sales: 134, stockoutRisk: 'medium' },
  ]}
  className="w-full"
/>
```

### VisualMerchandisingBoard

```tsx
<VisualMerchandisingBoard
  items={[
    {
      id: '1',
      name: 'Summer Dress',
      image: '/images/dress.jpg',
      category: 'Dresses',
      performance: 'trending',
      revenue: 12450,
      unitsSold: 234,
    },
  ]}
  onReorder={(newItems) => handleReorder(newItems)}
/>
```

---

## 🎭 Customization

### Update Brand Colors

Edit `/styles/vayva-design-system.css`:

```css
:root {
  /* Replace with YOUR actual brand color */
  --vayva-primary: #6366F1;        /* Currently placeholder indigo */
  --vayva-primary-light: #818CF8;
  --vayva-primary-dark: #4F46E5;
}
```

### Add Custom Theme Preset

```tsx
// In VayvaThemeProvider.tsx
const customPresets = {
  'my-custom-theme': {
    'gradient-primary': 'linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR 100%)',
    'background-base': '#YOUR_BG',
    'card-bg': 'rgba(255, 255, 255, 0.85)',
    // ... more variables
  },
};
```

---

## 📁 File Structure

```
/components/vayva-ui/
├── index.ts                          # Main exports
├── VayvaCard.tsx                     # Card component family
├── VayvaButton.tsx                   # Button components
├── VayvaThemeProvider.tsx            # Theme context & provider
├── vayva-design-system.css           # CSS variables & utilities
│
├── fashion/                          # Fashion industry components
│   ├── FashionDashboardPage.tsx      # Complete dashboard
│   ├── SizeCurveChart.tsx            # Size analysis widget
│   ├── VisualMerchandisingBoard.tsx  # Product showcase
│   ├── KPICards.tsx                  # KPI displays
│   └── index.ts                      # Fashion exports
│
├── restaurant/                       # Coming soon...
├── retail/
├── realestate/
└── ... (17 more industries)
```

---

## 🔧 Development

### Adding New Industry Components

1. Create folder: `/components/vayva-ui/{industry}/`
2. Build components following existing patterns
3. Export in industry `index.ts`
4. Add to main `index.ts` exports
5. Update this README

### Best Practices

- ✅ Use TypeScript for all components
- ✅ Support all 5 design variants where applicable
- ✅ Include hover states and transitions
- ✅ Make accessible (WCAG 2.1 AA)
- ✅ Test with all theme presets
- ✅ Document props with JSDoc comments

---

## 🎯 Roadmap

### Phase 1: Foundation ✅ (Weeks 1-2)
- [x] CSS variable system
- [x] Core components (Card, Button, Theme)
- [x] Fashion dashboard complete
- [x] 5 fashion theme presets

### Phase 2: Tier 1 Industries (Weeks 3-8)
- [ ] Restaurant dashboard (Bold + Dark KDS)
- [ ] Retail dashboard (Signature Clean)
- [ ] Real Estate dashboard (Premium Glass)
- [ ] Healthcare dashboard (Signature Clean)

### Phase 3: Tier 2 Industries (Weeks 9-16)
- [ ] Beauty, Events, Automotive, Travel
- [ ] Nonprofit, Education, Services
- [ ] Creative Portfolio, Grocery

### Phase 4: Remaining Industries (Weeks 17-24)
- [ ] 13 more industry dashboards
- [ ] Advanced widgets per industry
- [ ] Performance optimization
- [ ] Accessibility audit

---

## 📖 Documentation

For detailed design specifications:
- `/docs/VAYVA_DESIGN_BIBLE_PART1.md` - Design principles, first 3 industries
- `/docs/VAYVA_DESIGN_BIBLE_PART2.md` - Remaining 19 industries
- `/docs/INDUSTRY_DASHBOARD_DESIGN_STRATEGY.md` - Architecture & roadmap
- `/docs/DASHBOARD_DESIGN_MOOD_BOARD.md` - Visual inspiration

---

## 🤝 Contributing

1. Follow existing component patterns
2. Use TypeScript with proper types
3. Include Tailwind classes for styling
4. Test with multiple theme presets
5. Add JSDoc comments
6. Update this README

---

## 📄 License

Proprietary - Vayva Technologies © 2026

---

**Built with ❤️ by the Vayva Team**
