# Quickstart: Step 1 UI (Main Prompt Configuration)

**Date**: 2026-04-26  
**Feature**: `./spec.md`

## Goal

Provide the Step 1 screen of the evaluation wizard with:
- Model grid populated from `GET /llms?type=target` (first model pre-selected)
- Prompt textarea with in-border Refine button
- Refine calls `POST /refine` with `{ type: "main", prompt, target_model }`
- Next persists state and navigates to Step 2

## Configuration

Backend base URL MUST be configurable via environment variable:

- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`

No hardcoded URLs in components or hooks.

## Contracts

See `./contracts/http-api.md`.

