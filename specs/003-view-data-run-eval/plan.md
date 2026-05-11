# Implementation Plan: Step 3 — View Data & Run Evaluation + Step 4 — Running

**Branch**: `003-view-data-run-eval` | **Date**: 2026-05-10 | **Spec**: `specs/003-view-data-run-eval/spec.md`
**Input**: Feature specification from `specs/003-view-data-run-eval/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement wizard **Step 3 — View Data & Run Evaluation** and **Step 4 — Running** in the
Next.js UI. Step 3 shows the generated dataset, lets the user select an evaluation model
from `/llm?type=evaluation`, and submits the evaluation job (`POST /testcase/evaluate`).
Step 4 displays a 3-second simulated progress bar, then shows the API response (success
or error message) with three persistent bottom buttons; "View Results →" is enabled only
on success.

## Technical Context

**Language/Version**: Frontend: TypeScript 5 (Next.js App Router, React 18).
**Primary Dependencies**: Next.js + React + Tailwind CSS + Zustand/Context (existing store pattern).
**Storage**: Browser `sessionStorage` via existing wizard store (wizard step state).
**Testing**: No test harness requested for this feature.
**Target Platform**: Local dev: Windows + npm. Runtime: web browser + FastAPI backend.
**Project Type**: Monorepo web app (Next.js frontend + FastAPI backend).
**Performance Goals**: Eval model grid visible within 3 seconds on local dev (SC-002).
**Constraints**: Contracts-first; no provider SDK usage in UI; no `any`; lint must pass;
  dark theme only on Steps 3 and 4; backend API boundary must not be modified.
**Scale/Scope**: Steps 3 and 4 UI + store extension + typed API client additions.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Contracts-first API**: All UI integration via typed API client (`src/lib/api/*`).
  No hardcoded URLs in hooks/components. `/llm?type=evaluation` and
  `POST /testcase/evaluate` accessed only via `evaluationApi.ts`.
- **Provider portability**: No direct provider SDK calls in the UI.
- **Phased vertical slice**: Steps 3 and 4 are a self-contained slice; step state
  persists and is readable by later steps.
- **Production hygiene**: Secrets not committed; errors handled; no `any`; lint passes.
- **Backend API boundary**: `src/api/` is NOT modified. Frontend adapts to the existing
  backend contract (including the `evaluate_model` field name and the bare-string
  success response).

**Gate evaluation (pre-Phase 0)**: PASS — no intended violations.

**Gate re-evaluation (post-Phase 1 design)**: PASS — all contracts verified against
existing backend; no backend changes required.

## Project Structure

### Documentation (this feature)

```text
specs/003-view-data-run-eval/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── http-api.md      # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── api/                                      # FastAPI backend — NOT MODIFIED
└── app/
    └── src/
        ├── app/
        │   ├── viewdata/
        │   │   └── page.tsx                  # REPLACE: render ViewDataStep
        │   ├── running/
        │   │   └── page.tsx                  # NEW: Step 4 route
        │   └── results/
        │       └── page.tsx                  # NEW: Step 5 placeholder route
        ├── components/
        │   └── ui/
        │       ├── JsonViewer.tsx             # NEW: scrollable dataset viewer
        │       └── ProgressBar.tsx            # NEW: animated gradient progress bar
        ├── features/
        │   └── evaluation/
        │       ├── hooks/
        │       │   ├── useViewDataStep.ts     # NEW: Step 3 logic
        │       │   └── useRunningStep.ts      # NEW: Step 4 progress simulation
        │       ├── steps/
        │       │   ├── ViewDataStep.tsx       # NEW: Step 3 feature component
        │       │   └── RunningStep.tsx        # NEW: Step 4 feature component
        │       └── store/
        │           └── evaluationWizardStore.ts  # EXTEND: add step3, setStep3
        ├── lib/
        │   └── api/
        │       ├── config.ts                  # EXTEND: add testcaseEvaluate endpoint
        │       └── evaluationApi.ts           # EXTEND: add getEvalModels, runEvaluation
        └── types/
            └── evaluation.ts                  # EXTEND: ViewDataStepState, EvaluateRequest,
                                               #         EvaluateResponse
```

**Structure Decision**: Continue the existing monorepo layout (`src/api` + `src/app`).
Implement Steps 3 and 4 as feature modules under
`src/app/src/features/evaluation/` mirroring the Step 1 and Step 2 patterns. The
existing `/viewdata` route is repurposed to render the new `ViewDataStep` component.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations requiring justification.

## Phase 0 — Outline & Research

### Unknowns / NEEDS CLARIFICATION

All critical unknowns resolved via codebase research. See `research.md` for full
findings. Summary:

- **`/llm` type parameter**: Must be `type=evaluation` (backend service.py uses
  `"evaluation"` key). User spec said `type=eval` / `type=evaluation_llms` — both
  incorrect against the live backend.
- **`/testcase/evaluate` request field**: Backend expects `evaluate_model` (not
  `eval_model`).
- **Success response shape**: A bare JSON string `"Evaluation completed successfully"`
  returned at HTTP 200.
- **Error response shape**: `{"error": "..."}` dict returned at HTTP 200 (non-standard).
  The frontend cannot rely on `res.ok` for error detection — must inspect the body.
- **Dataset persistence**: The dataset is NOT in the wizard store. It is generated
  on `/viewdata` mount via `POST /dataset/create` (same as current) and held in local
  component state. `ViewDataStep` takes over from `GenerateDatasetPage`, keeping the
  same generation-on-mount pattern.

### Research Output

See `research.md` for decisions and rationale.

## Phase 1 — Design & Contracts

### API contracts (frontend view)

#### GET `/llm?type=evaluation`
- Called once on Step 3 mount.
- Query param: `type = "evaluation"` (matches backend service.py).
- Response: array of `{ name: string, model: string, description: string }` (backend
  shape) → mapped client-side to `LLMModel { id, name, provider, description }`.
- First item is NOT pre-selected; user must make an explicit selection.
- Failure: block Card 2 with retry; Card 1 remains functional.

#### POST `/testcase/evaluate`
- Called when user clicks "Run Evaluation".
- Request body: `{ main_prompt, main_model, evaluate_model }` (field name is
  `evaluate_model`, matching the backend `EvaluateRequest` Pydantic model).
- HTTP 200 always (success or error).
- Success response body: `"Evaluation completed successfully"` (JSON string).
- Error response body: `{ "error": "..." }` (JSON object).
- Detection: if parsed body is a string → success; if object with `error` key → error.
- On success: persist `evalModelId` + `evalModel` to store, navigate to Step 4.
- On error: show inline error on Step 3, re-enable Run Evaluation button, do NOT navigate.

### State design

Extend the existing wizard store to include **Step 3 state**:
- `evalModelId: string`
- `evalModel: LLMModel`

Add `setStep3(step3: ViewDataStepState)` and extend `clear()` to reset step3.

Step 3 MUST NOT mutate Step 1 or Step 2 state fields. Step 3 state MUST persist in
`sessionStorage` and be readable by Step 5 via shared store.

The generated dataset is held in local component state within `ViewDataStep` (not in the
store); re-entering Step 3 re-fetches via `POST /dataset/create`.

### UI design (Step 3)

`ViewDataStep` replaces the current `GenerateDatasetPage` logic. It retains the
generation-on-mount behavior but extends the page with:
- Card 1 (dataset viewer): same generation + display logic, adds JsonViewer component.
  Success state shows `JsonViewer` with Hide/Show toggle and Download JSON button.
- Card 2 (eval model selector): fetches eval models on mount independently of
  Card 1; checkbox-style 3-column grid; radio semantics; skeleton on loading;
  full-card error with retry on failure; Card 1 unaffected.
- Bottom navigation: `NewEvalButton` (left), `← Back to Step 2` (right), `Run
  Evaluation →` (right, disabled until model selected).

### UI design (Step 4)

`RunningStep` is a new page component with:
- Stepper (active Step 4).
- Single centred card: app icon, "Running Evaluation" heading, subtitle from store,
  `ProgressBar` component animating 0 → 100% over 3 seconds.
- On completion (100%): show API response message; enable "View Results →".
- Three persistent bottom buttons: `NewEvalButton`, `← Back to Step 3`,
  `View Results →` (disabled during in-flight and on error, enabled on success).
- No API call on Step 4 — progress is purely simulated.

### Deliverables from Phase 1

- `data-model.md` (entities + validation rules)
- `contracts/http-api.md` (Step 3 endpoints + config constants)
- `quickstart.md` (how to run and manually test Steps 3 and 4)

## Phase 2 — Implementation Planning (handoff to /speckit-tasks)

After Phase 1 artifacts are generated, run `/speckit-tasks` to produce a
dependency-ordered `tasks.md`.
