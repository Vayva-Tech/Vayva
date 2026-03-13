# 🧪 QA ENGINEER - COMPREHENSIVE TESTING & QUALITY ASSURANCE
**CRISIS MODE - FINAL SPRINT** | **DEADLINE: 24 HOURS** | **P0: BLOCKING REVENUE**

---

## 📋 YOUR MISSION

You are the **LAST LINE OF DEFENSE** before merchants use this platform. Your job is to break it, find every bug, and force fixes BEFORE the boss demos.

**YOUR JOB:** Test EVERY feature like a malicious user would. Find edge cases. Break things hard. Document everything.

---

## 🎯 YOUR 5 CRITICAL TESTING SPRINTS

### SPRINT 1: DASHBOARD FUNCTIONALITY ⏰ (4 HOURS)

#### Test Matrix:

| Browser | Desktop | Mobile | Tablet | Result |
|---------|---------|--------|--------|--------|
| Chrome | ☐ | ☐ | ☐ | |
| Firefox | ☐ | ☐ | ☐ | |
| Safari | ☐ | ☐ | ☐ | |
| Edge | ☐ | ☐ | ☐ | |

#### Critical User Journeys:

**Journey 1: Merchant Opens Dashboard**
```
1. Login with valid credentials
2. Navigate to /dashboard
3. Wait for load
4. Verify all metric cards show data
5. Click on each metric card
6. Verify click handlers work
7. Check mobile menu opens
8. Verify bottom nav works on mobile
9. Switch between tabs
10. Logout and relogin → session persists

EXPECTED: All steps work without errors
ACTUAL: Document every error found
```

**Journey 2: Settings Management**
```
1. Click settings gear icon in header
2. Panel slides in from right
3. Fill out ALL fields in Business tab:
   - Business name (max characters)
   - Industry (dropdown selection)
   - Timezone (dropdown)
   - Currency (dropdown)
4. Click Save
5. Verify success toast appears
6. Hard refresh browser (Cmd+Shift+R)
7. Open settings again
8. Verify all values persisted correctly
9. Change theme to Dark Mode
10. Verify entire UI switches to dark
11. Change layout from Grid to List
12. Verify dashboard layout changes immediately

EDGE CASES TO TEST:
- Empty required fields → validation error
- Super long business names (200+ chars) → truncation?
- Invalid timezone → fallback to default?
- Rapid save clicks → debounce working?
- No internet → offline error message?
```

**Journey 3: Template Application**
```
1. Navigate to template gallery
2. Scroll through all templates
3. Click "Preview" on first template
4. Verify preview opens in new window
5. Close preview
6. Click "Apply Template"
7. Confirmation dialog appears
8. Click "Cancel" → nothing happens
9. Click "Apply" again
10. Loading spinner shows
11. Success toast appears
12. Store URL reloads with new template
13. Verify new layout active
14. Try rollback → works?

BREAK IT:
- Apply template while editing settings
- Apply template with slow internet
- Apply template on mobile
- Apply same template twice
- Preview 10 templates rapidly
```

---

### SPRINT 2: API ENDPOINT TESTING ⏰ (4 HOURS)

#### Tool Setup:

```bash
# Install Postman or use curl
# Install autocannon for load testing
npm install -g autocannon

# Install k6 for advanced load testing
brew install k6  # macOS
```

#### API Test Suite:

**Test 1: Dashboard Aggregation API**
```bash
# Normal request
curl http://localhost:3000/api/dashboard/aggregate?range=month

# Expected: 200 OK, response time < 500ms

# Parallel requests (should be fast with caching)
autocannon -c 10 -d 10 http://localhost:3000/api/dashboard/aggregate

# Expected: 
# - Avg < 500ms
# - No 5xx errors
# - Cache hit rate > 80%

# Invalid range parameter
curl http://localhost:3000/api/dashboard/aggregate?range=invalid

# Expected: 400 Bad Request

# No authentication
curl http://localhost:3000/api/dashboard/aggregate

# Expected: 401 Unauthorized
```

**Test 2: API Keys CRUD**
```bash
# Create API key
curl -X POST http://localhost:3000/api/saas/api-keys \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Key",
    "scopes": ["read:orders"],
    "rateLimitPerMinute": 100
  }'

# Expected: 200 OK, returns secret key ONCE

# List all keys
curl http://localhost:3000/api/saas/api-keys \
  -H "Authorization: Bearer VALID_TOKEN"

# Expected: 200 OK, array of keys (without secrets)

# Rotate key
curl -X POST http://localhost:3000/api/saas/api-keys/KEY_ID/rotate \
  -H "Authorization: Bearer VALID_TOKEN" \
  -d '{"gracePeriodDays": 1}'

# Expected: 200 OK, returns NEW secret key

# Revoke key
curl -X DELETE http://localhost:3000/api/saas/api-keys/KEY_ID \
  -H "Authorization: Bearer VALID_TOKEN"

# Expected: 200 OK, key marked as revoked

# Use revoked key
curl http://localhost:3000/api/dashboard/aggregate \
  -H "Authorization: Bearer REVOKED_KEY"

# Expected: 401 Unauthorized
```

