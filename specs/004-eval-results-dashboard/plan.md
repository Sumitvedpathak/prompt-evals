# Implementation Plan: Evaluation Results Dashboard (Step 5)

**Branch**: `004-eval-results-dashboard` | **Date**: 2026-05-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/004-eval-results-dashboard/spec.md`

## Summary

Build the Step 5 Results Dashboard — the final screen of the evaluation wizard. On mount the page calls `GET /eval/results` (no parameters), renders three summary cards (Top Performer, Avg Accuracy, Tests Run), an Overall Performance bar chart, a Multi-Dimensional Analysis radar chart, a model comparison table, and a navigation row with "New Evaluation" and "Export Results" buttons. PDF export uses `window.print()` with a print media query; no third-party PDF library. Recharts is introduced as a new dependency. Step 5 reads `testCaseCount` from Step 2 wizard store state but writes nothing back. The existing StepStepper component is extended to support clickable completed steps for back-navigation.

**Critical prerequisite (Constitution VI)**: The backend endpoint currently exists as `POST /eval/results` returning `{ results: [...] }`. The planned contract is `GET /eval/results` returning `EvalResult[]`. These backend changes must be explicitly authorized before any `src/api/` edits are made. Frontend implementation proceeds against the intended contract; backend alignment is a gated prerequisite step.

## Technical Context

**Language/Version**: TypeScript 5 / React 19 / Next.js 16.2.4 (App Router)
**Primary Dependencies**: Recharts (new, to install via npm), Tailwind CSS v4, Next.js App Router
**Storage**: Session storage (read-only in Step 5 — reads `testCaseCount` from Step 2 store state; no writes)
**Testing**: Manual acceptance checks per spec (no automated test runner currently configured)
**Target Platform**: Desktop-width browser; mobile out of scope per spec
**Project Type**: Web application — Next.js frontend (`src/app/`) + FastAPI backend (`src/api/`), monorepo
**Performance Goals**: Results page fully populated within 3 seconds of API response (SC-001)
**Constraints**: No `any` types; linting must pass; recharts components must use `ResponsiveContainer`; `window.print()` PDF; print media query hides navigation elements
**Scale/Scope**: Single-model evaluation result per session; data model designed to accommodate multiple models (extensible bar chart groups)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Contracts-First API | ✅ Pass | Frontend integrates via the documented `GET /eval/results` contract in `contracts/http-api.md`; types in `evaluation.ts` derived directly from API response shape |
| II. Reproducible Evaluations | ✅ Pass | Results page is read-only display; does not modify evaluation run data |
| III. Provider Portability | ✅ Pass | No provider SDK in frontend; UI calls backend only via `evaluationApi.ts` |
| IV. Phased UI Delivery | ✅ Pass | Step 5 is a bounded vertical slice with defined acceptance checks; backward-compatible |
| V. Production Hygiene | ✅ Pass | Loading, error (with single-retry), and empty states all implemented; no secrets in frontend |
| VI. Backend API Boundary | ⚠️ Flag | Current backend: `POST /eval/results` → `{ results: RawEvalItem[] }`. Required: `GET /eval/results` → `EvalResult[]`. Backend changes needed — **must be explicitly authorized before any `src/api/` edits begin**. Frontend tasks implement against the intended contract; a separate backend task is gated on user confirmation. |

**Gate result**: Plan proceeds. Backend alignment flagged as a gated prerequisite in tasks.

## Project Structure

### Documentation (this feature)

```text
specs/004-eval-results-dashboard/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── http-api.md      ← Phase 1 output
├── checklists/
│   └── requirements.md
└── tasks.md             ← Phase 2 output (/speckit-tasks — not created here)
```

### Source Code

```text
src/app/src/
├── app/
│   └── results/
│       └── page.tsx                              UPDATE — replace stub with <ResultsStep />
├── components/
│   └── ui/
│       ├── StepStepper.tsx                       UPDATE — add optional onStepClick prop
│       ├── SummaryCard.tsx                       NEW — reusable stat card with accent color + icon
│       ├── BarChart.tsx                          NEW — Overall Performance (recharts BarChart)
│       ├── RadarChart.tsx                        NEW — Multi-Dimensional Analysis (recharts RadarChart)
│       └── ResultsTable.tsx                      NEW — model comparison table
├── features/
│   └── evaluation/
│       ├── hooks/
│       │   └── useResultsStep.ts                 NEW — data fetch, derived values, retry logic
│       └── steps/
│           └── ResultsStep.tsx                   NEW — full Step 5 view
├── lib/
│   └── api/
│       ├── config.ts                             UPDATE — add ENDPOINT_EVAL_RESULTS
│       └── evaluationApi.ts                      UPDATE — add getEvalResults()
├── styles/
│   └── globals.css                               UPDATE — add @media print rules
└── types/
    └── evaluation.ts                             UPDATE — add EvaluationSummary, DimensionScores,
                                                            EvalResult, EvalResultsResponse
```

**Structure Decision**: Single project, extending the existing `src/app/` frontend structure defined in `README.md`. All new files follow existing conventions: feature hooks in `features/evaluation/hooks/`, step views in `features/evaluation/steps/`, reusable components in `components/ui/`, API client extensions in `lib/api/`.
