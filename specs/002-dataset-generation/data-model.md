# Data Model: Dataset Generation (Step 2)

## Entities

### LLMModel

Represents an LLM option returned from the backend and selectable in the UI.

- **Fields**
  - `id: string` (stable identifier; used as `target_model` and `dataset_model`)
  - `name: string` (display name)
  - `provider: string` (display provider)
  - `description: string` (display description)

## Wizard State

### Step1State (existing; read-only in Step 2)

- `mainPrompt: string`
- `targetModelId: string`
- `targetModel: LLMModel | null`

### DatasetStepState (Step 2)

Persisted in the shared wizard store (and `localStorage`).

- **Fields**
  - `datasetPrompt: string`
  - `datasetModelId: string`
  - `datasetModel: LLMModel | null`
  - `testCaseCount: number` (default 100)

- **Validation rules**
  - `datasetPrompt`: must contain at least one non-whitespace character after trimming to enable refine/generate.
  - `datasetModelId`: must refer to an existing model in the loaded list (UI should guard by selecting a valid model object).
  - `testCaseCount`: must be a positive integer (> 0).

## Request/Response Shapes (frontend)

### Refine request (Step 2)

- Request: `{ type: "dataset", prompt: string, target_model: string }`
- Response: `{ refined_prompt: string }`

### Generate dataset request

- Request: `{ dataset_prompt: string, dataset_model: string, count: number }`
- Response: `unknown` (placeholder until confirmed)

