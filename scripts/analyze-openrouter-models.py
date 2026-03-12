#!/usr/bin/env python3
import json
import subprocess
import sys

# Get models data from OpenRouter
result = subprocess.run(['curl', '-s', 'https://openrouter.ai/api/v1/models'], 
                       capture_output=True, text=True)
data = json.loads(result.stdout)

models = []
for model in data['data']:
    if 'pricing' in model and model['pricing'].get('prompt') and model['pricing'].get('completion'):
        try:
            prompt_price = float(model['pricing']['prompt'])
            completion_price = float(model['pricing']['completion'])
            # Filter for reasonable pricing range (cheap but not free tier)
            if 0.000001 < prompt_price < 0.0001:
                models.append({
                    'id': model['id'],
                    'name': model['name'],
                    'prompt_price': prompt_price,
                    'completion_price': completion_price,
                    'total_price': prompt_price + completion_price
                })
        except:
            continue

# Sort by total cost (prompt + completion)
models.sort(key=lambda x: x['total_price'])

print("=== CHEAPEST EFFECTIVE MODELS ON OPENROUTER ===\n")

print("TOP 15 COST-EFFECTIVE MODELS:")
print("-" * 60)
for i, model in enumerate(models[:15]):
    print(f"{i+1:2d}. {model['name']}")
    print(f"     ID: {model['id']}")
    print(f"     Cost: ${model['prompt_price']:.8f} + ${model['completion_price']:.8f} = ${model['total_price']:.8f} per token")
    print()

# Also show some popular models in reasonable price range
popular_models = [m for m in models if any(x in m['id'].lower() for x in ['llama', 'mistral', 'qwen', 'mixtral'])]
print("\nPOPULAR MODELS IN REASONABLE PRICE RANGE:")
print("-" * 60)
for model in popular_models[:10]:
    print(f"• {model['name']}")
    print(f"  ID: {model['id']}")
    print(f"  Cost: ${model['total_price']:.8f} per token")
    print()

# Calculate potential savings vs current setup
print("\n=== COST COMPARISON ===")
current_groq_cost = 0.00059 + 0.00079  # $0.59 + $0.79 per million tokens
print(f"Current Groq cost: ${current_groq_cost:.6f} per token")
print()

for model in models[:5]:
    savings_per_token = current_groq_cost - model['total_price']
    savings_percentage = (savings_per_token / current_groq_cost) * 100
    print(f"{model['name']}:")
    print(f"  Savings: ${savings_per_token:.8f} per token ({savings_percentage:.1f}%)")
    print(f"  For 1M tokens: Save ${savings_per_token * 1000000:.2f}")
    print()