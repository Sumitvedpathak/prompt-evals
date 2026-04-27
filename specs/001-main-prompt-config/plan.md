# Implementation Plan: Main Prompt Configuration (Step 1)

**Branch**: `001-main-prompt-config` | **Date**: 2026-04-26 | **Spec**: `./spec.md`  
**Input**: Feature specification from `specs/001-main-prompt-config/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement the Step 1 screen of the 5-step LLM Evaluation wizard in the Next.js frontend (`src/app/`).
The screen fetches target models (`GET /llm?type=target`), pre-selects the first model, allows users
to enter a production prompt, refine it (`POST /refine`), and proceed to Step 2 with Step 1 state
persisted for later steps.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Next.js App Router) for UI; Python >=3.13 for backend APIs  
**Primary Dependencies**: Next.js + React + TypeScript (frontend); FastAPI OpenAPI (API contract source)  
**Storage**: Wizard state persisted in a feature-level store; eval run recording storage is out of scope for Step 1  
**Testing**: Frontend: component/behavior tests (framework TBD in implementation); Backend: existing Python tests as applicable  
**Target Platform**: Web (modern browsers) + Node runtime for Next.js server  
**Project Type**: Web application (frontend UI consuming backend APIs)  
**Performance Goals**: Step 1 models grid visible within 3 seconds when `/llm` succeeds  
**Constraints**: No hardcoded API URLs; strict TypeScript (no `any`); loading/error/empty states for all API calls  
**Scale/Scope**: Step 1 only; Steps 2–5 are out of implementation scope but must be supported via shared state

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Contracts-first API: PASS (explicit contracts documented; typed API client planned)
- Reproducible/auditable evals: N/A for Step 1 UI scope (state capture only; recording policy deferred)
- Provider portability: PASS (no provider SDK calls in frontend; only backend API calls)
- Phased UI delivery: PASS (vertical slice Step 1 UI → API contracts)
- Production hygiene: PASS (config centralized; error handling defined; strict typing)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
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
├── api/                      # Backend APIs (existing / WIP)
└── app/                      # Next.js frontend app (to be created/implemented)
    └── src/
        ├── app/              # Next.js App Router routes/layouts
        ├── components/
        │   └── ui/
        │       ├── ModelCard.tsx
        │       └── StepStepper.tsx
        ├── features/
        │   └── evaluation/
        │       ├── hooks/
        │       │   └── useMainPrompt.ts
        │       └── steps/
        │           └── MainPromptStep.tsx
        ├── lib/
        │   └── api/
        │       ├── config.ts
        │       └── evaluationApi.ts
        └── types/
            └── evaluation.ts
```

**Structure Decision**: Monorepo-style `src/api` (backend) + `src/app` (Next.js frontend) as per the
project constitution and README. Step 1 implementation lives under the `src/app/src/` feature paths
captured above.

## Implementation Notes (Step 1)

### API client

- Centralize API URL configuration:
  - `NEXT_PUBLIC_API_BASE_URL` (placeholder: `http://localhost:8000`)
  - Endpoint path constants in `src/app/src/lib/api/config.ts`
- Typed API functions in `src/app/src/lib/api/evaluationApi.ts`:
  - `getTargetModels(): Promise<TargetModel[]>` calls `GET /llm?type=target`
  - `refineMainPrompt(input: { type: "main"; prompt: string; target_model: string }): Promise<{ refined_prompt: string }>`

### State management (wizard-wide)

Implement a single evaluation-wizard state container that Steps 1–5 can read/write. Step 1 must set:
- `mainPrompt`
- `targetModelId`
- `targetModel`

### UX behavior mapping

- `/llm` loading: show skeleton model cards; Step 1 inputs are not interactive.
- `/llm` error or empty: full-card error state with retry; Step 1 inputs are blocked.
- `/refine` in-flight: Refine shows loading; textarea is read-only; do not allow double-submit.
- `/refine` error: inline error below textarea; preserve prompt content.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
