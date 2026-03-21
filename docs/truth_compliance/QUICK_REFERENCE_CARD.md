# Quick Reference Card - Re-gating Plan V2

## Plan Structure at a Glance

| Feature | FREE (Trial) | STARTER (₦25k) | PRO (₦40k) |
|---------|--------------|----------------|------------|
| **Duration** | 14 days | Monthly | Monthly |
| **Credits** | 0 | 5,000/month | 10,000/month |
| **Dashboard Metrics** | 4 basic | 6 standard | 10 advanced |
| **Financial Charts** | ❌ | ✅ | ✅ |
| **AI Assistant** | ❌ | ✅ | ✅ |
| **AI Autopilot** | ❌ | ❌ | ✅ |
| **Industry Dashboards** | ❌ | ❌ | ✅ (35+) |
| **Templates** | 1 (locked) | 1 + buy 1 more | 2 + buy unlimited |
| **Template Cost** | N/A | 5k credits | 5k credits |
| **Custom Domain** | ❌ | ❌ | ✅ |
| **Support** | Standard | Standard | Priority |

---

## Credit Costs

- 💬 **AI Message**: 1 credit
- 🎨 **Template Purchase**: 5,000 credits
- 🤖 **Autopilot Run**: 100 credits
- 📊 **Advanced Analytics**: PRO only (no credit cost)

---

## API Endpoints

### Credits
```bash
GET  /api/credits/balance     # Get current balance
POST /api/credits/use         # Deduct credits
GET  /api/trial/status        # Check trial status
POST /api/templates/purchase  # Buy template
```

### Example Response
```json
{
  "monthlyCredits": 5000,
  "usedCredits": 1250,
  "remainingCredits": 3750,
  "resetDate": "2026-04-15T00:00:00Z",
  "plan": "STARTER"
}
```

---

## Frontend Hooks

```typescript
// Check credit balance
const { data: balance } = useQuery({
  queryKey: ['credits', 'balance'],
  queryFn: () => fetch('/api/credits/balance')
});

// Check trial status
const { isActive, daysRemaining } = useTrialStatus();

// Purchase template
const { purchaseTemplate, isPurchasing } = useTemplatePurchase();
await purchaseTemplate('template_123');
```

---

## Access Control Pattern

```typescript
import { checkFeatureAccess } from '@/lib/billing/access';

const result = await checkFeatureAccess(storeId, 'ai_message');
if (!result.allowed) {
  toast.error(result.message);
  return;
}
```

---

## Trial Lifecycle

1. **Signup** → Trial auto-initialized (14 days)
2. **During Trial** → Full access, 100 WhatsApp messages
3. **Expiration** → Downgraded to basic dashboard
4. **Upgrade** → Transition to STARTER or PRO with credits

---

## Template Ownership Rules

### FREE Plan
- Can select 1 template initially
- Cannot change after selection
- No additional purchases

### STARTER Plan
- Gets 1 template included
- Can buy 1 additional (5k credits)
- Maximum: 2 templates total

### PRO Plan
- Gets 2 templates included
- Can buy unlimited additional (5k each)
- No maximum limit

---

## Common Error Messages

```
"Free plan includes 100 AI messages. Upgrade to Starter for 5,000/month."
"Template changes require Starter plan or higher."
"Maximum 2 templates on Starter plan. Upgrade to Pro for more."
"You need 5000 credits but have only 2300 remaining this month."
"AI Autopilot is available on Pro plan only."
"Insufficient credits. You have 450 credits remaining."
```

---

## Testing Checklist

- [ ] FREE signup creates trial with 0 credits
- [ ] FREE dashboard shows only 4 metrics
- [ ] FREE user blocked from analytics page
- [ ] STARTER upgrade allocates 5,000 credits
- [ ] AI message deducts 1 credit
- [ ] Template purchase deducts 5,000 credits
- [ ] PRO dashboard shows all 10 metrics
- [ ] Autopilot visible to PRO only
- [ ] Credit widget updates in real-time
- [ ] Trial expires after 14 days

---

## Design System Compliance

✅ White cards (`bg-white`)  
✅ Gray borders (`border-gray-100`)  
✅ Green primary (`bg-green-500`)  
✅ Red warnings (`bg-red-50`)  
✅ Rounded-xl corners  
✅ No backdrop-blur on content  

---

## Emergency Commands

```bash
# Reset user's credits manually
npx prisma creditAllocation.update({
  where: { storeId: 'xxx' },
  data: { usedCredits: 0 }
})

# Extend trial by 7 days
npx prisma store.update({
  where: { id: 'xxx' },
  data: { 
    trialEndDate: new Date(Date.now() + 7*24*60*60*1000)
  }
})

# Check user's plan and credits
npx prisma.store.findUnique({
  where: { id: 'xxx' },
  include: { creditAllocation: true }
})
```

---

**Questions?** See full documentation: `docs/truth_compliance/COMPLETE_REGATING_IMPLEMENTATION_SUMMARY.md`
