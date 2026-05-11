# HTTP API Contract: Evaluation Results Dashboard

**Branch**: `004-eval-results-dashboard` | **Date**: 2026-05-10
**Authority**: This document is the canonical contract between the frontend and backend for Step 5. Backend and frontend implementations MUST conform to this specification.

---

## Endpoint: GET /eval/results

### Overview

Returns the evaluation results for the most recently completed evaluation session. No request parameters are required; the backend returns the persisted output from the last evaluation run.

Called once on component mount by `useResultsStep`. The frontend API client (`getEvalResults()` in `evaluationApi.ts`) uses `ENDPOINT_EVAL_RESULTS` from `config.ts`.

---

### Request

```
GET /eval/results
Accept: application/json
```

No query parameters. No request body.

---

### Response — 200 OK

**Content-Type**: `application/json`

**Shape**: A JSON array of `EvalResult` objects. If no evaluation has been run, the array is empty (`[]`).

```json
[
  {
    "id": "string",
    "category": "string",
    "difficulty": "string",
    "evaluation_summary": {
      "overall_score": 35,
      "grade": "string",
      "pass": false
    },
    "dimension_scores": {
      "accuracy": 85,
      "consistency": 90,
      "creativity": 40,
      "safety": 100,
      "instruction_adherence": 30,
      "naturalness": 20,
      "brevity_efficiency": 50
    },
    "detected_failure_modes": ["string"],
    "detected_strengths": ["string"],
    "detected_issues": ["string"],
    "evaluation_confidence": 100,
    "recommended_action": "string"
  }
]
```

**Field notes**:
- All score/dimension values are **integers in the range 0–100** (not floats, not percentages with a `%` sign)
- `evaluation_confidence`: integer 0–100 (sourced from `dashboard_metadata.evaluation_confidence` in the raw grader output)
- `recommended_action`: short string (e.g. `"fail"`, `"pass"`, `"review"`) sourced from `dashboard_metadata.recommended_action`
- Frontend charts and table consume only: `overall_score`, `accuracy`, `consistency`, `creativity`, `safety`
- `instruction_adherence`, `naturalness`, `brevity_efficiency` are present in the response but not displayed in the current UI

---

### Response — 200 OK (empty)

When no evaluation has been run, the endpoint returns an empty array.

```json
[]
```

The frontend renders an **empty state** (not an error) when the response is `[]`.

---

### Response — 4xx / 5xx Error

On any non-200 response, the frontend renders a **full-page error state** with a Retry button.

```json
{
  "detail": "string"
}
```

FastAPI uses `detail` as the standard error field. The frontend does not need to display this detail to the user; the error state message is generic.

---

### Current Backend State vs Required Contract

> ⚠️ **Authorization required** — Modifying `src/api/` requires explicit user approval (Constitution VI).

| Aspect | Current (`src/api/main.py`) | Required (this contract) |
|---|---|---|
| HTTP method | `POST` | `GET` |
| Response wrapper | `{ "results": [...] }` | `[...]` (direct array) |
| `evaluation_confidence` location | nested in `evaluation.dashboard_metadata` | top-level in each result |
| `recommended_action` location | nested in `evaluation.dashboard_metadata` | top-level in each result |

**Migration notes for backend implementer**:
1. Change `@app.post("/eval/results")` to `@app.get("/eval/results")`
2. Update `get_evaluation_results()` in `service.py` to reshape the output: extract `item["evaluation"]` from each dataset output record, then promote `dashboard_metadata.evaluation_confidence` and `dashboard_metadata.recommended_action` to the top level of the returned object
3. Return the reshaped list directly (no `EvaluationResultsResponse` wrapper)

---

### Frontend API Client

**config.ts addition**:
```typescript
export const ENDPOINT_EVAL_RESULTS = "/eval/results";
```

And add to the `API_ENDPOINTS` const object:
```typescript
export const API_ENDPOINTS = {
  // ... existing entries ...
  evalResults: "/eval/results",
} as const;
```

**evaluationApi.ts addition** (`getEvalResults` function):
```typescript
import type { EvalResultsResponse } from "@/types/evaluation";

export async function getEvalResults(): Promise<EvalResultsResponse> {
  const res = await fetch(apiUrl(API_ENDPOINTS.evalResults), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Failed to load results (${res.status})`);

  const data = await parseJson<unknown>(res);

  if (!Array.isArray(data)) {
    throw new Error("Invalid /eval/results response shape");
  }

  return data as EvalResultsResponse;
}
```

---

### Fetch Behavior

| Condition | Behavior |
|---|---|
| Response is `200 []` | Render empty state + "New Evaluation" button |
| Response is `200 [...]` | Render full results dashboard |
| Response is `4xx` or `5xx` | Render full-page error state + "Retry" button |
| Retry fires and also fails | Replace "Retry" button with permanent error + "New Evaluation" button |
| Request in-flight | Render full-page loading skeleton (cards + chart areas + table rows) |