**Test 3: Rate Limiting**
```bash
# Rapid fire 150 requests (limit is 100/hour for free tier)
for i in {1..150}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    http://localhost:3000/api/dashboard/aggregate
done

# Expected:
# - First 100 requests: 200 OK
# - Requests 101-150: 429 Too Many Requests
# - Headers include X-RateLimit-Remaining

# Check rate limit headers
curl -i http://localhost:3000/api/dashboard/aggregate

# Expected headers:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 95
# X-RateLimit-Reset: 1642345678
```

---

### SPRINT 3: MOBILE RESPONSIVENESS ⏰ (3 HOURS)

#### Device Testing Matrix:

| Device | Screen Size | Test Status | Issues Found |
|--------|-------------|-------------|--------------|
| iPhone 14 | 390x844 | ☐ | |
| iPhone 14 Pro Max | 430x932 | ☐ | |
| iPad Mini | 768x1024 | ☐ | |
| iPad Pro 11" | 834x1194 | ☐ | |
| Samsung Galaxy S23 | 360x780 | ☐ | |
| Pixel 7 Pro | 412x892 | ☐ | |

#### Mobile Test Checklist:

**Layout Tests:**
```
☐ Metric cards stack properly on mobile (1 column)
☐ Metric cards grid on tablet (2 columns)
☐ Metric cards full row on desktop (4 columns)
☐ Navigation menu accessible on mobile
☐ Bottom tab bar visible on mobile
☐ Settings panel slides in correctly
☐ Modals/dialogs centered properly
☐ Tables scroll horizontally if needed
☐ Forms don't overflow viewport
☐ Buttons ≥ 44px touch target
☐ Text readable without zooming (≥ 14px)
☐ Images responsive, don't overflow
```

**Interaction Tests:**
```
☐ Tap all buttons → they respond
☐ Swipe gestures work (if implemented)
☐ Pull to refresh works
☐ Long press shows context menu
☐ Form inputs bring up correct keyboard
☐ Date pickers work on mobile
☐ Dropdown selects work
☐ Toggle switches easy to tap
☐ Modal can be dismissed by tapping outside
☐ Scrolling smooth, no jank
```

**Orientation Tests:**
```
☐ Portrait mode works
☐ Landscape mode works
☐ Rotation doesn't break layout
☐ Fullscreen video works
```

---

### SPRINT 4: EDGE CASES & ERROR HANDLING ⏰ (3 HOURS)

#### Network Conditions:

**Test with Chrome DevTools Network Throttling:**
```
1. Open DevTools → Network tab
2. Select "Fast 3G" throttling
3. Reload dashboard
4. Verify loading skeletons show
5. Verify timeout after 30s
6. Verify retry button works

Select "Offline":
1. Disconnect network
2. Try to save settings
3. Verify offline error message
4. Verify data queued for sync
5. Reconnect → auto-sync works
```

#### Data Validation:

**Form Input Edge Cases:**
```typescript
Business Name Field:
- Empty string → validation error
- Single character → allowed?
- 200 characters → truncation?
- Emojis only → allowed?
- HTML tags (<script>) → escaped?
- SQL injection ("'; DROP TABLE") → sanitized?
- XSS attempt (<img src=x onerror=alert(1)>) → blocked?

Currency Field:
- Negative numbers → rejected
- Decimal places (10.999) → rounded?
- Non-numeric → rejected
- Very large numbers → handled?

Date Fields:
- Future dates → allowed?
- Past dates → allowed?
- Invalid format → rejected
- Leap year dates → handled?
```

#### Permission Testing:

**Free Tier User:**
```
☐ Can access basic dashboard
☐ Cannot access Pro features (shows upgrade prompt)
☐ Cannot create API keys (or limited to 1)
☐ Cannot access advanced analytics
☐ Cannot customize dashboard layout
☐ Sees branding/watermark
```

**Pro Tier User:**
```
☐ Access to all dashboards
☐ Can create unlimited API keys
☐ Can customize layout
☐ Can access AI features
☐ No branding/watermark
☐ Priority support badge visible
```

**Enterprise User:**
```
☐ All Pro features
☗ Custom integrations available
☗ Dedicated support channel
☗ White-label option
☗ SLA monitoring
```

---

### SPRINT 5: PERFORMANCE & ACCESSIBILITY ⏰ (3 HOURS)

#### Performance Benchmarks:

