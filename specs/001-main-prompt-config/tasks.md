# Tasks: Main Prompt Configuration (Step 1)

**Input**: Design documents from `/specs/001-main-prompt-config/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`  
**Tests**: Not requested for this feature (omit test tasks)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)  
- **[Story]**: Which user story this task belongs to (US1, US2, US3)  
- Each task includes an exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the production-ready Next.js frontend skeleton under `src/app/` (npm, TypeScript, linting)

- [x] T001 Create Next.js app skeleton under `src/app/` (npm + TypeScript) with App Router enabled
- [x] T002 Add `.env.local` handling and document placeholder `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` in `src/app/README.md`
- [x] T003 [P] Configure linting/formatting for the frontend project in `src/app/` (ESLint + formatting baseline)
- [x] T004 Create the repo-standard frontend folder structure under `src/app/src/` (`app/`, `components/`, `features/`, `lib/`, `styles/`, `types/`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, API client, and wizard-wide state container (blocks all Step 1 UI work)

**⚠️ CRITICAL**: No user story UI tasks should start until this phase is complete.

- [x] T005 Define shared evaluation types in `src/app/src/types/evaluation.ts` (TargetModel, Step1State, refine request/response)
- [x] T006 Define API base URL + endpoint path constants in `src/app/src/lib/api/config.ts`
- [x] T007 Implement typed API functions in `src/app/src/lib/api/evaluationApi.ts` for:
  - `GET /llm?type=target`
  - `POST /refine` with `{ type: "main", prompt, target_model }`
- [x] T008 Implement wizard-wide state container in `src/app/src/features/evaluation/store/evaluationWizardStore.ts` (read/write Step 1 state for later steps)
- [x] T009 Create Stepper component skeleton in `src/app/src/components/ui/StepStepper.tsx` (5 steps, active step prop, steps 2–5 non-clickable)
- [x] T010 Create reusable ModelCard component skeleton in `src/app/src/components/ui/ModelCard.tsx` (single-select visuals + typed props)
- [x] T011 Create Step 1 hook skeleton in `src/app/src/features/evaluation/hooks/useMainPrompt.ts` (state wiring, API calls, loading/error state model)
- [x] T012 Create Step 1 view skeleton in `src/app/src/features/evaluation/steps/MainPromptStep.tsx` (renders header, stepper, card container)

**Checkpoint**: Foundation ready — Step 1 can now be implemented end-to-end.

---

## Phase 3: User Story 1 - Configure and proceed to Step 2 (Priority: P1) 🎯 MVP

**Goal**: User can load Step 1, see models, enter main prompt, select model, and click Next to proceed with state preserved.

**Independent Test**: With `/llm?type=target` returning models, Step 1 shows the grid, pre-selects the first model, enables Next only when prompt is non-empty, and on Next writes Step 1 state and navigates to Step 2 route.

- [x] T013 [US1] Implement initial model load on mount in `src/app/src/features/evaluation/hooks/useMainPrompt.ts` (calls `getTargetModels`, stores models, pre-select first)
- [x] T014 [US1] Implement prompt text state + “non-empty” gating in `src/app/src/features/evaluation/hooks/useMainPrompt.ts`
- [x] T015 [US1] Implement Next action: persist `{ mainPrompt, targetModelId, targetModel }` to store in `src/app/src/features/evaluation/store/evaluationWizardStore.ts`
- [x] T016 [US1] Implement navigation to Step 2 from `src/app/src/features/evaluation/steps/MainPromptStep.tsx` (route placeholder OK)
- [x] T017 [US1] Render the header + stepper + single content card layout in `src/app/src/features/evaluation/steps/MainPromptStep.tsx` (copy matches spec)
- [x] T018 [US1] Render the model selection grid (3-column layout baseline) in `src/app/src/features/evaluation/steps/MainPromptStep.tsx` using `ModelCard`
- [x] T019 [US1] Wire model selection (single selection; highlighted border) via `ModelCard` in `src/app/src/features/evaluation/steps/MainPromptStep.tsx`
- [x] T020 [US1] Implement “Next: Dataset Generation →” button disabled logic in `src/app/src/features/evaluation/steps/MainPromptStep.tsx`

---

## Phase 4: User Story 2 - Refine the main prompt (Priority: P2)

**Goal**: User can click Refine to call `/refine` and replace the textarea with `refined_prompt`, with loading/error behavior.

**Independent Test**: With a selected model and non-empty prompt, clicking Refine calls `/refine` with `type=main`, shows loading, makes textarea read-only, and replaces prompt on success.

- [x] T021 [US2] Implement refine API call in `src/app/src/features/evaluation/hooks/useMainPrompt.ts` using `refineMainPrompt`
- [x] T022 [US2] Implement refine in-flight state (spinner on Refine; textarea read-only) in `src/app/src/features/evaluation/steps/MainPromptStep.tsx`
- [x] T023 [US2] Implement refine success behavior (replace textarea content with `refined_prompt`) in `src/app/src/features/evaluation/hooks/useMainPrompt.ts`
- [x] T024 [US2] Implement inline refine error message below textarea in `src/app/src/features/evaluation/steps/MainPromptStep.tsx` (preserve prompt text)
- [x] T025 [US2] Implement “Refine” button placement inside the textarea border (top-right) in `src/app/src/features/evaluation/steps/MainPromptStep.tsx`

---

## Phase 5: User Story 3 - `/llm` failure blocks the step (Priority: P3)

**Goal**: If `/llm` fails or returns 0 models, block the entire Step 1 UI and show full-card error with retry.

**Independent Test**: When `/llm` fails, user sees a full-card error state with Retry; textarea/Refine/Next are not interactive until retry succeeds.

- [x] T026 [US3] Implement `/llm` loading skeleton state in `src/app/src/features/evaluation/steps/MainPromptStep.tsx` (model grid skeleton cards)
- [x] T027 [US3] Implement `/llm` error/empty detection in `src/app/src/features/evaluation/hooks/useMainPrompt.ts`
- [x] T028 [US3] Implement full-card blocked error UI with Retry in `src/app/src/features/evaluation/steps/MainPromptStep.tsx`
- [x] T029 [US3] Ensure blocked state disables textarea + Refine + Next in `src/app/src/features/evaluation/steps/MainPromptStep.tsx`
- [x] T030 [US3] Implement Retry action to re-trigger model fetch in `src/app/src/features/evaluation/hooks/useMainPrompt.ts`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Requirements/quality polish that affects multiple stories

- [x] T031 [P] Add responsive breakpoint requirements into the Step 1 implementation (grid columns + stepper behavior) in `src/app/src/features/evaluation/steps/MainPromptStep.tsx`
- [x] T032 [P] Ensure all API URLs are sourced from `src/app/src/lib/api/config.ts` (no hardcoded URLs) across `src/app/src/features/evaluation/**`
- [x] T033 Update Step 1 quickstart notes (if needed) in `specs/001-main-prompt-config/quickstart.md` to match any final routing decisions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: start immediately
- **Foundational (Phase 2)**: depends on Setup; blocks all stories
- **US1–US3**: depend on Foundational; can be executed in priority order (recommended) or parallel after foundations
- **Polish**: after desired user stories are complete

### User Story Dependencies

- **US1 (P1)**: depends on Phase 2; baseline MVP
- **US2 (P2)**: depends on US1 wiring (models + prompt state) but can be implemented immediately after Phase 2 if hook/view skeletons exist
- **US3 (P3)**: depends on model fetch behavior (Phase 2) and can be developed alongside US1 UI wiring

### Parallel Opportunities

- Tasks marked **[P]** can run in parallel (different files/no dependencies).

---

## Implementation Strategy

### MVP First (US1)

Complete Phase 1 → Phase 2 → US1 and validate the Step 1 happy path end-to-end.

### Incremental Delivery

Add US2 (Refine), then US3 (blocked error states), then polish responsiveness/config consistency.

