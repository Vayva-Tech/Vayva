# Vayva Rescue Runbook

Vayva Rescue is an automated Tier-3 SRE helper designed to triage platform incidents when engineering is unavailable.

## Core Principles
1. **Read-Only by Default**: The system is designed to analyze and diagnose, not to execute fixes automatically.
2. **Auditable**: Every intake, analysis, and proposed action is logged to the `OpsAuditEvent` table.
3. **Guardrails**: PII and secrets (API keys, Bearer tokens, Card numbers) are automatically redacted before analysis.

## Usage
The system triggers automatically on critical failures if `OPS_RESCUE_ENABLE` is set to `true`.

### Diagnostic Flow
1. **Intake**: Incident data (Request ID, Route, Error Snippet) is captured.
2. **Audit**: A `SYSTEM_RESCUE_INTAKE` event is logged.
3. **Analysis**: The AI (Groq Llama-3) analyzes the logs and suggests remediation.
4. **Result**: A `SYSTEM_RESCUE_RESULT` event is logged with the diagnosis and escalation path.

## Escalation Path
If the automated diagnosis is insufficient or if a high-severity incident is detected:
- Follow the **Escalation Path** provided in the analysis.
- Notify `@engineering-on-call` on Slack.

## Manual Execution (Dev Only)
To trigger a manual diagnosis for a specific Request ID:
```bash
# Example script or CLI command (if implemented)
pnpm rescue diagnose <request_id>
```

## Safety Constraints
- AI is explicitly forbidden from suggesting direct DB mutations without a `[REQUIRES APPROVAL]` tag.
- All proposed write actions must be reviewed and executed by a Human Operator.
