# Research: Step 3 — View Data & Run Evaluation + Step 4 — Running

**Branch**: `003-view-data-run-eval` | **Date**: 2026-05-10

## Decision 1: `/llm` type parameter for evaluation models

**Decision**: Use `type=evaluation` (not `type=eval` or `type=evaluation_llms`).

**Rationale**: `src/api/service/service.py` line 46–47 maps the `type` query parameter
to the JSON key `evaluation_llms` using the conditional `elif type == "evaluation"`.
The user-provided spec stated `type=eval` and the clarification stated
`type=evaluation_llms` — neither matches the live backend. The frontend must use
`type=evaluation` to get a non-empty model list.

**Alternatives considered**: Using `type=eval` or `type=evaluation_llms` would trigger
a `ValueError` in service.py (`"Invalid type: ..."`) causing a 500 response.

---

## Decision 2: `POST /testcase/evaluate` request field name

**Decision**: Send `evaluate_model` (not `eval_model`).

**Rationale**: `src/api/main.py` line 41 defines the Pydantic model as
`evaluate_model: str`. FastAPI will reject a request body with `eval_model` with
a 422 Unprocessable Entity. The user spec said `eval_model` but the live backend
requires `evaluate_model`.

**Alternatives considered**: Modifying the backend field name was considered but
ruled out per **Constitution Principle VI** (no `src/api/` modifications without
explicit user authorization).

---

## Decision 3: Evaluate endpoint response handling

**Decision**: Parse the response body to detect success vs. error; do not rely on
HTTP status code.

**Rationale**: `src/api/main.py` lines 92–96 show the endpoint always returns HTTP 200:
- Success: `return "Evaluation completed successfully"` → FastAPI serializes as JSON
  string `"Evaluation completed successfully"`.
- Error: `return {"error": str(e)}` → JSON object `{"error": "..."}`.

Detection logic in the API client:
```
if (typeof parsedBody === "string") → success
if (parsedBody && typeof parsedBody === "object" && "error" in parsedBody) → error
```

**Alternatives considered**: Relying on `res.ok` would not distinguish success from
error because both return HTTP 200.

---

## Decision 4: Dataset persistence across navigation

**Decision**: The generated dataset is held in local component state within
`ViewDataStep` (not in the wizard store). Re-entering Step 3 from Step 2 will
re-trigger `POST /dataset/create`.

**Rationale**: The user spec explicitly lists only `evalModelId` and `evalModel` as
Step 3 state to persist. Adding the full dataset to sessionStorage adds payload size
risk and was not requested. The current `GenerateDatasetPage` already uses this
local-state pattern successfully.

**Alternatives considered**: Storing the dataset in the wizard store under `step3.dataset`
would prevent re-generation on back-navigation. This is a potential future enhancement
but is out of scope for this feature.

---

## Decision 5: Step 3 route — reuse `/viewdata`

**Decision**: Replace the content of `src/app/src/app/viewdata/page.tsx` to render
`<ViewDataStep />` instead of the current `<GenerateDatasetPage />`.

**Rationale**: The `/viewdata` route already exists and is the correct semantic
destination from Step 2 (`router.push("/viewdata")`). Creating a new route would
require updating Step 2's navigation and break the existing deep-link URL. Replacing
the component in the existing route is the least-disruptive approach.

**Alternatives considered**: Creating a `/step3` or `/evaluate-setup` route. Rejected
because DatasetStep already navigates to `/viewdata` and updating that navigation is
unnecessary churn.

---

## Decision 6: Step 4 progress simulation duration

**Decision**: 3-second linear animation from 0% to 100%, driven by `setInterval`
(~100 ms tick, +3.33% per tick).

**Rationale**: User plan specified "approximately 3 seconds". A 100ms interval gives
smooth updates (~30 frames over 3s) without excessive re-renders.

**Alternatives considered**: CSS-only transition was considered but would not allow
the numeric percentage label to update in sync.

---

## Decision 7: `ViewDataStep` — Card 1 generation state transitions

**Decision**: `ViewDataStep` absorbs the generation logic from `GenerateDatasetPage`
into a hook (`useViewDataStep`). Generation states: `idle → running → success | error`.
The `idle → running` transition fires automatically on mount.

**Rationale**: Keeps business logic out of the component and follows the established
hook pattern used in `useDatasetStep`.

---

## Decision 8: `RunningStep` — no API call, navigation to Step 5

**Decision**: `RunningStep` makes no API call. The evaluation was submitted in Step 3.
Step 4 is pure presentation. "View Results →" navigates to `/results`.

**Rationale**: The clarification session confirmed Step 4 is a simulated progress
screen. The backend `run_evaluation` is a long-running synchronous call — the Step 3
API call completes and returns a message before Step 4 is even rendered.

---

## Decision 9: ModelCard reuse — radio vs checkbox semantics

**Decision**: Reuse the existing `ModelCard` component for the eval model grid. Pass
`name="eval-model"` to scope the radio group. The existing component already renders
`<input type="radio">` so one-at-a-time selection is enforced natively.

**Rationale**: `ModelCard` in `src/app/src/components/ui/ModelCard.tsx` is already
designed for radio-style single selection. No changes to `ModelCard` are needed.

---

## Decision 10: Evaluation API error detection — API client responsibility

**Decision**: The `runEvaluation` function in `evaluationApi.ts` throws an `Error`
on both HTTP-level failures AND application-level error bodies. The hook/component
only needs a single `catch` path.

**Rationale**: Centralising error detection in the API client keeps hooks simple and
consistent with the existing `parseJson` + guard pattern used for other endpoints.
