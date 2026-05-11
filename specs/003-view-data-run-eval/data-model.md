# Data Model: Step 3 — View Data & Run Evaluation + Step 4 — Running

**Branch**: `003-view-data-run-eval` | **Date**: 2026-05-10

## Entities

### LLMModel (existing, reused)

Defined in `src/app/src/types/evaluation.ts` as `TargetModel` / `LLMModel`.
No changes required.

```typescript
type LLMModel = {
  id: string;         // stable model identifier (e.g. "anthropic/claude-sonnet-4.5")
  name: string;       // display name (e.g. "Claude 4.5 Sonnet")
  provider: string;   // derived from model id prefix (e.g. "Anthropic")
  description: string;
};
```

---

### ViewDataStepState (new)

Persisted slice of the wizard store representing Step 3 committed state. Written when
the user clicks "Run Evaluation" (success path). Read by Step 5 for result display.

```typescript
type ViewDataStepState = {
  evalModelId: string;        // id field from selected LLMModel
  evalModel: LLMModel;        // full model object for display in Step 4 and Step 5
};
```

**Validation rules**:
- `evalModelId` MUST be non-empty string and MUST match `evalModel.id`.
- `evalModel` MUST conform to the `LLMModel` shape before being written to the store.
- Written atomically — both fields set together via `setStep3()`.

---

### EvaluateRequest (new)

Request body sent to `POST /testcase/evaluate`. Field names match the backend
Pydantic `EvaluateRequest` model exactly.

```typescript
type EvaluateRequest = {
  main_prompt: string;     // mainPrompt from Step 1 store state
  main_model: string;      // targetModelId from Step 1 store state
  evaluate_model: string;  // evalModelId selected in Step 3
                           // NOTE: field is "evaluate_model" (not "eval_model")
};
```

**Validation rules**:
- All three fields MUST be non-empty strings before the request is fired.
- `evaluate_model` MUST match a model id returned by `/llm?type=evaluation`.

---

### EvaluateResponse (new)

Response body from `POST /testcase/evaluate`. The backend always returns HTTP 200;
the body shape indicates success or error.

```typescript
type EvaluateResponse = unknown;
```

**Runtime shape detection** (performed in `evaluationApi.ts`):
- Success: parsed body is a `string` (e.g. `"Evaluation completed successfully"`).
- Error: parsed body is an object with a string `error` field (e.g. `{"error": "..."}`).
- Any other shape: treated as an unknown error.

---

### GenerateState (local component state, existing pattern)

Used within `ViewDataStep` / `useViewDataStep` hook. Not persisted to the wizard store.

```typescript
type GenerateState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "success"; result: unknown }  // dataset JSON
  | { status: "error"; message: string };
```

---

### EvalModelsState (local hook state, new)

Used within `useViewDataStep` to track the evaluation model fetch independently
of the dataset generation state.

```typescript
type EvalModelsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; models: LLMModel[] };
```

---

### RunEvalState (local hook state, new)

Used within `useViewDataStep` to track the run evaluation submission state.

```typescript
type RunEvalState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "done" };  // success or error handled by separate error string
```

---

### ProgressState (local component state, new)

Used within `useRunningStep` to track the simulated progress animation.

```typescript
type ProgressState =
  | { status: "running"; percent: number }
  | { status: "complete" };
```

---

## Wizard Store Extension

`EvaluationWizardState` gains a `step3` field. No existing fields are modified.

```typescript
type EvaluationWizardState = {
  step1?: Step1State;          // existing
  step2?: DatasetStepState;    // existing
  step3?: ViewDataStepState;   // NEW
};
```

`EvaluationWizardStore` gains a `setStep3` action. `clear()` is extended to
reset step3 as well.

```typescript
type EvaluationWizardStore = {
  state: EvaluationWizardState;
  setStep1: (step1: Step1State) => void;    // existing
  setStep2: (step2: DatasetStepState) => void; // existing
  setStep3: (step3: ViewDataStepState) => void; // NEW
  clear: () => void;                        // extended to reset step3
};
```

---

## JsonViewer Props

```typescript
type JsonViewerProps = {
  value: unknown;       // the JSON data to display
  visible: boolean;     // controlled by parent (Hide/Show toggle)
};
```

---

## ProgressBar Props

```typescript
type ProgressBarProps = {
  percent: number;          // 0–100 inclusive
  durationMs?: number;      // total animation duration (default: 3000)
  className?: string;
};
```

---

## State Flow Diagram

```
Step 1 store (step1):
  mainPrompt ─────────────────────────────────────────────────► EvaluateRequest.main_prompt
  targetModelId ──────────────────────────────────────────────► EvaluateRequest.main_model

Step 2 store (step2):
  testCaseCount ──────────────────────────────────────────────► Step 4 subtitle (X)

Step 3 local state:
  GenerateState (running → success/error)                       Card 1 display
  EvalModelsState (loading → ready/error)                       Card 2 display
  selectedEvalModelId ────────────────────────────────────────► EvaluateRequest.evaluate_model

Step 3 store (step3) — written on "Run Evaluation" success:
  evalModelId ────────────────────────────────────────────────► Step 5
  evalModel ──────────────────────────────────────────────────► Step 5
```
