<!--
Sync Impact Report

- Version change: N/A → 0.1.0
- Modified principles: Template placeholders → project-specific principles (all renamed and rewritten)
- Added sections: None (filled existing sections)
- Removed sections: None
- Templates requiring updates: ⚠ pending (no template edits made in this pass)
- Deferred TODOs:
  - TODO(RATIFICATION_DATE): Set once you decide the “official adoption date” for this constitution.
-->

# Prompt Evals Constitution

## Core Principles

### I. Contracts-First API (UI integrates by contract, not by convention)
All external-facing behavior MUST be expressed as stable API contracts (request/response schemas and
error shapes). The frontend (`src/app/`) MUST integrate with the backend only via these contracts
(no provider SDK usage in the UI, no direct filesystem coupling to backend internals).

Contract changes MUST be intentional:
- Backward-compatible changes SHOULD be preferred.
- Breaking changes MUST be versioned and accompanied by migration notes.

Contract source of truth:
- The backend APIs are implemented with FastAPI, and FastAPI’s OpenAPI specification is the
  canonical contract for UI integration.
- Frontend types and API clients SHOULD be derived from the OpenAPI contract (manually or via
  generation), rather than re-invented ad hoc.

### II. Reproducible, Auditable Evaluations (production-like reality)
Evaluation runs MUST be reproducible and auditable. For any evaluation outcome we care about, the
system MUST be able to record enough metadata to explain “what happened”:
- Dataset identity (version/hash), and the exact test cases used
- Prompt identity (version/hash), and any refinement/merge inputs
- Model identity (provider + model string), and generation parameters used
- Code identity (git commit SHA) for the run

If deterministic reproduction is impossible (common with LLMs), the system MUST still preserve the
run inputs and settings so results are explainable and comparable.

### III. Provider Portability (LLM access behind adapters)
LLM providers MUST be accessed through a small, well-defined adapter layer. Provider-specific SDKs,
HTTP clients, auth handling, and retry/timeouts MUST live behind the backend integration boundary.

The UI MUST NOT import or call provider SDKs directly. The UI talks to the backend; the backend
talks to providers.

### IV. Phased UI Delivery via Vertical Slices (no big-bang integration)
UI development will be phased. Each phase MUST ship a vertical slice that works end-to-end
(`src/app/` → API in `src/api/` → recorded result/output) for a bounded scope.

Each phase MUST include:
- A small set of acceptance checks (happy path + common failures)
- Backward compatibility or explicit API versioning for any contract changes
- A clear “what’s included / excluded” statement in that phase’s feature spec

### V. Production Hygiene (security, reliability, and maintainability)
The system MUST be safe to run in production-like environments:
- Secrets MUST NOT be committed and MUST come from environment or a secret manager.
- Network calls to LLM providers MUST use timeouts and have clear error handling.
- The backend MUST return consistent error responses; failures must be observable in logs.
- Complexity MUST be justified; default to the simplest design that supports the next phase.

## Architecture & Folder Structure

This repository is a monorepo with two primary codebases:
- Backend APIs: `src/api/` (Python)
- Frontend app/UI: `src/app/` (Next.js App Router + React + TypeScript)

Folder structure is a contract. New code MUST follow these rules:

- Backend
  - Backend code resides under `src/api/`.
  - Provider integrations MUST live under an explicit integration boundary (e.g. `src/api/integration/`).
  - JSON resources used by the API MUST live under `src/api/resources/` (or a clearly named successor).

- Frontend
  - The frontend is a standalone production-grade web app under `src/app/` with its own `package.json`.
  - The frontend MUST be implemented using current best-practice industry patterns (TypeScript-first,
    linted/formatted, accessible UI, clear layering between routing, UI components, state, and API client).
  - Frontend code structure MUST keep “app routing” separate from “shared UI components” and “API client”.
    Concrete conventions for this repository are documented in `README.md` and MUST be followed.
  - Package manager for the frontend MUST be npm.

## Development Workflow & Quality Gates

Changes MUST maintain a working build for the touched surface area (API or UI).

- Backend quality gates
  - New or changed backend behavior SHOULD be covered by tests where practical.
  - JSON parsing/validation MUST fail loudly and predictably (no silent coercion for core contracts).

- Frontend quality gates
  - TypeScript MUST be enabled and treated as a gate (no persistent `any` escape hatches for core flows).
  - Linting/formatting MUST be enforced (CI or pre-commit hooks are recommended).
  - UI MUST implement sensible loading/error states for every API call.

- Cross-cutting
  - Any contract change MUST be reflected in the UI client and documented in the relevant feature spec.

## Governance

This constitution supersedes all other project guidance. Feature specs, plans, and tasks MUST be
consistent with these principles.

- Amendments
  - Amendments MUST update this file and include rationale in the change description.
  - If an amendment changes non-negotiable rules or removes a principle, bump MAJOR.
  - If an amendment adds a principle or materially expands constraints, bump MINOR.
  - If an amendment clarifies wording without changing meaning, bump PATCH.

- Compliance checks
  - Each PR SHOULD explicitly state which principles it touches or relies on.
  - If a PR knowingly violates a principle, it MUST include a written exception rationale and a plan
    to return to compliance (or a constitution amendment).

**Version**: 0.1.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2026-04-25