**Lighthouse Scores (Chrome DevTools):**
```
Run Lighthouse audit on:
1. Dashboard page
2. Settings page
3. Template gallery

TARGET SCORES:
Performance: ≥ 90
Accessibility: ≥ 95
Best Practices: ≥ 95
SEO: ≥ 90

Document any scores below target.
```

**Core Web Vitals:**
```bash
# Using web-vitals CLI
npx web-vitals http://localhost:3000/dashboard

TARGETS:
LCP (Largest Contentful Paint): < 2.5s
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1

Test on:
- Fast connection (WiFi)
- Slow connection (Fast 3G)
- Mobile emulation
```

#### Accessibility Testing:

**Keyboard Navigation:**
```
☐ Tab through entire page
☐ All interactive elements focusable
☐ Focus indicator visible
☐ Skip to main content link works
☐ Escape closes modals
☐ Enter activates buttons
☐ Arrow keys navigate menus
☐ No keyboard traps
```

**Screen Reader Testing:**
```
Install NVDA (free) or use VoiceOver (macOS)

☐ Page has proper heading hierarchy (H1 → H2 → H3)
☐ All images have alt text
☐ Form inputs have labels
☐ Buttons have descriptive text
☐ Icons have aria-label
☐ Live regions announce dynamic updates
☐ Tables have proper headers
☐ Links describe destination
```

**Color Contrast:**
```
Use WebAIM Contrast Checker

Minimum ratios:
- Normal text: 4.5:1
- Large text: 3:1
- UI components: 3:1

Test:
☐ Primary buttons
☐ Text on colored backgrounds
☐ Form validation messages
☐ Error states
☐ Disabled states
```

---

## 📊 BUG REPORTING TEMPLATE

**USE THIS FORMAT FOR EVERY BUG:**

```markdown
## Bug Title: [Short description]

**Severity:** Critical / High / Medium / Low

**Environment:**
- OS: macOS 14.2
- Browser: Chrome 120.0.6099.109
- Screen: 1920x1080
- Plan Tier: Pro

**Steps to Reproduce:**
1. Login as merchant
2. Navigate to /dashboard
3. Click settings gear
4. Change business name to 300 characters
5. Click Save

**Expected Behavior:**
Save succeeds or shows validation error

**Actual Behavior:**
Page crashes with TypeError: Cannot read property 'length' of undefined

**Screenshots/Recordings:**
[Attach Loom video or screenshot]

**Console Errors:**
```
TypeError: Cannot read property 'length' of undefined
    at SettingsPanel.tsx:145
    at Array.map (<anonymous>)
```

**Workaround:**
Use shorter business name (< 200 chars)

**Priority:** P0 (Blocking launch)
```

---

## ✅ DELIVERABLES CHECKLIST

**MUST COMPLETE IN 24 HOURS:**

### Phase 1: Dashboard Testing (Hours 0-4)
- [ ] Test on 4 browsers × 3 devices = 12 combinations
- [ ] Complete 3 critical user journeys
- [ ] Document all bugs found
- [ ] Record Loom video of major issues

### Phase 2: API Testing (Hours 4-8)
- [ ] Load test dashboard API (autocannon)
- [ ] Test API key CRUD operations
- [ ] Verify rate limiting works
- [ ] Document response times

### Phase 3: Mobile Testing (Hours 8-11)
- [ ] Test on 6 different devices
- [ ] Complete layout checklist
- [ ] Complete interaction checklist
- [ ] Test portrait + landscape

### Phase 4: Edge Cases (Hours 11-14)
- [ ] Test offline mode
- [ ] Test form validation
- [ ] Test permission gating
- [ ] Test error handling

### Phase 5: Performance/A11y (Hours 14-17)
- [ ] Run Lighthouse audits
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Verify color contrast

---

## 📞 COMMUNICATION

**UPDATE EVERY 2 HOURS:**
1. Post bug list in Slack #qa-channel
2. Include severity ratings
3. Tag developers for critical bugs
4. Share Loom videos of blockers

**ESCALATION PATH:**
- Critical bugs → Tag @TechLead IMMEDIATELY
- High priority → Post in #dev-help
- Medium/Low → Add to GitHub Issues

---

## 🎯 SUCCESS CRITERIA

**YOU WIN WHEN:**

✅ Zero critical bugs in production

✅ Lighthouse scores meet targets

✅ All user journeys documented and tested

✅ Mobile responsive across all devices

✅ API responds in <500ms under load

✅ Keyboard navigation works perfectly

✅ Screen reader users can navigate entire app

---

**REMEMBER:** You're the gatekeeper. If you let bugs through, merchants will find them. And the boss will be FURIOUS. Be ruthless. 🔍

**GOOD LUCK, QA! BREAK IT NOW SO IT DOESN'T BREAK LATER.**
