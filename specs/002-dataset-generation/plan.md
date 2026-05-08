# Implementation Plan: Dataset Generation (Step 2)

**Branch**: `002-dataset-generation` | **Date**: 2026-04-27 | **Spec**: `specs/002-dataset-generation/spec.md`  
**Input**: Feature specification from `specs/002-dataset-generation/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement Wizard **Step 2 — Dataset Generation** in the Next.js UI: load dataset models, let the user author/refine a dataset-generation prompt, choose model, set test case count (default 100), and submit dataset generation (`POST /generate/create`) while persisting Step 2 state in the shared wizard store and navigating to Step 3.

## Technical Context

**Language/Version**: Frontend: TypeScript (Next.js App Router). Backend: Python (FastAPI).  
**Primary Dependencies**: Next.js + React + Tailwind; FastAPI.  
**Storage**: Browser `localStorage` (wizard state persistence).  
**Testing**: NEEDS CLARIFICATION (no test harness specified for UI or API).  
**Target Platform**: Local dev: Windows + npm. Runtime: web app (browser) + API server (FastAPI).  
**Project Type**: Monorepo web app (Next.js frontend + FastAPI backend).  
**Performance Goals**: Step 2 model grid visible within 3 seconds on local dev (see SC-001).  
**Constraints**: Contracts-first; no provider SDK usage in UI; implement loading/error states for every API call; no `any`.  
**Scale/Scope**: Wizard step 2 UI + store extension + typed API client additions.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Contracts-first API**: All UI integration via typed API client (`src/lib/api/*`). No hardcoded URLs in hooks/components.  
- **Provider portability**: No direct provider SDK calls in the UI.  
- **Phased vertical slice**: Step 2 is a self-contained slice; step state persists and is readable by later steps.  
- **Production hygiene**: Secrets not committed; errors handled; no `any`; lint passes.

**Gate evaluation (pre-Phase 0)**: PASS (no intended violations).

## Project Structure

### Documentation (this feature)

```text
specs/002-dataset-generation/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
```text
src/
├── api/                         # FastAPI backend (existing)
└── app/                         # Next.js frontend (existing)
    └── src/
        ├── app/
        │   ├── page.tsx         # Step 1 route
        │   └── dataset/
        │       └── page.tsx     # Step 2 route
        ├── components/
        │   └── ui/
        │       ├── ModelCard.tsx
        │       ├── NewEvalButton.tsx
        │       └── StepStepper.tsx
        ├── features/
        │   └── evaluation/
        │       ├── hooks/
        │       │   ├── useDatasetStep.ts
        │       │   └── useMainPrompt.ts
        │       ├── steps/
        │       │   ├── DatasetStep.tsx
        │       │   └── MainPromptStep.tsx
        │       └── store/
        │           └── evaluationWizardStore.ts
        ├── lib/
        │   └── api/
        │       ├── config.ts
        │       └── evaluationApi.ts
        └── types/
            └── evaluation.ts
```

**Structure Decision**: Continue the existing monorepo layout (`src/api` + `src/app`). Implement Step 2 as a feature module under `src/app/src/features/evaluation/` with a page route under `src/app/src/app/dataset/page.tsx` that renders the Step component.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

## Phase 0 — Outline & Research

### Unknowns / NEEDS CLARIFICATION

- **Testing strategy**: whether we will add unit tests (and which framework) for Step 2 UI and API client.
- **`POST /generate/create` response schema**: confirmed to be immediate dataset body, but exact shape not finalized (treat as `unknown` in TS until confirmed).

### Research Output

This feature’s unknowns are constrained and do not require external research beyond documenting decisions.
See `research.md` for decisions and rationale.

## Phase 1 — Design & Contracts

### API contracts (frontend view)

- **GET `/llm?type=dataset`**: returns an array of `{ id, name, provider, description }`. Block UI on failure/empty; preselect the first item on success.
- **POST `/refine`**: request `{ type: "dataset", prompt, target_model }` → response `{ refined_prompt }`.
- **POST `/generate/create`**: request `{ dataset_prompt, dataset_model, count }` → response `unknown` (placeholder until confirmed). On success: persist Step 2 state and navigate to Step 3.

### State design

Extend existing wizard store (from Step 1) to include **Step 2 state**:
- `datasetPrompt: string`
- `datasetModelId: string`
- `datasetModel: LLMModel | null`
- `testCaseCount: number` (default 100)

Constraints:
- Step 2 MUST NOT mutate Step 1 state fields.
- All Step 2 state MUST persist in `localStorage` and be readable by Steps 3–5.

### UI design (Step 2)

Implement `DatasetStep` component that follows Step 1 patterns:
- Model list loads on mount (skeleton while loading)
- Full-card blocked error state with Retry on fetch error or empty list
- Textarea with Refine button; read-only while refine is in-flight
- Numeric input with inline validation error
- Generate Dataset button navigates to Step 3 immediately; Step 3 shows an indeterminate progress bar while generation is in-flight and shows a success message when the response returns

### Deliverables from Phase 1

- `data-model.md` (entities + validation rules)
- `contracts/http-api.md` updates/additions (Step 2 endpoints + config constants)
- `quickstart.md` (how to run and manually test Step 2)

## Phase 2 — Implementation Planning (handoff to /speckit-tasks)

After Phase 1 artifacts are generated, run `/speckit-tasks` to produce a dependency-ordered `tasks.md`.
