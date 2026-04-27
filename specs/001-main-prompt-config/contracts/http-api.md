# Contracts: HTTP API (Step 1)

**Date**: 2026-04-26  
**Feature**: `../spec.md`

## GET `/llms?type=target`

**Purpose**: Fetch target models for the Step 1 model grid. Called once on mount.

**Query params**
- `type`: `"target"`

**Response**: `200 OK`

```json
[
  {
    "id": "openai/gpt-5",
    "name": "GPT-5",
    "provider": "OpenAI",
    "description": "Adversarial & Edge Cases"
  }
]
```

**Client behavior**
- If the response array has at least 1 model, the client MUST pre-select the first model.
- If the request fails OR returns an empty array, the entire Step 1 UI is blocked and a Retry is shown.

## POST `/refine`

**Purpose**: Refine the main prompt the user typed, tailored to the selected target model.

**Request body**

```json
{
  "type": "main",
  "prompt": "string",
  "target_model": "openai/gpt-5"
}
```

**Response**: `200 OK`

```json
{
  "refined_prompt": "string"
}
```

**Client behavior**
- While the request is in flight: Refine shows loading; textarea is read-only.
- On success: replace the textarea content with `refined_prompt`.
- On error: show inline error; preserve textarea content.

