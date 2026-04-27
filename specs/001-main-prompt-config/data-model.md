# Data Model: Main Prompt Configuration (Step 1)

**Date**: 2026-04-26  
**Feature**: `./spec.md`

## Entities

### TargetModel

Represents a selectable target model the user will evaluate the production prompt against.

**Fields**
- `id: string` — stable identifier (used in requests; e.g. `openai/gpt-5`)
- `name: string` — display name (e.g. `GPT-5`)
- `provider: string` — provider display name (e.g. `OpenAI`)
- `description: string` — one-line description for the card

**Notes**
- UI pre-selects the first model returned by `GET /llms?type=target`.

### MainPromptStepState (Step 1 state)

State captured in Step 1 and used by later wizard steps.

**Fields**
- `mainPrompt: string`
- `targetModelId: string`
- `targetModel: TargetModel`

**Validation rules**
- `mainPrompt` must be non-empty to enable Refine and Next.
- `targetModelId` must be present to enable Refine and Next.

