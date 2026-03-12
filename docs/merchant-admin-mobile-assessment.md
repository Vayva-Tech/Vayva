# Merchant-Admin Mobile App Assessment

## Executive Summary

The merchant-admin dashboard is a **Next.js 16 application with 287+ pages** featuring complex data visualization, real-time analytics, and industry-specific workflows. Three viable paths exist for mobile deployment, ranging from immediate (PWA) to strategic (hybrid native).

**Current State:**
- ✅ PWA already configured (`@ducanh2912/next-pwa`)
- ✅ Standalone API layer accessible via `@vayva/api-client`
- ✅ Shared workspace packages (schemas, theme, API client)
- ⚠️ Existing Expo app is placeholder only ("Vayva Marketplace" customer app)
- ⚠️ React version mismatch (merchant-admin uses React 19, Expo uses React 18)

---

## Option Comparison

| Approach | Time to Market | Development Cost | UX Quality | Maintenance | Recommendation |
|----------|---------------|------------------|------------|-------------|----------------|
| **1. PWA Enhancement** | 1-2 weeks | Low | Good | Minimal | **Immediate** |
| **2. Expo WebView Wrapper** | 2-3 weeks | Low | Moderate | Low | **Short-term** |
| **3. Hybrid Native** | 2-3 months | Medium | Excellent | Medium | **Strategic** |
| **4. Full Native Rewrite** | 6-12 months | High | Excellent | High | Not recommended |

---

## Detailed Assessment

### Architecture Analysis

**Merchant-Admin Complexity:**
- 287+ dashboard pages across 19 industries
- Heavy use of Radix UI primitives (40+ components)
- Complex data viz (Recharts, ReactFlow, Framer Motion)
- File uploads, drag-and-drop, rich text editing
- Real-time features (notifications, live orders)

**API Architecture:**
- Clean REST API via Next.js API routes
- Shared `apiJson()` client in `@vayva/api-client`
- Standardized error handling and auth
- WebSocket support for real-time features

**Shared Code Potential:**
- `@vayva/schemas` - Validation schemas (reusable)
- `@vayva/api-client` - API client (reusable with fetch adapter)
- `@vayva/theme` - Design tokens (reusable with RN adapter)
- `@vayva/ui` - React components (not directly reusable)

---

## Recommended Phased Plan

### Phase 1: PWA Deployment (Immediate - 1-2 weeks)

**Goal:** Make merchant-admin installable on mobile devices immediately.

**Actions:**
1. **Optimize PWA manifest** (`public/manifest.json`)
   - Add mobile-specific icons (192x192, 512x512)
   - Configure `display: standalone` for app-like experience
   - Set `orientation: portrait` for mobile

2. **Responsive audit**
   - Test critical flows on mobile (orders, products, analytics)
   - Fix sidebar overflow issues on small screens
   - Optimize tables for horizontal scroll or card view

3. **Mobile UX improvements**
   - Add touch-friendly button sizes (min 44px)
   - Enable pull-to-refresh for data lists
   - Add haptic feedback on key actions (via Vibration API)

4. **Push notifications**
   - Implement web push for order alerts
   - Background sync for offline actions

**Deliverable:** Merchants can "Add to Home Screen" and use dashboard on mobile web.

---

### Phase 2: Expo WebView Shell (Short-term - 2-3 weeks)

**Goal:** App store presence with minimal development effort.

**Actions:**
1. **Create WebView wrapper app**
   - New Expo app: `@vayva/merchant-mobile`
   - WebView pointing to `https://merchant.vayva.ng`
   - Inject native bridge for:
     - Push notifications (Expo Notifications)
     - Secure storage (expo-secure-store for auth tokens)
     - Camera/photos (for product uploads)
     - Share sheet (for order links)

2. **Native auth handling**
   - Biometric authentication (expo-local-authentication)
   - Secure token storage
   - Session management

3. **Deep linking**
   - Configure universal links (`https://merchant.vayva.ng/orders/:id`)
   - Handle push notification taps

4. **Offline indicator**
   - Show banner when connection lost
   - Queue actions for retry

**Code structure:**
```typescript
// apps/merchant-mobile/app/index.tsx
import { WebView } from 'react-native-webview';
import * as SecureStore from 'expo-secure-store';

export default function MerchantApp() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  useEffect(() => {
    SecureStore.getItemAsync('auth_token').then(setAuthToken);
  }, []);

  return (
    <WebView
      source={{ uri: 'https://merchant.vayva.ng' }}
      injectedJavaScript={`
        window.nativeAuthToken = "${authToken}";
        window.ReactNativeWebView = true;
      `}
      onMessage={(event) => {
        // Handle native bridge calls
        const { type, data } = JSON.parse(event.nativeEvent.data);
        if (type === 'BIOMETRIC_AUTH') {
          // Trigger native biometric
        }
      }}
    />
  );
}
```

**Deliverable:** Native apps on App Store and Play Store that wrap the web dashboard.

---

### Phase 3: Hybrid Native (Strategic - 2-3 months)

**Goal:** Native experience for high-frequency flows, web for complex features.

**Native Screens (React Native):**
1. **Dashboard Home**
   - Native charts (react-native-chart-kit)
   - Quick stats cards
   - Recent orders list

