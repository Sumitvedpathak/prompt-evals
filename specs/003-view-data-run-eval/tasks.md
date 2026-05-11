# Tasks: Step 3 — View Data & Run Evaluation + Step 4 — Running

**Input**: Design documents from `specs/003-view-data-run-eval/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/http-api.md ✅

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths included in all task descriptions

---

## Phase 1: Setup

**Purpose**: Create new route directory stubs so that navigation targets exist before
any feature component is built.

- [X] T001 Create placeholder page files for new routes: `src/app/src/app/running/page.tsx` and `src/app/src/app/results/page.tsx` — each exporting a default component that renders `null` or a "Coming soon" div

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, API config, store extension, and API client additions that
every user story depends on.

⚠️ **CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Add `ViewDataStepState`, `EvaluateRequest`, and `EvaluateResponse` types to `src/app/src/types/evaluation.ts`
  - `ViewDataStepState`: `{ evalModelId: string; evalModel: LLMModel }`
  - `EvaluateRequest`: `{ main_prompt: string; main_model: string; evaluate_model: string }` (field is `evaluate_model`, not `eval_model`)
  - `EvaluateResponse`: `unknown`

- [X] T003 [P] Add `testcaseEvaluate: "/testcase/evaluate"` to the `API_ENDPOINTS` constant in `src/app/src/lib/api/config.ts`

- [X] T004 Extend `src/app/src/features/evaluation/store/evaluationWizardStore.ts`:
  - Add `step3?: ViewDataStepState` to `EvaluationWizardState`
  - Add `setStep3: (step3: ViewDataStepState) => void` to `EvaluationWizardStore`
  - Implement `setStep3` with same-value guard (mirror the `isSameStep2` pattern)
  - Extend `clear()` to also reset `step3`
  - Import `ViewDataStepState` from `@/types/evaluation`

- [X] T005 [P] Add `getEvalModels(): Promise<LLMModel[]>` to `src/app/src/lib/api/evaluationApi.ts`
  - Calls `GET /llm?type=evaluation` (query param value is `"evaluation"`, not `"eval"`)
  - Reuses the existing `isLlmApiModel` guard and `toProviderLabel` helper
  - Throws on HTTP error or empty array (`"No evaluation models available."`)

- [X] T006 [P] Add `runEvaluation(input: EvaluateRequest): Promise<string>` to `src/app/src/lib/api/evaluationApi.ts`
  - Calls `POST /testcase/evaluate` with JSON body
  - The backend always returns HTTP 200; detect outcome by inspecting the parsed body:
    - `typeof parsed === "string"` → success; return the string
    - `parsed !== null && typeof parsed === "object" && "error" in parsed` → throw `new Error((parsed as {error: string}).error)`
    - Any other shape → throw `new Error("Unexpected response from evaluate endpoint")`
  - Also throws on HTTP-level errors (`!res.ok`)

**Checkpoint**: Foundation ready — all type definitions, config constants, store actions, and API functions are in place. User story implementation can now begin.

---

## Phase 3: User Story 1 — Review Dataset and Download (Priority: P1) 🎯 MVP

**Goal**: The user can navigate to Step 3, see the generated dataset JSON immediately
in a scrollable viewer, toggle it hidden/visible, and download it as a `.json` file.

**Independent Test**: Complete Step 2 and click "Generate Dataset →"; confirm the
`/viewdata` page loads, shows a progress state, then shows the dataset viewer with
working Hide/Show and Download buttons.

### Implementation for User Story 1

- [X] T007 [P] [US1] Create `src/app/src/components/ui/JsonViewer.tsx`
  - Props: `{ value: unknown; visible: boolean }`
  - When `visible` is false, render nothing
  - When visible, render a `<pre>` with `JSON.stringify(value, null, 2)`, dark code
    viewer style: `bg-[#0d0d1a]`, monospace font, `max-h-72 overflow-auto`, dark border
  - No `any` types; value is `unknown` and passed directly to `JSON.stringify`

- [X] T008 [US1] Create `src/app/src/features/evaluation/hooks/useViewDataStep.ts` — Part 1
  - Read `state.step2` from `useEvaluationWizard()`
  - Local `GenerateState` union: `idle | running | success{ result: unknown } | error{ message }`
  - On mount: if step2 exists, fire `generateCreate(request)` (same pattern as current `generate/page.tsx`)
  - Expose: `genState`, `showDataset`, `toggleDataset()`, `downloadDataset()`, `datasetJson`
  - `downloadDataset()`: creates a `Blob` and triggers a browser download of `dataset.json`
  - `datasetJson`: `JSON.stringify(dataset, null, 2)` derived from genState success result
  - Use the `getDatasetFromResult` extraction helper (same as current `generate/page.tsx`)

- [X] T009 [US1] Create `src/app/src/features/evaluation/steps/ViewDataStep.tsx` — Card 1 only
  - Dark page wrapper: `bg-[#0f0f1a]` full-width container
  - App header (LLM badge + title + subtitle) — same as existing steps
  - `<StepStepper activeStep={3} />`
  - Card 1 (dark card: `bg-[#1a1a2e]`, `border-[#2a2a3e]`):
    - Title: "Step 3: View Data" + subtitle
    - `genState === "running"`: indeterminate gradient progress bar + "Generating dataset..." label
    - `genState === "error"`: rose error card with message and Retry button (increments attempt counter)
    - `genState === "success"`: emerald success banner with "Dataset generated successfully" heading,
      subtext, Hide/Show button (outlined emerald), Download JSON button (gradient),
      and `<JsonViewer value={dataset} visible={showDataset} />`
  - Navigation stub at bottom (empty `<div>` — navigation added in US4)
  - `useViewDataStep()` for all state

- [X] T010 [US1] Replace `src/app/src/app/viewdata/page.tsx` to render `<ViewDataStep />`
  - Remove the current `import GenerateDatasetPage from "@/app/generate/page"`
  - Add `import { ViewDataStep } from "@/features/evaluation/steps/ViewDataStep"`
  - Export default that returns `<ViewDataStep />`
  - Keep `"use client"` directive

**Checkpoint**: User Story 1 fully functional — `/viewdata` shows dataset, toggle, and download work.

---

## Phase 4: User Story 2 — Select Evaluation Model (Priority: P2)

**Goal**: Evaluation models load in a grid below the dataset viewer. Only one model
can be selected at a time. "Run Evaluation" is disabled until a model is selected.

**Independent Test**: Reach Step 3 success state (dataset loaded); confirm the model
grid appears below, models load from `/llm?type=evaluation`, selecting a card enables
the Run Evaluation button, selecting a second card deselects the first.

### Implementation for User Story 2

- [X] T011 [US2] Extend `src/app/src/features/evaluation/hooks/useViewDataStep.ts` — Part 2
  - Add `EvalModelsState` union: `loading | error{ message } | ready{ models: LLMModel[] }`
  - On mount: fetch `getEvalModels()` independently of generation state (cancellable, same pattern as `useDatasetStep`)
  - Expose: `evalModelsState`, `selectedEvalModelId`, `selectedEvalModel`,
    `onSelectEvalModel(id: string)`, `retryLoadEvalModels()`
  - `selectedEvalModelId` initialises to `""` — no pre-selection (user must explicitly choose)
  - `canRunEval`: `evalModelsState.status === "ready" && !!selectedEvalModelId && genState.status === "success" && !isSubmitting`

- [X] T012 [US2] Extend `src/app/src/features/evaluation/steps/ViewDataStep.tsx` — Card 2
  - Add Card 2 below Card 1, same dark card style
  - Title: "Select Models for Evaluation" + subtitle: "Choose which models you want to test
    with your prompt and dataset." + section label: "Select Models to Test"
  - `evalModelsState === "loading"`: 3-column skeleton grid (same skeleton pattern as `DatasetStep`)
  - `evalModelsState === "error"`: full-card rose error with message and Retry button;
    Card 1 remains fully usable and unaffected
  - `evalModelsState === "ready"`: 3-column `ModelCard` grid, `name="eval-model"`,
    radio semantics via existing `ModelCard` component
  - "Run Evaluation" button below the grid:
    - Disabled when `!canRunEval` (`bg-slate-800 text-slate-500 cursor-not-allowed`)
    - Enabled when `canRunEval` (gradient `from-violet-600 to-fuchsia-500`)
    - Icon: play/triangle icon matching the reference screenshot

**Checkpoint**: User Story 2 fully functional — models load, one card selects at a time,
Run Evaluation button enables/disables correctly.

---

## Phase 5: User Story 3 — Run Evaluation & Step 4 (Priority: P3)

**Goal**: Clicking "Run Evaluation" submits the job, navigates to Step 4, which shows
an animated progress bar. On completion the API result message is shown, and
"View Results →" becomes enabled on success.

**Independent Test**: Select a model; click "Run Evaluation"; confirm navigation to
`/running`, progress bar animates to 100%, success message shows, "View Results →"
enables; also confirm that a simulated API error shows the error message on Step 3
instead of navigating.

### Implementation for User Story 3

- [X] T013 [US3] Extend `src/app/src/features/evaluation/hooks/useViewDataStep.ts` — Part 3
  - Add `isSubmitting: boolean` and `runEvalError: string | null` local state
  - Implement `onRunEval()`:
    1. Guard: `if (!canRunEval) return`
    2. Read `state.step1.mainPrompt`, `state.step1.targetModelId` from store
    3. Set `isSubmitting = true`, clear `runEvalError`
    4. Call `runEvaluation({ main_prompt, main_model, evaluate_model: selectedEvalModelId })`
    5. On success: call `setStep3({ evalModelId: selectedEvalModelId, evalModel: selectedEvalModel })`,
       then `router.push("/running")`
    6. On error: set `runEvalError` to the error message, set `isSubmitting = false`
  - Disable Run Evaluation button while `isSubmitting` (add to `canRunEval`)
  - Expose: `isSubmitting`, `runEvalError`, `onRunEval`

- [X] T014 [US3] Extend `src/app/src/features/evaluation/steps/ViewDataStep.tsx` — Run Evaluation button states
  - Wire `onClick={onRunEval}` on the Run Evaluation button
  - While `isSubmitting`: button shows a spinner + "Submitting..." text, `cursor-wait`
  - After error: `runEvalError` shown as inline `text-rose-300` message below the button;
    button re-enables

- [X] T015 [P] [US3] Create `src/app/src/components/ui/ProgressBar.tsx`
  - Props: `{ percent: number; className?: string }`
  - Outer track: `w-full h-2 rounded-full bg-slate-800` (or `bg-[#2a2a3e]`)
  - Inner fill: `h-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500`,
    width driven by `percent` via inline style `width: \`${percent}%\``
  - Smooth transition: `transition-[width] duration-100 ease-linear`
  - Percentage label rendered below bar: `{Math.round(percent)}% Complete` in `text-slate-400 text-sm`
  - No `any` types; `percent` is `number` clamped to 0–100

- [X] T016 [US3] Create `src/app/src/features/evaluation/hooks/useRunningStep.ts`
  - Reads `state.step2.testCaseCount` and `state.step3.evalModel` from `useEvaluationWizard()`
  - Local state: `percent: number` (0–100), `isComplete: boolean`
  - On mount: start `setInterval` at 100ms tick; increment `percent` by `100/30` (~3.33) per tick
  - When `percent >= 100`: clear interval, set `percent = 100`, set `isComplete = true`
  - Cleanup: `clearInterval` on unmount
  - Expose: `percent`, `isComplete`, `testCaseCount`, `evalModelCount: 1`

- [X] T017 [US3] Create `src/app/src/features/evaluation/steps/RunningStep.tsx`
  - Dark page wrapper same as ViewDataStep (`bg-[#0f0f1a]`)
  - App header (same LLM badge + title)
  - `<StepStepper activeStep={4} />`
  - Single centred dark card (`bg-[#1a1a2e]`, `border-[#2a2a3e]`):
    - App/sparkle icon (large, centred — reuse the `✦` / sparkle SVG already used in existing pages)
    - Heading: "Running Evaluation" (`text-xl font-semibold text-slate-100`)
    - Subtitle: "Testing {evalModelCount} model across {testCaseCount} test cases" (`text-slate-400`)
    - When `!isComplete`: `<ProgressBar percent={percent} />`
    - When `isComplete`: success message text (`text-emerald-400`), replace progress bar
  - Navigation row (three buttons — see T020): always rendered, View Results → gated by `isComplete`
  - `useRunningStep()` for all state

- [X] T018 [US3] Create `src/app/src/app/running/page.tsx`
  - Replace the T001 stub with the real implementation
  - `"use client"` directive
  - Import and render `<RunningStep />`

**Checkpoint**: User Story 3 fully functional — run submission works, Step 4 animates,
success message + "View Results →" appear on completion.

---

## Phase 6: User Story 4 — Navigation Continuity (Priority: P4)

**Goal**: All navigation buttons work correctly with state preservation. Back buttons
preserve wizard state; New Eval clears all state.

**Independent Test**: Select an eval model → Back to Step 2 → return to Step 3 →
confirm model is still selected. Step 4 → Back to Step 3 → confirm selection intact.
New Eval from either step clears state and returns to Step 1.

### Implementation for User Story 4

- [X] T019 [US4] Add navigation row to `src/app/src/features/evaluation/steps/ViewDataStep.tsx`
  - Replace the empty navigation stub (from T009) with a full navigation row
  - Left: `<NewEvalButton onConfirm={() => { clear(); router.push("/"); }} />`
  - Right side: two buttons:
    - "← Back to Step 2": `router.push("/dataset")` — does NOT clear state
    - "Run Evaluation →": already wired in T014; ensure it is in the right-side button group

- [X] T020 [US4] Add navigation row to `src/app/src/features/evaluation/steps/RunningStep.tsx`
  - Three buttons always visible (replace any placeholder from T017):
    - Left: `<NewEvalButton onConfirm={() => { clear(); router.push("/"); }} />`
    - Center-right: "← Back to Step 3" button: `router.push("/viewdata")` — does NOT clear state
    - Right: "View Results →" button:
      - `disabled={!isComplete}` — styled `cursor-not-allowed bg-slate-800 text-slate-500` when disabled
      - Enabled: gradient style `from-violet-600 to-fuchsia-500`
      - `onClick={() => router.push("/results")}` when enabled

- [X] T021 [US4] Finalise `src/app/src/app/results/page.tsx` (Step 5 placeholder)
  - Replace the T001 stub
  - `"use client"` directive
  - Dark page wrapper `bg-[#0f0f1a]`
  - App header (same LLM badge + title)
  - `<StepStepper activeStep={5} />`
  - Single dark card: heading "Step 5: Results" + body text "Results coming soon."
  - `<NewEvalButton onConfirm={() => { clear(); router.push("/"); }} />` at the bottom

**Checkpoint**: All user stories independently functional with correct navigation.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Theme consistency, quality gates, and final verification.

- [X] T022 Verify dark theme tokens applied consistently across `ViewDataStep.tsx` and `RunningStep.tsx`:
  - Page background: `bg-[#0f0f1a]` or `bg-slate-950`
  - Card background: `bg-[#1a1a2e]` or `bg-slate-900`
  - Card border: `border-[#2a2a3e]` or `border-slate-800`
  - Body text: `text-slate-300`; muted: `text-slate-500`
  - Success accent: `text-emerald-400`
  - Code viewer bg: `bg-[#0d0d1a]`
  - No light-themed surfaces on Steps 3 or 4

- [X] T023 Run `npm run lint` in `src/app/` and fix all TypeScript and ESLint errors; confirm no `any` escapes in new files; confirm `next build` has no type errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
  - T002, T003, T005, T006 can all run in parallel
  - T004 must complete before any store reads in hooks
- **US1 (Phase 3)**: Depends on Phase 2 completion
  - T007 and T008 can run in parallel; T009 depends on both; T010 depends on T009
- **US2 (Phase 4)**: Depends on Phase 3 (ViewDataStep must exist to extend)
  - T011 extends the hook; T012 extends the component — sequential on T011
- **US3 (Phase 5)**: Depends on Phase 4 (needs the model selector to exist)
  - T013 and T015 can run in parallel; T014 depends on T013; T016 on T015; T017 on T016; T018 on T017
- **US4 (Phase 6)**: Depends on Phase 5 (components must exist to add nav rows)
  - T019, T020, T021 can run in parallel
- **Polish (Phase 7)**: Depends on Phase 6

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no story dependencies
- **US2 (P2)**: Depends on US1 (extends the same hook and component)
- **US3 (P3)**: Depends on US2 (Run Evaluation requires model selection)
- **US4 (P4)**: Depends on US3 (navigation rows added to complete components)

### Within Each Phase

- Models/types before API client functions
- API client functions before hooks
- Hooks before components
- Components before route pages

### Parallel Opportunities

```text
Phase 2 (all parallel):
  T002 — types
  T003 — config
  T005 — getEvalModels API function
  T006 — runEvaluation API function

Phase 3 (partial parallel):
  T007 — JsonViewer component
  T008 — useViewDataStep hook (Part 1)
  → T009 depends on both T007 and T008
  → T010 depends on T009

Phase 5 (partial parallel):
  T013 — extend hook (Part 3)
  T015 — ProgressBar component
  → T014 depends on T013
  → T016 depends on T015
  → T017 depends on T016

Phase 6 (all parallel):
  T019 — ViewDataStep nav row
  T020 — RunningStep nav row
  T021 — results page stub
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) — T001
2. Complete Phase 2 (Foundational) — T002–T006
3. Complete Phase 3 (US1) — T007–T010
4. **STOP and VALIDATE**: Navigate to `/viewdata` from Step 2, confirm dataset viewer works
5. Continue to US2 once US1 is validated

### Incremental Delivery

1. Setup + Foundational → types and API ready
2. Add US1 → dataset viewer works end-to-end
3. Add US2 → model selector works
4. Add US3 → evaluation runs, Step 4 shows progress
5. Add US4 → all navigation paths correct
6. Polish → lint + theme audit

---

## Notes

- `[P]` tasks operate on different files and have no cross-task dependencies
- `[Story]` label maps each task to a specific user story for traceability
- Each user story is independently completable and testable
- The `evaluate_model` field name (not `eval_model`) is critical — see `research.md` Decision 2
- HTTP 200 is returned for both success and error from `/testcase/evaluate` — the API client
  in T006 handles body inspection so hooks only need a single `catch` path
- `type=evaluation` (not `type=eval`) is the correct query parameter — see `research.md` Decision 1
- Do NOT modify any file under `src/api/` — see Constitution Principle VI
