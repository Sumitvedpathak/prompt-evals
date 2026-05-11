# HTTP API Contracts: Step 3 — View Data & Run Evaluation + Step 4 — Running

**Branch**: `003-view-data-run-eval` | **Date**: 2026-05-10

All endpoints are on the FastAPI backend (`src/api/`). The frontend accesses them
exclusively via `src/app/src/lib/api/evaluationApi.ts` using constants from
`src/app/src/lib/api/config.ts`. No hardcoded URLs in components or hooks.

---

## Config constants (`src/app/src/lib/api/config.ts`)

Add the following entry alongside existing constants:

```typescript
export const API_ENDPOINTS = {
  llms: "/llm",                             // existing
  refine: "/refine",                        // existing
  datasetCreate: "/dataset/create",         // existing
  testcaseEvaluate: "/testcase/evaluate",   // NEW
} as const;
```

---

## GET `/llm?type=evaluation` — Evaluation model list

### Request

| Field | Value |
|-------|-------|
| Method | `GET` |
| Path | `/llm` |
| Query param | `type=evaluation` |
| Headers | `Accept: application/json` |

### Response (success — HTTP 200)

Array of backend-shaped model objects:

```json
[
  {
    "name": "GPT-5",
    "model": "openai/gpt-5",
    "description": "Adversarial & Edge Cases"
  },
  {
    "name": "Claude 4.5 Sonnet",
    "model": "anthropic/claude-sonnet-4.5",
    "description": "Adversarial & Edge Cases"
  }
]
```

The frontend maps this to `LLMModel[]` using the existing `toProviderLabel` helper:
- `id` ← `model` field
- `name` ← `name` field
- `provider` ← derived from `model` prefix via `toProviderLabel`
- `description` ← `description` field

### Response (error)

- HTTP 4xx/5xx or empty body → `getEvalModels()` throws an `Error`.
- Empty array → treated as error: "No evaluation models available."

### Frontend function

```typescript
// src/app/src/lib/api/evaluationApi.ts
export async function getEvalModels(): Promise<LLMModel[]>
```

---

## POST `/testcase/evaluate` — Submit evaluation job

### Request

| Field | Value |
|-------|-------|
| Method | `POST` |
| Path | `/testcase/evaluate` |
| Headers | `Accept: application/json`, `Content-Type: application/json` |

**Body** (JSON):

```json
{
  "main_prompt": "<mainPrompt from Step 1 store>",
  "main_model": "<targetModelId from Step 1 store>",
  "evaluate_model": "<evalModelId selected in Step 3>"
}
```

> ⚠️ Field name is `evaluate_model` — matches the backend Pydantic model exactly.
> Do NOT use `eval_model`.

### Response (success — HTTP 200)

A bare JSON-serialised string:

```
"Evaluation completed successfully"
```

Detection: `typeof parsedBody === "string"`.

### Response (error — also HTTP 200)

```json
{
  "error": "<error message string>"
}
```

Detection: `parsedBody !== null && typeof parsedBody === "object" && "error" in parsedBody`.

> ⚠️ The backend returns HTTP 200 for both outcomes. The frontend MUST inspect the
> body to distinguish success from error. Do NOT rely on `res.ok`.

### Frontend function

```typescript
// src/app/src/lib/api/evaluationApi.ts
export async function runEvaluation(input: EvaluateRequest): Promise<string>
// Returns the success message string on success.
// Throws an Error with the error message on failure.
```

---

## Existing endpoints (unchanged, referenced for completeness)

### GET `/llm?type=target`
Used by Step 1. No changes.

### GET `/llm?type=dataset`
Used by Step 2. No changes.

### POST `/dataset/create`
Used by Step 3 (Card 1 generation, same as current). No changes.

### POST `/refine`
Used by Steps 1 and 2. No changes.

---

## Error handling summary

| Scenario | HTTP status | Detection | Frontend action |
|---|---|---|---|
| Network / fetch failure | N/A | `fetch()` throws | Show error message |
| `/llm?type=evaluation` 4xx/5xx | 4xx or 5xx | `!res.ok` | Block Card 2, show retry |
| `/llm?type=evaluation` empty array | 200 | `data.length === 0` | Block Card 2, show retry |
| `/testcase/evaluate` success | 200 | body is string | Navigate to Step 4 |
| `/testcase/evaluate` app error | 200 | body has `error` key | Inline error on Step 3 |
| `/testcase/evaluate` HTTP error | 4xx/5xx | `!res.ok` | Inline error on Step 3 |
