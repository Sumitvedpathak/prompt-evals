# Tasks: Evaluation Results Dashboard (Step 5)

**Input**: Design documents from `specs/004-eval-results-dashboard/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/http-api.md ✅ | quickstart.md ✅

**Tests**: Not explicitly requested — no test tasks included.

**Organization**: Tasks are grouped by user story. US1 (happy path) is the MVP scope.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)
- All frontend paths are relative to `src/app/src/`

---

## Phase 1: Setup

**Purpose**: Install the new dependency and wire in the new API endpoint constant.

- [x] T001 Install recharts via npm: run `npm install recharts` in `src/app/` and verify it appears in `package.json` under `dependencies`
- [x] T002 [P] Add `evalResults: "/eval/results"` to the `API_ENDPOINTS` const and export `ENDPOINT_EVAL_RESULTS = "/eval/results"` in `src/app/src/lib/api/config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, API client function, shared component extension, and print styles that ALL user story phases depend on.

**⚠️ CRITICAL**: No user story work can begin until T003 and T004 are complete. T005, T006, T007 can run in parallel with each other after Phase 1.

- [x] T003 Add `EvaluationSummary`, `DimensionScores`, `EvalResult`, and `EvalResultsResponse` TypeScript types to `src/app/src/types/evaluation.ts` as specified in `specs/004-eval-results-dashboard/data-model.md` Section 1 (no `any` types; all score fields are `number` integers 0–100)
- [x] T004 Add `getEvalResults(): Promise<EvalResultsResponse>` function to `src/app/src/lib/api/evaluationApi.ts` using `API_ENDPOINTS.evalResults` from config, following the existing `parseJson` + shape validation pattern; throw on non-200 or non-array response (see `contracts/http-api.md` for exact fetch behavior)
- [x] T005 [P] Extend `src/app/src/components/ui/StepStepper.tsx` with an optional `onStepClick?: (step: number) => void` prop: when provided, render completed steps (those with `stepNum < activeStep`) as `<button>` elements with `cursor-pointer` and hover styles; when absent, preserve existing display-only behavior (backward-compatible change)
- [x] T006 [P] Add `@media print` block to `src/app/src/app/globals.css` that: (1) hides elements with class `no-print` via `display: none !important`, (2) resets `body` background to white with no background-image, (3) prevents `recharts-responsive-container` elements from being cut across pages via `page-break-inside: avoid`
- [ ] T007 [P] ⚠️ **GATED — requires explicit user authorization before editing `src/api/`** (Constitution VI): Change `@app.post("/eval/results")` to `@app.get("/eval/results")` in `src/api/main.py`; update `get_evaluation_results()` in `src/api/service/service.py` to extract and reshape each `item["evaluation"]` sub-object from `dataset_output.json`, promoting `dashboard_metadata.evaluation_confidence` and `dashboard_metadata.recommended_action` to the top level, and return the reshaped list directly (no `{ results: ... }` wrapper). Full reshaping spec in `contracts/http-api.md`.

**Checkpoint**: Foundation ready — user story phases can begin. T007 is only required for end-to-end testing; component development can proceed against the contract shape without it.

---

## Phase 3: User Story 1 — View Evaluation Results (Priority: P1) 🎯 MVP

**Goal**: Automatically redirect from Step 4 to a fully populated Results Dashboard showing summary cards, an Overall Performance bar chart, a Multi-Dimensional Analysis radar chart, and a results table — all sourced from `GET /eval/results`.

**Independent Test**: Complete the wizard through Step 4, click "View Results", and verify all three summary cards, both charts, and the table populate correctly. Verify stepper shows Steps 1–4 complete and Step 5 active. Verify "Completed on YYYY-MM-DD" shows today's date.

### Implementation

