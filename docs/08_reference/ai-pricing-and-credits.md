## AI pricing & credits (OpenRouter)

This document explains:
- **Provider/model pricing** in **USD** and **NGN** using **₦1,600 = $1**
- How to estimate **“cost per 1M tokens”** for common scenarios
- What **5,000 credits** roughly buys under these assumptions

### Model baseline (single model)
We standardize on **`google/gemini-2.5-flash`** for:
- **chat**
- **image understanding**
- **voice (audio input → transcription via `input_audio`)**
- **autopilot**

OpenRouter list pricing (as of March 2026):
- **Text input**: **$0.30 / 1M tokens**  → **₦480 / 1M tokens**
- **Text output**: **$2.50 / 1M tokens** → **₦4,000 / 1M tokens**
- **Audio tokens**: **$1.00 / 1M audio tokens** → **₦1,600 / 1M audio tokens**

Exchange rate assumption:
- **$1 = ₦1,600**

### Scenario costs (text-only)
Because pricing differs for input vs output, total cost depends on the **token mix**.

Below are **per 1M total tokens** estimates for common mixes (ignoring images/tools):

- **Mostly reading (90% input / 10% output)**
  - USD: \(0.9×0.30 + 0.1×2.50 = 0.52\) → **$0.52 / 1M tokens**
  - NGN: **₦832 / 1M tokens**

- **Chat typical (70% input / 30% output)**
  - USD: \(0.7×0.30 + 0.3×2.50 = 0.96\) → **$0.96 / 1M tokens**
  - NGN: **₦1,536 / 1M tokens**

- **Balanced (50% input / 50% output)**
  - USD: \(0.5×0.30 + 0.5×2.50 = 1.40\) → **$1.40 / 1M tokens**
  - NGN: **₦2,240 / 1M tokens**

- **Output-heavy (30% input / 70% output)**
  - USD: \(0.3×0.30 + 0.7×2.50 = 1.84\) → **$1.84 / 1M tokens**
  - NGN: **₦2,944 / 1M tokens**

### Voice (audio transcription) rough cost
For voice notes, the main variable is **audio tokenization** (plus some text tokens for instructions + transcript).

At **$1.00 / 1M audio tokens**:
- **$1.00** ≈ **₦1,600** per **1M audio tokens**

You can estimate monthly voice burn by tracking:
- average audio seconds per note
- average audio tokens per second (varies by provider/model)
- average transcript length (text output tokens)

### Credits model (what a “credit” means)
In code (`Backend/core-api/src/lib/ai/credit-service.ts`), credit pricing is defined as:
- **1 credit = ₦3 of AI usage value**
- Therefore **5,000 credits = ₦15,000 of AI usage value**

This is a *billing/allowance unit* (not the raw OpenRouter cost). The system targets margin by charging more credits than raw provider cost.

### What 5,000 credits buys (text-only estimate)
Using the ₦15,000 “usage value” definition and the **Gemini 2.5 Flash** NGN costs above:

- **Mostly reading (₦832 / 1M tokens)**:
  - \(₦15,000 / ₦832 ≈ 18.0\) → **~18.0M tokens**

- **Chat typical 70/30 (₦1,536 / 1M tokens)**:
  - \(₦15,000 / ₦1,536 ≈ 9.8\) → **~9.8M tokens**

- **Balanced 50/50 (₦2,240 / 1M tokens)**:
  - \(₦15,000 / ₦2,240 ≈ 6.7\) → **~6.7M tokens**

- **Output-heavy (₦2,944 / 1M tokens)**:
  - \(₦15,000 / ₦2,944 ≈ 5.1\) → **~5.1M tokens**

### Suggested sizing for Autopilot on 5,000 credits
Autopilot tends to be **input-heavy** (large context snapshots) but produces non-trivial output.
For budgeting, start with:
- **70/30**: **~9.8M tokens per 5,000 credits**

If Autopilot outputs are longer (e.g. detailed plans), use:
- **50/50**: **~6.7M tokens per 5,000 credits**

