# HTTP API Contract Notes: Dataset Generation (Step 2)

This document captures the UI-facing contract additions/usage for Wizard Step 2.

## Model list

### GET `/llm?type=dataset`

- **Usage**: Called once on Step 2 mount to populate dataset model grid.
- **Query params**:
  - `type`: `"dataset"`
- **Response**: Array of models:

```json
[
  {
    "id": "string",
    "name": "string",
    "provider": "string",
    "description": "string"
  }
]
```

- **UI requirements**:
  - If request fails OR returns an empty array: block the entire Step 2 UI with a full-card error and Retry.
  - On success: preselect the first item by default.

## Prompt refinement

### POST `/refine`

- **Request body**:

```json
{
  "type": "dataset",
  "prompt": "string",
  "target_model": "string"
}
```

- **Response body**:

```json
{
  "refined_prompt": "string"
}
```

- **UI requirements**:
  - Disable when prompt is empty (trimmed).
  - While in-flight: show loading; make textarea read-only.
  - On success: replace textarea with `refined_prompt`.
  - On error: show inline error below textarea; keep content unchanged.

## Dataset generation

### POST `/generate/create`

- **Request body**:

```json
{
  "dataset_prompt": "string",
  "dataset_model": "string",
  "count": 100
}
```

- **Response body**: `unknown` (placeholder until confirmed).
- **UI requirements**:
  - On click: persist Step 2 state to store and navigate to Step 3 immediately.
  - While in-flight (in Step 3): show an indeterminate progress bar.
  - On success: show a success message (dataset display comes in a later feature).
  - On error: inline error on the card; stay on Step 2; inputs preserved.

## Frontend API configuration constants

All endpoint paths must be defined as named constants in `src/app/src/lib/api/config.ts`.

- `ENDPOINT_GENERATE_CREATE = "/generate/create"`

