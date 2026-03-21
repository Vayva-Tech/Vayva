# Vayva Accessibility Quick Reference Card

**For:** Designers, Developers, Product Managers  
**Version:** 1.0 (March 2026)  
**Goal:** WCAG 2.1 AA Compliance

---

## 🎨 Color & Contrast

### Text Colors (Pass 4.5:1 Ratio)
```ts
// ✅ GOOD - Use these
text.primary: "#1d1d1f"    // AAA on white
text.secondary: "#52525B"   // AA on white
text.tertiary: "#71717A"    // AA on white

// ❌ AVOID - Fails contrast
text.secondary: "rgba(29, 29, 31, 0.6)" // Too light
```

### Chart Colors (Accessible Palette)
```ts
import { ACCESSIBLE_CHART_COLORS } from '@/lib/chart-styles';

// All pass 4.5:1 contrast on white backgrounds
primary: "#2563EB"    // Blue-600
secondary: "#DC2626"  // Red-600
tertiary: "#16A34A"   // Green-600
```

---

## 🖼️ Images & Icons

### Alt Text Guidelines
```tsx
// ✅ GOOD - Descriptive
<Image alt="Vayva - E-commerce Platform for Modern Businesses" />
<img alt="Glow Radiance Kit skincare collection with rose packaging" />

// ❌ BAD - Generic
<Image alt="Logo" />
<img alt="Product" />
```

### Icon Buttons
```tsx
// Decorative icon (hidden from SR)
<Icon name="Pencil" role="presentation" />

// Icon button needs aria-label
<Button size="icon" aria-label="Edit product">
  <Icon name="Pencil" role="presentation" />
</Button>

// Loading icon (auto-hidden)
<Button isLoading={loading}>
  Submit  {/* Icon gets role="presentation" automatically */}
</Button>
```

---

## ⌨️ Keyboard Navigation

### Focus Management
```tsx
// Import focus utilities
import { useFocusTrap, useArrowNavigation } from '@/lib/accessibility';

// Modal with trapped focus
function Modal({ isOpen }) {
  useFocusTrap(isActive);
  return <div>{/* modal content */}</div>;
}

// List with arrow navigation
function MenuList({ items }) {
  useArrowNavigation(itemCount, onSelect);
  return <ul>{/* list items */}</ul>;
}
```

### Skip Link
```tsx
import { SkipLink } from '@/lib/accessibility';

function App() {
  return (
    <>
      <SkipLink />
      <main id="main-content">
        {/* Page content */}
      </main>
    </>
  );
}
```

---

## 📝 Forms

### Error Association
```tsx
// ✅ GOOD - Error linked to input
<FormItem>
  <FormLabel>Email</FormLabel>
  <FormControl>
    <Input 
      id="email"
      aria-invalid={!!error}
      aria-describedby={error ? "email-error" : undefined}
    />
  </FormControl>
  <FormMessage id="email-error">
    {error}
  </FormMessage>
</FormItem>
```

### Autocomplete Attributes
```tsx
import { AUTOCOMPLETE_VALUES } from '@/lib/accessibility';

// Shipping form
<Input
  id="shipping-name"
  label="Full Name"
  autoComplete={AUTOCOMPLETE_VALUES.shipping.name}
/>

<Input
  id="shipping-address"
  label="Street Address"
  autoComplete={AUTOCOMPLETE_VALUES.shipping.address1}
/>

<Input
  id="shipping-city"
  label="City"
  autoComplete={AUTOCOMPLETE_VALUES.shipping.city}
/>
```

---

## 🔔 Dynamic Content

### Live Regions
```tsx
import { LiveRegion, StatusAnnouncement, LoadingAnnouncement } from '@/components/ui';

// Announce status changes
<StatusAnnouncement 
  status="success" 
  message="Changes saved successfully" 
/>

// Announce loading
<LoadingAnnouncement 
  isLoading={loading} 
  message="Processing your order" 
/>

// Custom live region
<LiveRegion politeness="polite">
  {notificationMessage}
</LiveRegion>
```

---

## 📱 Mobile & Touch

### Touch Targets (Minimum 44x44px)
```tsx
// ✅ GOOD - Meets 44x44px minimum
<Button size="default">Click Me</Button>  // h-11 = 44px
<Button size="icon" aria-label="Menu"/>  // w-11 h-11 = 44x44px

// ❌ BAD - Too small
<button className="h-8 w-8">X</button>  // 32x32px - fails!
```

