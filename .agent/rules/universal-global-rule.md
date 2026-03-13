---
trigger: always_on
---

0) Prime Directive: Don’t Guess

Do not invent APIs, functions, imports, config keys, file paths, or CLI commands.

If unsure, search the repository first (existing usage, types, configs, docs) and mirror established patterns.

Prefer small, correct changes over broad refactors.

1) Respect the Repo’s Tooling (Source of Truth)

Before coding, locate and obey:

Lint config: eslint / biome / prettier / ruff / golangci / etc.

Type checking / compile config: tsconfig, pyproject, go.mod, Cargo.toml, etc.

Test setup: jest/vitest/pytest/go test/cargo test, etc.
Never “fight” the repo rules: fix code to satisfy them rather than weakening the rules.

2) Scope + Design Rules

Make the smallest change that solves the task and passes checks.

Don’t change public APIs unless the task explicitly requires it.

Avoid new dependencies unless explicitly requested; if needed, justify and keep minimal.

3) Type Safety & Static Analysis (All Languages)

Prefer explicit, narrow types over broad types.

Never introduce any (TypeScript) or equivalent “escape hatches” unless unavoidable; if unavoidable, isolate it and justify with a comment.

Ensure every symbol is defined/imported. No undefined variables.

Ensure return types are correct and explicit when the repo expects them.

TypeScript / JavaScript specifics

No require() in TypeScript when ESM imports are expected; use import/export.

Do not assume DOM globals exist in Node. If types like RequestInit, fetch, Headers are needed:

Prefer using the repo’s existing fetch solution/types.

If Node types are required, use correct type imports or correct tsconfig libs as established in repo.

React: never declare new components inside render; move them to module scope.

4) Error Handling & Logging

No empty catch blocks. Handle or log intentionally.

Follow repo logging conventions (logger over console.* if lint forbids console).

Never swallow errors silently unless explicitly intended and documented.

5) Clean Code Requirements

No unused variables (remove, or use _name only if repo allows).

Keep functions small; prefer readable names that match local style.

Add/adjust tests when behavior changes.

6) Verification is Mandatory (Definition of Done)

After modifications, run/ensure these pass (use repo’s scripts when available):

Lint

Typecheck / build

Unit tests (and targeted tests relevant to changes)

If you cannot run commands, you must still:

State what should be run (exact scripts from package.json/Makefile/etc.).

Self-review changes against lint/type rules and likely failure points.

7) Output Standard

When producing code changes:

Provide changes as patch-style edits or file-by-file blocks.

Include a short checklist: “lint/typecheck/tests” and what was changed to satisfy them.

Never claim “this will pass CI” unless verification steps are actually completed.

8) Hallucination Guardrails (Cross-Language)

Do not use libraries, functions, or flags unless they already exist in the repo or are explicitly requested.

Prefer copying patterns already present in the project over “generic best practice.”

When adding new code, search for the closest existing example and match it.

9) “Repo-first” Constraint Check (MANDATORY)

Before writing code, always do:

Find the repo’s build/lint/test entrypoints (Makefile, package.json scripts, pyproject, tox.ini, go.mod, cargo, gradle/maven, dotnet, etc.).

Find formatters/linters config (ESLint/Biome/Prettier, Ruff/Black, golangci-lint, Clippy/rustfmt, Checkstyle/Spotless, ktlint, SwiftLint, PHP-CS-Fixer, RuboCop…).

Mirror the existing style and patterns from the closest file in the same directory/package.

10) “No silent assumptions” contract

Never assume runtime (browser vs node vs edge), OS, shell, or framework version.

Never assume globals exist (e.g., fetch, RequestInit, window, process, Buffer, globalThis, document, NodeJS, etc.). Confirm via repo patterns/config.

Never invent config keys or magic flags.

11) “CI-safe change” contract

Every change must satisfy ALL:

No new lint errors

No new type/static-analysis errors

No empty catches

No debug prints (console/print/println) unless repo explicitly allows

No unused vars/imports

No broad type escapes unless isolated + justified

12) “Finish line” contract

You are not done unless you output:

The exact commands the repo expects to pass (taken from repo scripts/config)

A checklist mapping each changed file → which rule it satisfies

If commands cannot be executed, call that out and provide the expected command list anyway

Language Packs (append these; they’re short and punchy)
TypeScript / JavaScript (Node + React + tooling)

Never introduce any. Use unknown, generics, unions, or typed interfaces. If unavoidable, isolate with a comment + // eslint-disable-next-line ... only at the single line.

ESM vs CJS: If TS/ESLint forbids require, use import. Don’t mix module systems unless the repo already does.