- [x] T008 [P] [US1] Create `src/app/src/components/ui/SummaryCard.tsx` — accepts props `{ title: string; value: string; subtitle: string; accentColor: "gold" | "blue" | "purple"; icon: React.ReactNode }` and renders a styled stat card with the appropriate accent color scheme (gold: `amber-50`/`amber-500`; blue: `blue-50`/`blue-500`; purple: `purple-50`/`purple-500`); include the `no-print` class only on the outer wrapper if the card should be hidden in print (it should NOT — cards must appear in the PDF)
- [x] T009 [P] [US1] Create `src/app/src/components/ui/BarChart.tsx` — accepts `{ data: BarChartEntry[] }` where `BarChartEntry = { model: string; score: number; accuracy: number; consistency: number }`; renders a recharts `BarChart` inside `ResponsiveContainer` (width 100%, height 280) with: `CartesianGrid` (dashed), `XAxis` (dataKey "model"), `YAxis` (domain [0,100]), `Tooltip`, `Legend` (verticalAlign "bottom"), and three `Bar` components (Score: blue `#3b82f6`, Accuracy: green `#22c55e`, Consistency: orange `#f59e0b`); fully typed props, no `any`
- [x] T010 [P] [US1] Create `src/app/src/components/ui/RadarChart.tsx` — accepts `{ data: RadarChartEntry[] }` where `RadarChartEntry = { dimension: string; value: number }`; renders a recharts `RadarChart` inside `ResponsiveContainer` (width 100%, height 280) with: `PolarGrid`, `PolarAngleAxis` (dataKey "dimension"), and a single `Radar` (stroke `#14b8a6`, fill `#14b8a6`, fillOpacity 0.5); domain [0,100]; fully typed props
- [x] T011 [P] [US1] Create `src/app/src/components/ui/ResultsTable.tsx` — accepts `{ rows: ResultTableRow[] }` where `ResultTableRow = { model: string; overallScore: number; accuracy: number; consistency: number; creativity: number; safety: number }`; renders a table with columns: MODEL, OVERALL SCORE, ACCURACY, CONSISTENCY, CREATIVITY, SAFETY (in that order; NO Latency column); displays percentage values as `{value}%`; light bordered table with alternating row shading (`bg-white` / `bg-gray-50`); fully typed props
- [x] T012 [US1] Create `src/app/src/features/evaluation/hooks/useResultsStep.ts` — implements the full hook interface from `data-model.md` Section 4: (1) calls `getEvalResults()` on mount using `useRef` guard (React 18 StrictMode pattern, same as `useRunningStep.ts`); (2) exposes `results`, `isLoading`, `isError`, `retryCount`, `refetch`; (3) derives `completionDate` using `new Date().toLocaleDateString("en-CA")` in a `useRef` (captured once at mount); (4) reads `state.step2?.testCaseCount ?? null` from wizard store for `testCaseCount`; (5) reads `state.step1?.targetModel.name ?? "Unknown Model"` for model label; (6) computes aggregated averages across all result items (round to nearest integer); (7) maps `barChartData`, `radarChartData`, `tableRows` per `data-model.md` Section 5; no `any` types; depends on T003, T004
- [x] T013 [US1] Create `src/app/src/features/evaluation/steps/ResultsStep.tsx` — assembles the full Step 5 view with light theme (white/`bg-gray-50` background): (1) page header with title "Evaluation Results" (left) and "Completed on {completionDate}" (right, `text-gray-500 text-sm`); (2) stepper using `<StepStepper activeStep={5} onStepClick={...} />` with step-to-route mapping `{ 1: "/", 2: "/dataset", 3: "/viewdata", 4: "/running" }` and `router.push()`; (3) on `isLoading`: render full-page skeleton (three skeleton cards, two skeleton chart areas, skeleton table rows) using `animate-pulse` Tailwind utility; (4) on `isSuccess` with results: render summary cards row (3 cards), charts row (BarChart left, RadarChart right, side-by-side), results table, and navigation row; (5) navigation row: "New Evaluation" button (bottom left, calls `clear()` + `router.push("/")`) and "Export Results" button (bottom right, gradient style); depends on T005, T008–T012
- [x] T014 [US1] Update `src/app/src/app/results/page.tsx` — replace the existing stub implementation with a single `<ResultsStep />` import and render; keep the `"use client"` directive; remove the stub content; depends on T013

