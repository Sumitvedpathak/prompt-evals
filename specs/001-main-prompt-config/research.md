# Research: Main Prompt Configuration (Step 1)

**Date**: 2026-04-26  
**Feature**: `./spec.md`

## Decisions

### Decision: Next.js App Router + React + TypeScript
**Rationale**: Matches the project constitution and repository README conventions; supports
production-ready patterns and component reuse for a multi-step wizard.

### Decision: API base URL + endpoints are centralized constants
**Decision**: Define `NEXT_PUBLIC_API_BASE_URL` and keep endpoint paths as named constants in a single
config module (no hardcoded URLs in components/hooks).
**Rationale**: Endpoint URLs are not finalized; this allows one-place updates.

### Decision: Feature-level state store for all 5 wizard steps
**Decision**: Create one evaluation wizard store/module that persists across steps and exposes a
typed interface.
**State (Step 1 must write)**:
- `mainPrompt: string`
- `targetModelId: string`
- `targetModel: { id; name; provider; description }`
**Rationale**: The wizard needs stable, shared state across Steps 1–5 without prop-drilling.

### Decision: UI blocking behavior for `/llm` failures
**Decision**: If the `/llm?type=target` request fails or returns zero models, block the entire Step 1
UI (including textarea, Refine, Next) and show a full-card error + Retry.
**Rationale**: Target model is mandatory to proceed; partial UI creates unusable state.

### Decision: Typed API client functions (thin layer)
**Decision**: Implement typed API functions in `src/lib/api/evaluationApi.ts` and keep view logic in
`src/features/.../hooks/useMainPrompt.ts`.
**Rationale**: Keeps UI components declarative and testable; aligns with constitution “contracts-first”.

## Alternatives considered

- **State via URL query params**: rejected for complexity and payload size once later steps add data.
- **Allow partial UI on `/llm` error**: rejected because the step cannot proceed without model choice.