No undefined globals: If you need RequestInit / fetch types, use the repo’s existing fetch client/types. Do not assume DOM libs in Node.

React: No component creation inside render; no hooks in loops/conditions; keep memoization stable.

Lint rules are law: if no-console exists, use the repo logger (search logger. usage).

Python

Don’t assume Python version. Match repo constraints (ruff config, mypy/pyright, typing level).

Prefer pathlib over os.path if repo uses it.

No broad except:; catch specific exceptions.

Avoid runtime-only type tricks; keep typing consistent with repo (dataclasses/pydantic attrs).

Go

Run through Go norms: gofmt formatting, go vet expectations.

Return errors explicitly; don’t swallow.

Don’t introduce global state unless repo patterns do.

Prefer context propagation (context.Context) if repo uses it.

Rust

Follow rustfmt and clippy patterns (no unwrap() in non-test code unless repo allows).

Prefer Result propagation (?) and explicit error types.

Don’t introduce unsafe unless absolutely necessary and documented.

Java / Kotlin

Match build tool (Maven vs Gradle) and style rules (Spotless/Checkstyle/ktlint).

Null-safety: avoid nullable traps; don’t sprinkle !! in Kotlin.

Prefer existing logging framework (SLF4J, etc.), no System.out.println unless allowed.

C# / .NET

Match analyzers/stylecop rules; don’t disable broadly.

Use ILogger rather than Console.WriteLine if repo uses it.

Respect nullable reference types and warnings-as-errors.

C / C++

No undefined behavior; don’t assume compiler flags.

Keep ownership rules clear (RAII in C++, explicit lifetime in C).

Avoid printf debugging if warnings-as-errors is set; match repo logging.

Swift

Match SwiftLint and formatting; avoid force unwraps unless repo allows.

Prefer Result/throws patterns consistently with codebase.

PHP

Match PHP version and CS fixer rules.

Avoid dynamic magic unless repo uses it; prefer strict typing where enabled.

Don’t introduce new dependencies casually.

Ruby

Match RuboCop rules; prefer explicitness over metaprogramming unless repo already does.

Don’t swallow exceptions; follow existing logging/error reporting patterns.

SQL / Migrations

Never generate migrations that assume a DB flavor unless repo indicates (Postgres/MySQL/SQLite).

Always include down/rollback patterns if repo requires them.

Validate constraints/indexes consistent with existing schema style.

Terraform / YAML / CI configs

Don’t invent provider/resource args; match provider version locks.

Keep CI configs minimal; avoid “quick fixes” like turning off lint/typecheck.

Validate indentation and schema strictly.

Bash / Shell

Assume set -euo pipefail if repo uses it; avoid bashisms if scripts are /bin/sh.

Quote variables; avoid parsing ls.  A) Export-Proof Rule (prevents “no exported member”)

Before importing a symbol (e.g. Store, OnboardingStepId):

Find its real export in the repo (search the barrel file and source module).

Import from the actual module that exports it, not a guessed barrel (@/types).

If it doesn’t exist, do not invent it: either (a) use the existing exported type, or (b) add a real export + update index files consistently.

Template the AI must follow:

“I searched for export type Store and found it in <path>; importing from <path>.”

B) JSON / Prisma JsonValue Narrowing Rule (prevents property access on JsonValue)

If a value is typed as JsonValue / unknown / string | number | boolean | object | array, you MUST:

narrow it with a type guard or schema validation before reading properties,

or parse it into a defined type.

Allowed patterns:

Type guard (isDomainStatus(x): x is DomainStatus)

Runtime schema (zod/yup/io-ts) only if repo already uses it

Explicit structural checks (typeof x === 'object' && x !== null && 'lastCheckedAt' in x)

Never do:

(value as any).lastCheckedAt

Blind casts like value as DomainStatus with no validation

C) “Never break JSX” Rule (prevents the cascade of '=>' expected, div not found)

When editing TSX:

Only edit inside the smallest possible region.

Never remove/shift braces or parentheses unless you re-check the whole component structure.

After edits, ensure:

Every { has a matching }

Every ( has a matching )

JSX tags are properly closed

Ternaries have ? and : parts complete

If there are parser errors, stop adding features and fix syntax first.

D) Unknown error handling rule (prevents 'err' is unknown)

If catch (err) is unknown (TS strict mode), you must narrow:

err instanceof Error

or typeof err === 'string'

otherwise use a safe fallback message.

No accessing err.message without narrowing.

E) Safe object spread rule (prevents “Spread types may only be created from object types”)

You may only spread when the value is confirmed object:

const obj = isPlainObject(x) ? x : {};

then { ...obj, extra: 1 }

Never spread values that could be primitives/arrays unless intended and typed.

Don’t swallow command failures.