**Checkpoint**: Navigate to `http://localhost:3000/results` after a completed evaluation — all three summary cards, both charts, and the table must be populated. Stepper Steps 1–4 must be clickable.

---

## Phase 4: User Story 4 — Handle Results Load Failure (Priority: P2)

**Goal**: When `GET /eval/results` fails or returns an empty array, show a clear, recoverable error state rather than a broken page.

**Independent Test**: Stop the backend and navigate to `/results` — verify the full-page error state appears with a "Retry" button. Click Retry, verify a second attempt fires. Verify that after the retry also fails, the Retry button is replaced by a permanent error with a "New Evaluation" button. Separately, make the endpoint return `[]` and verify the empty state message appears with a "New Evaluation" button.

### Implementation

- [x] T015 [US4] Add error state UI to `src/app/src/features/evaluation/steps/ResultsStep.tsx` — on `isError` and `retryCount === 0`: render a full-page, vertically centred error state with an error icon, a generic message ("Could not load evaluation results"), and a "Retry" button that calls `refetch()`; on `isError` and `retryCount >= 1` (single retry exhausted): replace Retry button with a permanent error message ("Results could not be loaded. Please start a new evaluation.") and a "New Evaluation" button that calls `clear()` + `router.push("/")`; the `retryCount` state is managed in `useResultsStep` (incremented each time `refetch()` is called); error state must not show partial renders
- [x] T016 [US4] Add empty state UI to `src/app/src/features/evaluation/steps/ResultsStep.tsx` — on `!isError && !isLoading && results?.length === 0`: render a vertically centred empty state with a message ("No evaluation results found. Run an evaluation to see results here.") and a "New Evaluation" button that calls `clear()` + `router.push("/")`

**Checkpoint**: Both error and empty states render correctly per acceptance scenarios in spec.md US4.

---

## Phase 5: User Story 2 — Export Results as PDF (Priority: P2)

**Goal**: "Export Results" downloads a PDF of the full visible results page, with navigation elements hidden and all charts and the table captured.

**Independent Test**: Click "Export Results" on a populated results page — the browser print dialog opens with the default filename set to `eval-results-YYYY-MM-DD`. Save as PDF and verify: summary cards, both charts, and the results table are present; the stepper, "New Evaluation", and "Export Results" buttons are absent.

### Implementation

- [x] T017 [US2] Implement "Export Results" button handler in `src/app/src/features/evaluation/steps/ResultsStep.tsx`: on click, (1) store `const prevTitle = document.title`, (2) set `document.title = \`eval-results-${completionDate}\``, (3) call `window.print()`, (4) restore `document.title = prevTitle` in a `try/finally` block; ensure the "Export Results" button itself, the "New Evaluation" button, and the `<StepStepper>` wrapper all carry the `no-print` CSS class (added in T006); no third-party library; no inline error handling needed (window.print() is native)

**Checkpoint**: PDF export produces a file containing cards, charts, and table; navigation elements are absent from the PDF output.

---

## Phase 6: User Story 3 — Start a New Evaluation (Priority: P3)

**Goal**: "New Evaluation" resets all wizard state and returns the user to Step 1.

**Independent Test**: On the Results page, click "New Evaluation" — wizard resets to Step 1 with all inputs cleared (main prompt, dataset config, model selections).

### Implementation

- [x] T018 [US3] Verify "New Evaluation" button in `src/app/src/features/evaluation/steps/ResultsStep.tsx` calls `clear()` from `useEvaluationWizard()` and `router.push("/")`, and that this is wired up in both the success-state navigation row (bottom-left) and the error/empty state fallback buttons; confirm this is the same `clear()` call used in the existing stub at `src/app/src/app/results/page.tsx`

**Checkpoint**: Clicking "New Evaluation" from any state (success, error, empty) lands on Step 1 with cleared wizard state.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, linting, and end-to-end validation.