2. **Orders Flow**
   - Order list (native FlatList with search/filter)
   - Order detail (native UI)
   - Status updates (native action sheet)

3. **Products Flow**
   - Product grid (native masonry layout)
   - Quick edit (native form)
   - Photo upload (native camera/gallery)

4. **Notifications**
   - Native notification center
   - Push notification handling

5. **Profile/Settings**
   - Native account management
   - Biometric settings

**WebView Fallbacks:**
- Analytics (complex charts)
- Marketing campaigns
- Store designer
- Extensions marketplace
- Team permissions
- Industry-specific complex flows

**Architecture:**
```
apps/merchant-mobile/
├── app/
│   ├── (native)/           # Native screens
│   │   ├── dashboard.tsx
│   │   ├── orders/
│   │   ├── products/
│   │   └── notifications.tsx
│   ├── (web)/              # WebView wrapper for complex features
│   │   ├── analytics.tsx
│   │   ├── marketing.tsx
│   │   └── settings/
│   └── _layout.tsx
├── components/             # Shared native components
├── hooks/                  # API hooks using @vayva/api-client
└── lib/
    └── native-bridge.ts    # WebView <-> Native communication
```

**Shared Code Strategy:**
- Create `@vayva/api-client/react-native` adapter
- Share Zod schemas for validation
- Share business logic hooks (useOrders, useProducts)

**Deliverable:** Fast, native-feeling app for core workflows with full web fallback.

---

## Technical Considerations

### React Version Mismatch

**Issue:** Merchant-admin uses React 19, Expo uses React 18.

**Resolution:**
- Option A: Downgrade merchant-admin to React 18 (risky, may break features)
- Option B: Wait for Expo SDK 53 (React 19 support expected)
- Option C: Use WebView approach (no React version conflict)

**Recommendation:** Option C for immediate needs, Option B for hybrid native.

### Package Compatibility

| Package | Web | React Native | Notes |
|---------|-----|--------------|-------|
| `@vayva/ui` | ✅ | ❌ | Radix UI not RN-compatible |
| `@vayva/schemas` | ✅ | ✅ | Zod works everywhere |
| `@vayva/api-client` | ✅ | ✅ | Needs fetch adapter |
| `@vayva/theme` | ✅ | ⚠️ | Needs RN style adapter |
| `@phosphor-icons/react` | ✅ | ✅ | Use `phosphor-react-native` |
| `recharts` | ✅ | ❌ | Use `react-native-chart-kit` |

### API Client Adaptation

```typescript
// packages/api-client/src/native.ts
import { apiJson as webApiJson } from './shared';

export const apiJson = <T>(input: string, init?: RequestInit) => {
  // Add native-specific headers
  const nativeInit = {
    ...init,
    headers: {
      ...init?.headers,
      'X-App-Version': Constants.nativeAppVersion,
      'X-Platform': Platform.OS,
    },
  };
  return webApiJson<T>(input, nativeInit);
};
```

---

## Implementation Roadmap

### Week 1-2: PWA Enhancement
- [ ] Audit mobile responsiveness
- [ ] Optimize manifest and icons
- [ ] Add web push notifications
- [ ] Test on iOS Safari and Android Chrome

### Week 3-5: Expo WebView Shell
- [ ] Create new `apps/merchant-mobile`
- [ ] Implement WebView with auth bridge
- [ ] Add push notification support
- [ ] Configure deep linking
- [ ] Submit to App Store/Play Store

### Month 2-3: Hybrid Native (Optional)
- [ ] Implement native dashboard home
- [ ] Build native orders flow
- [ ] Build native products flow
- [ ] Add native notifications center
- [ ] Create WebView fallback system
- [ ] Performance optimization

---

## Cost/Benefit Analysis

### PWA Only
- **Cost:** $2-5k (1-2 weeks dev time)
- **Benefit:** Immediate mobile access, no app store friction
- **Best for:** Quick win, testing mobile demand

### Expo WebView
- **Cost:** $5-10k (2-3 weeks)
- **Benefit:** App store presence, push notifications, native auth
- **Best for:** Marketing/brand presence, moderate mobile usage

### Hybrid Native
- **Cost:** $25-40k (2-3 months)
- **Benefit:** Premium UX, offline support, high performance
- **Best for:** High mobile engagement, competitive advantage

---

## Recommendation

**Start with Phase 1 (PWA) immediately** - it's already configured and provides value today.

**Proceed to Phase 2 (Expo WebView)** if:
- App store presence is a marketing requirement
- Push notifications are critical for merchant engagement
- Budget allows for $5-10k additional investment

**Consider Phase 3 (Hybrid Native)** if:
- Mobile usage exceeds 40% of total traffic
- Merchants demand offline functionality
- Competitive pressure requires premium mobile experience

---

## Next Steps

1. **Immediate:** Deploy PWA optimizations (can be done this week)
2. **Decision point:** Evaluate mobile web usage after PWA launch
3. **If proceeding:** Create Expo WebView app in new workspace package
4. **Long-term:** Plan hybrid native architecture based on usage data

**Risk Mitigation:**
- PWA requires zero backend changes
- WebView approach maintains single codebase for complex features
- Gradual migration path preserves investment