### Gesture Alternatives
```tsx
import { 
  AccessibleCarousel, 
  AccessibleZoomableImage,
  AccessibleProductCard 
} from '@vayva/ui/components/gesture-alternatives';

// Always provide button alternatives to gestures
<AccessibleCarousel images={images} />
<AccessibleZoomableImage src={src} alt={alt} />
```

---

## 🎯 High Contrast Mode

### CSS Utilities
```css
/* Automatically applied in high contrast mode */
@media (prefers-contrast: more) {
  *:focus-visible {
    outline: 3px solid currentColor;
  }
}

/* Manual override when needed */
<div className="focus-ring-high-contrast">
  Content
</div>
```

### React Hook
```tsx
import { useHighContrastMode } from '@/lib/accessibility';

function MyComponent() {
  const isHighContrast = useHighContrastMode();
  
  return (
    <div className={isHighContrast ? 'high-contrast-mode' : ''}>
      {isHighContrast ? 'Enhanced contrast content' : 'Normal content'}
    </div>
  );
}
```

---

## ✅ Accessibility Checklist

### Before Every PR

#### Images & Media
- [ ] All images have descriptive alt text
- [ ] Decorative icons have `role="presentation"`
- [ ] Icon buttons have aria-labels

#### Color & Contrast
- [ ] Text passes 4.5:1 contrast ratio
- [ ] Charts use accessible color palette
- [ ] Error states use high-contrast colors

#### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] No keyboard traps exist

#### Forms
- [ ] Form fields have associated labels
- [ ] Error messages use aria-describedby
- [ ] Autocomplete attributes added where applicable

#### Dynamic Content
- [ ] Loading states announced to screen readers
- [ ] Status messages use live regions
- [ ] ARIA busy states set during loading

#### Mobile
- [ ] Touch targets are at least 44x44px
- [ ] Gesture alternatives provided
- [ ] Content works at 200% zoom

---

## 🚨 Common Mistakes

### ❌ DON'T Do This
```tsx
// Missing alt text
<img src="product.jpg" />

// Generic alt text
<img src="product.jpg" alt="Product" />

// Icon button without label
<Button size="icon">
  <Icon name="Pencil" />
</Button>

// Low contrast text
<p style={{ color: "#999" }}>Secondary text</p>

// Unannounced loading
<div>Loading...</div>  {/* Screen readers won't know */}
```

### ✅ DO This Instead
```tsx
// Descriptive alt text
<img src="product.jpg" alt="Wireless Bluetooth Headphones in Black" />

// Icon button with label
<Button size="icon" aria-label="Edit product">
  <Icon name="Pencil" role="presentation" />
</Button>

// High contrast text
<p className="text-gray-600">Secondary text</p>

// Announced loading
<LoadingAnnouncement isLoading={true} message="Loading products" />
```

---

## 🧪 Testing Tools

### Automated Testing
```bash
# axe-core accessibility testing
pnpm test:accessibility

# Lighthouse audit
pnpm lighthouse --only-categories=accessibility

# Storybook accessibility addon
pnpm storybook --addon-a11y
```

### Manual Testing
- **Keyboard:** Tab through all interactive elements
- **Screen Reader:** Test with NVDA, JAWS, or VoiceOver
- **High Contrast:** Enable OS high contrast mode
- **Zoom:** Test at 200% browser zoom
- **Mobile:** Test touch targets on actual devices

---

## 📚 Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Internal Resources
- Accessibility Team: accessibility@vayva.ng
- Phone: +234-810-769-2393
- Full Implementation Plan: `/ACCESSIBILITY_IMPLEMENTATION_SUMMARY.md`

---

## 🎯 Quick Wins

**5-Minute Fixes:**
1. Add aria-label to icon buttons
2. Update generic alt text to be descriptive
3. Add autocomplete to form fields
4. Include LoadingAnnouncement in loading states

**15-Minute Fixes:**
1. Audit and fix color contrast in a component
2. Add keyboard navigation to a custom dropdown
3. Implement focus trap in a modal
4. Add live region to a notification system

---

**Remember:** Accessibility is not a feature—it's a fundamental requirement for inclusive design. Every commit should maintain or improve accessibility.

**Questions?** Contact the Accessibility Team or refer to the full implementation summary.