- [x] T019 [P] Run `npm run lint` in `src/app/` and fix all errors across new and modified files: `SummaryCard.tsx`, `BarChart.tsx`, `RadarChart.tsx`, `ResultsTable.tsx`, `useResultsStep.ts`, `ResultsStep.tsx`, `results/page.tsx`, `StepStepper.tsx`, `config.ts`, `evaluationApi.ts`, `globals.css`, `evaluation.ts`
- [x] T020 [P] Verify no `any` types remain in any of the new or modified TypeScript files (run `tsc --noEmit` in `src/app/` if needed)
- [x] T021 [P] Verify all quality gates from `plan.md`: (1) Latency excluded from types, table columns, and cards; (2) no `setStep1`/`setStep2`/`setStep3` calls in `useResultsStep`; (3) `testCaseCount` reads from store, not hardcoded; (4) all recharts components wrapped in `ResponsiveContainer`; (5) `no-print` class present on stepper wrapper, "New Evaluation" button, and "Export Results" button
- [ ] T022 Run full wizard flow per `specs/004-eval-results-dashboard/quickstart.md` steps 4–9: complete Steps 1–4, verify auto-redirect to Step 5, verify all data populated, verify back-navigation via stepper, verify PDF export, verify "New Evaluation" resets to Step 1

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1
  - T003, T004 block Phase 3
  - T005, T006 can be done any time after Phase 1
  - T007 is GATED — requires user authorization; does NOT block frontend component development; only blocks end-to-end test (T022)
- **Phase 3 (US1)**: Depends on T003 + T004; T005 needed for T013
  - T008, T009, T010, T011 can run in parallel after Phase 2
  - T012 depends on T003 + T004
  - T013 depends on T008–T012
  - T014 depends on T013
- **Phase 4 (US4)**: Depends on T013 (modifies ResultsStep)
- **Phase 5 (US2)**: Depends on T013 (modifies ResultsStep); can overlap with Phase 4
- **Phase 6 (US3)**: Depends on T013; lightweight verification task
- **Phase 7 (Polish)**: Depends on all phases complete; T022 also depends on T007 (backend)

### User Story Dependencies

- **US1 (P1)**: Foundational complete — independent, no other story dependencies
- **US4 (P2)**: US1 complete (adds states to existing ResultsStep)
- **US2 (P2)**: US1 complete (adds export handler to existing ResultsStep); can run in parallel with US4
- **US3 (P3)**: US1 complete (verification task only); can run in parallel with US4/US2

### Parallel Opportunities

Within Phase 3 (US1): T008, T009, T010, T011, T012 can all be launched in parallel (different files, no inter-dependencies):

```
Parallel batch → T008 (SummaryCard) + T009 (BarChart) + T010 (RadarChart) + T011 (ResultsTable) + T012 (useResultsStep)
Sequential      → T013 (ResultsStep — assembles all of the above)
Sequential      → T014 (page.tsx — wraps ResultsStep)
```

Within Phase 7 (Polish): T019, T020, T021 can all run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete **Phase 1** (Setup: install recharts, config constant)
2. Complete **Phase 2** (Foundational: types, API function, StepStepper, print styles) — unblock T007 with user separately
3. Complete **Phase 3** (US1: all components, hook, ResultsStep, page.tsx)
4. **STOP and VALIDATE**: navigate to `/results` after a real evaluation run — verify happy path completely
5. Demo/share if ready

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready
2. Phase 3 (US1) → Full happy path ✅
3. Phase 4 (US4) → Error + empty states ✅
4. Phase 5 (US2) → PDF export ✅
5. Phase 6 (US3) → New Evaluation verified ✅
6. Phase 7 (Polish) → Quality gates + end-to-end ✅

---

## Notes

- **[P]** tasks operate on different files and have no dependencies on incomplete tasks in the same phase
- **US4** and **US2** both modify the existing `ResultsStep.tsx` created in US1 — they must run after Phase 3 but can run in parallel with each other
- **T007** (backend) is fully gated on user authorization; frontend implementation is not blocked by it
- `useResultsStep` uses the same `useRef` guard pattern as `useRunningStep.ts` to prevent double-firing in React 18 StrictMode
- All new components must have explicit TypeScript types for all props — no implicit `any`
- The Latency field is excluded at every layer: types (no `latency` field in `EvalResult`), table (no LATENCY column), cards (no Avg Latency card)
