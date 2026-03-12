# UX Notes & Standards

## Responsiveness Strategies

- **Summary Panels**: On Desktop (>768px), use a sticky sidebar. On Mobile (<768px), use a fixed bottom drawer with a collapsed view (Total + CTA) that expands on tap.
- **Carousels**: Ensure tap targets are 44px+. Use CSS snap for horizontal scrolling.

## Accessibility (A11y)

- **Icon Buttons**: Must have `aria-label`.
- **Focus**: All interactive elements must have `focus-visible:ring`.
- **Contrast**: Text opacity should not fall below 60% (slate-500) on white backgrounds.

## State Handling

- **Empty States**: Do not just show text. Use an icon/illustration + helper text + action button (if applicable).
- **Loading**: Use skeletons that match the content shape, not generic spinners for page loads.

## Typography & Copy (Voice)

- **Locale TR**: Use informal "Sen" (You) voice.
  - Right: "Planını Seç", "Adresini Ekle"
  - Wrong: "Plan Seçiniz", "Adres Ekleme"
- **Button Case**: Sentence case ("Add to cart"), not All Caps.

## Performance

- **Images**: Always use `next/image`.
- **Lists**: Memoize callback functions passed to lists of items (e.g., `onSelectMeal`).
