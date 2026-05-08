# Tasks: Dataset Generation (Step 2)

**Input**: Design documents from `specs/002-dataset-generation/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/http-api.md`, `quickstart.md`

**Tests**: Not requested in `spec.md` → no test tasks included (lint/typecheck remain required).

## Format

- **[P]**: Can run in parallel (different files, no dependencies)  
- **[US#]**: User story label (US1/US2/US3)  
- Every task includes an exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align on existing Step 1 patterns and prepare Step 2 constants/types.

- [x] T001 Review Step 1 patterns to mirror in Step 2 (`src/app/src/features/evaluation/hooks/useMainPrompt.ts`, `src/app/src/features/evaluation/steps/MainPromptStep.tsx`)
- [x] T002 Add Step 2 endpoint constant in `src/app/src/lib/api/config.ts` (`ENDPOINT_GENERATE_CREATE="/generate/create"`)
- [x] T003 Extend shared types in `src/app/src/types/evaluation.ts` with `DatasetStepState`, `GenerateCreateRequest`, `GenerateCreateResponse` (as `unknown`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared wizard state + typed API client building blocks required by all stories.

**⚠️ CRITICAL**: No user story work should be considered complete until these are in place.

- [x] T004 Extend wizard store to persist Step 2 state in `src/app/src/features/evaluation/store/evaluationWizardStore.ts` (add `step2` + `setStep2`, keep Step 1 untouched)
- [x] T005 [P] Extend typed API client in `src/app/src/lib/api/evaluationApi.ts` with Step 2 functions: dataset model list (`GET /llm?type=dataset`), refine (dataset), generate create
- [x] T006 Create the Step 2 logic hook `src/app/src/features/evaluation/hooks/useDatasetStep.ts` (local UI state hydrated from store + guarded sync back to store)
- [x] T007 Create the Step 2 view `src/app/src/features/evaluation/steps/DatasetStep.tsx` (layout + wiring to `useDatasetStep`)
- [x] T008 Replace the placeholder route with Step 2 view in `src/app/src/app/dataset/page.tsx` (render `DatasetStep`)
- [x] T009 Add "New Eval" action to Step 2 in `src/app/src/features/evaluation/steps/DatasetStep.tsx` using `src/app/src/components/ui/NewEvalButton.tsx` (confirm → `clear()` → navigate to `/`)

**Checkpoint**: Step 2 route renders the real component and compiles.

---

## Phase 3: User Story 1 — Generate a dataset and proceed to Step 3 (Priority: P1) 🎯 MVP

**Goal**: User can configure dataset prompt/model/count and start dataset generation, then navigate to Step 3 with state persisted.

**Independent Test**: Load `/dataset`, wait for models, enter a prompt, choose model, set valid count, click Generate Dataset, verify immediate navigation to Step 3 with a progress bar and a success message when the API returns.

- [x] T010 [US1] Implement dataset model fetch-on-mount in `src/app/src/features/evaluation/hooks/useDatasetStep.ts` using the typed API client (`GET /llm?type=dataset`) and preselect first model on success
- [x] T011 [US1] Implement `testCaseCount` state (default 100) + integer validation + inline error in `src/app/src/features/evaluation/steps/DatasetStep.tsx`
- [x] T012 [US1] Implement "Generate Dataset" enabled/disabled rules in `src/app/src/features/evaluation/hooks/useDatasetStep.ts` (trimmed prompt non-empty, valid selected model object, count is positive integer)
- [x] T013 [US1] On Generate click, persist Step 2 state via store (`src/app/src/features/evaluation/store/evaluationWizardStore.ts`) and navigate immediately to Step 3 route from `useDatasetStep.ts`
- [x] T014 [US1] Create Step 3 route in `src/app/src/app/generate/page.tsx` showing `StepStepper` activeStep={3} and a visible indeterminate progress bar
- [x] T015 [US1] In `src/app/src/app/generate/page.tsx`, start `POST /generate/create` on mount using Step 2 state from the store; show progress while in-flight; show success message when response returns
- [x] T016 [US1] In `src/app/src/app/generate/page.tsx`, handle generate failure by showing an error and a "Back to Step 2" action; keep Step 2 inputs preserved
- [x] T017 [US1] Add navigation + New Eval on Step 3 page in `src/app/src/app/generate/page.tsx` (use `NewEvalButton` and a Back to Step 2 button)

**Checkpoint**: US1 works end-to-end with real API calls and Step 2 state persisted.

---

## Phase 4: User Story 2 — Refine the dataset generation prompt (Priority: P2)

**Goal**: User can refine their dataset prompt.

**Independent Test**: With models loaded, enter a prompt and click Refine; verify textarea replaced on success and errors are inline without clearing content.

- [x] T018 [US2] Implement refine enable/disable and in-flight UI behavior in `src/app/src/features/evaluation/steps/DatasetStep.tsx` (disabled when prompt trimmed empty, textarea read-only while refining)
- [x] T019 [US2] Wire Refine action in `src/app/src/features/evaluation/hooks/useDatasetStep.ts` (spinner, replace prompt on success, inline error on failure preserving content)
- [x] T020 [US2] Ensure Step 2 state (prompt/model/count) survives refresh/back navigation via store hydration + guarded sync in `src/app/src/features/evaluation/hooks/useDatasetStep.ts`

**Checkpoint**: Refine works; errors never clear user input; state persistence confirmed.

---

## Phase 5: User Story 3 — Block the step when dataset models cannot be loaded (Priority: P3)

**Goal**: If dataset models can’t be loaded (error or empty), Step 2 blocks the entire UI and offers Retry; while loading, show skeletons and keep inputs non-interactable.

**Independent Test**: Force `GET /llm?type=dataset` to fail/return empty; verify blocked UI and Retry; restore backend and retry to recover.

- [x] T021 [US3] Add loading state UI to `src/app/src/features/evaluation/steps/DatasetStep.tsx` (skeleton model cards; disable textarea/buttons/inputs until models succeed)
- [x] T022 [US3] Add blocked full-card error state to `src/app/src/features/evaluation/steps/DatasetStep.tsx` when model fetch fails or returns empty, including Retry button
- [x] T023 [US3] Implement retry logic in `src/app/src/features/evaluation/hooks/useDatasetStep.ts` (re-run model fetch, clear prior model-load errors, reapply default preselection on success)
- [x] T024 [US3] Ensure blocked state truly disables all Step 2 interactions in `src/app/src/features/evaluation/steps/DatasetStep.tsx` (textarea, refine, model grid, count input, generate)

**Checkpoint**: Model-load failure/empty blocks the step and can recover with Retry.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, consistency, docs alignment.

- [x] T025 [P] Verify `StepStepper` renders correct 1–5 step states for Step 2 and Step 3 routes in `src/app/src/components/ui/StepStepper.tsx` (adjust visuals if needed)
- [x] T026 Ensure no hardcoded URLs exist in Step 2 code (all from `src/app/src/lib/api/config.ts`; all network calls via `src/app/src/lib/api/evaluationApi.ts`)
- [x] T027 Run and fix lint issues for frontend changes (`src/app/`): ensure `npm run lint` passes with no errors (update the touched files as needed)
- [x] T028 Update `specs/002-dataset-generation/contracts/http-api.md` if implementation reveals contract mismatches (only if needed)
- [x] T029 Validate and update `specs/002-dataset-generation/quickstart.md` if route paths differ (e.g., Step 3 route `/generate`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** → **Phase 2 (Foundational)** → User stories in order **US1 (P1)** → **US2 (P2)** → **US3 (P3)** → **Polish**

### User Story Dependencies

- **US1**: Depends on Foundational phase (store + API client + hook + route wiring)
- **US2**: Depends on Foundational phase and model-load success handling from US1
- **US3**: Depends on model fetch existing (US1) and completes the required loading/error/empty gates

---

## Parallel Example: US1

```bash
Task: "Implement POST /generate/create request in src/app/src/lib/api/evaluationApi.ts"
Task: "Create Step 3 placeholder route in src/app/src/app/generate/page.tsx"
```

---

## Implementation Strategy

### MVP First (US1 only)

Implement Setup → Foundational → US1 and stop to validate:

- `/dataset` loads models, validates inputs, generates successfully, navigates to Step 3
- Step 2 state persists and is readable in Step 3 placeholder

Then add US2 (refine) and US3 (blocked UI + skeletons) to satisfy full gates.

