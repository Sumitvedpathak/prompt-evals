# prompt-evals

Evaluate prompts in a production-like workflow: generate/collect test cases, run prompts against
target models, and grade outputs to understand effectiveness before shipping to production.

## Repo layout (contract)

This repository is intentionally split into backend APIs and a standalone frontend app.

```text
src/
  api/              # Python backend APIs (work in progress)
  app/              # Frontend web app (generated/iterated with Spec Kit)
```

### Backend (`src/api/`)

- **Purpose**: dataset generation, prompt refinement/merge, model invocation (via adapters), grading.
- **Rule**: provider access stays behind the backend integration boundary; the frontend never calls
  provider SDKs directly.

### Frontend (`src/app/`) — production-ready structure

`src/app/` is a standalone frontend project with its own dependency management.

**Baseline**: Next.js (App Router) + React + TypeScript, using **npm**.

When creating the frontend, follow this structure and conventions:

```text
src/app/
  package.json
  tsconfig.json
  eslint.config.* / .eslintrc*
  .prettierrc* (optional but recommended)
  next.config.* (as needed)
  src/
    app/            # App routing (e.g. Next.js App Router) or top-level routes
    components/     # Reusable UI components (shared, framework-agnostic where possible)
    features/       # Feature modules (screen-level logic, hooks, state, view models)
    lib/            # Utilities (api client, config, validators, helpers)
    styles/         # Global styles/theme tokens
    types/          # Shared TypeScript types (including API contract types)
```

Frontend rules:

- TypeScript-first; treat type errors as a build gate.
- Clear separation between:
  - **routing** (`src/app/src/app/`)
  - **UI components** (`src/app/src/components/`)
  - **API client** (`src/app/src/lib/api/` or similar)
- Every API call has loading + error + empty states.
- No secrets in the frontend; it talks to the backend API only.

API contract rule:
- The backend is FastAPI; the OpenAPI spec is the canonical contract.
- Frontend API client + types SHOULD be derived from OpenAPI (manually or via generation).

## Phased UI approach

The UI will be delivered in phases as vertical slices. Each phase should ship a working end-to-end
flow (UI → backend API → result) for a bounded scope, with explicit acceptance checks.

## Configuration

Backend provider access is configured via environment variables (e.g. `OPENROUTER_API_KEY`). Do not
commit secrets.

