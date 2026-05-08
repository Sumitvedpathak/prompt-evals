# Feature Specification: Dataset Generation (Step 2)

**Feature Branch**: `002-dataset-generation`  
**Created**: 2026-04-27  
**Status**: Draft  
**Input**: User description: "Step 2 — Dataset Generation (Wizard Step 2 of 5). User writes a dataset generation prompt, selects a dataset model, sets number of test cases (default 100), can refine the dataset prompt, and can generate the dataset which navigates to Step 3 with a progress bar. Includes blocked UI on model fetch failure/empty and inline errors for refine/generate failures."

## Clarifications

### Session 2026-04-27

- Q: What is the endpoint/query to fetch dataset-generation models? → A: `GET /llm?type=dataset`
- Q: What is the Step 2 refine contract? → A: `POST /refine` with `{ type: "dataset", prompt, target_model }` → `{ refined_prompt }`.
- Q: What is the generate-dataset response type (job vs immediate)? → A: Immediate response (no job id). The generate endpoint returns the dataset in the response body.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate a dataset and proceed to Step 3 (Priority: P1)

As a user evaluating a production prompt, I want to configure dataset generation (prompt, model, and
count) and start dataset generation so I can advance to the next step while the dataset is created.

**Why this priority**: This step produces the test dataset; without it, later evaluation steps cannot run.

**Independent Test**: Can be tested by loading Step 2, selecting a dataset model, entering a prompt,
setting a valid count, clicking Generate Dataset, and verifying navigation to Step 3 with the Step 2
state available.

**Acceptance Scenarios**:

1. **Given** dataset models load successfully, **When** the user enters a non-empty dataset prompt,
   selects a model, and enters a valid positive integer count, **Then** "✦ Generate Dataset" becomes
   enabled.
2. **Given** Step 2 inputs are valid, **When** the user clicks "✦ Generate Dataset", **Then** the app
   submits the dataset configuration and navigates to Step 3 where a progress bar is visible.

---

### User Story 2 - Refine the dataset generation prompt (Priority: P2)

As a user, I want to refine my dataset generation prompt so I can produce higher-quality test cases.

**Why this priority**: Improves quality and saves time, but users can still proceed without refinement.

**Independent Test**: Can be tested by entering a dataset prompt, selecting a model, clicking Refine,
and verifying the textarea content is replaced with the refined prompt.

**Acceptance Scenarios**:

1. **Given** the dataset prompt textarea is non-empty, **When** the user clicks Refine, **Then** the UI
   calls the refine API and replaces textarea content with the refined prompt on success.
2. **Given** the refine call fails, **When** the error is received, **Then** an inline error is shown
   below the textarea and the existing content remains unchanged.

---

### User Story 3 - Block the step when dataset models cannot be loaded (Priority: P3)

As a user, I want a clear error and retry path when dataset models cannot be loaded so I understand
why I cannot proceed.

**Why this priority**: Model selection is required for generation; proceeding without models is not possible.

**Independent Test**: Can be tested by forcing the dataset model fetch to fail and verifying the
entire Step 2 UI is blocked with a retry option.

**Acceptance Scenarios**:

1. **Given** dataset model fetch fails or returns an empty list, **When** Step 2 renders, **Then** the
   entire Step 2 UI is blocked and a retry option is shown.

### Edge Cases

- Dataset count input:
  - Whitespace/empty input is treated as invalid
  - Non-integer values are invalid
  - Zero/negative values are invalid
- Refresh/back navigation:
  - Returning to Step 2 should retain Step 2 state (prompt, selected model, count)
- Generate Dataset failure:
  - Inline error is shown; user remains on Step 2 with inputs preserved

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present Step 2 of a 5-step evaluation wizard with the shared stepper:
  Step 1 marked complete, Step 2 active, Steps 3–5 inactive and not clickable.
- **FR-002**: The system MUST render a content card titled "Step 2: Dataset Generation" with subtitle
  "Generate a dataset of test cases to evaluate your prompt across different models."
- **FR-003**: The system MUST provide a labeled textarea "Dataset Generation Prompt" with an in-border
  "✦ Refine" button in the textarea's top-right corner.
- **FR-004**: The system MUST fetch available dataset models on initial page load and populate a model
  selector grid labeled "Select Model for Dataset Generation".
- **FR-005**: The model selector MUST use the same 3-column radio-card grid pattern as Step 1 and MUST
  allow single selection.
- **FR-006**: The system MUST provide a labeled number input "Number of Test Cases" with default value
  100.
- **FR-007**: "✦ Generate Dataset" MUST be disabled until ALL are true:
  - Dataset prompt contains at least one non-whitespace character after trimming
  - A dataset model is selected
  - Test case count is a valid positive integer
- **FR-008**: On Refine click, the system MUST submit the dataset prompt and selected model to the
  refine API and replace textarea content with the refined result on success.
- **FR-009**: If refine fails, the system MUST show an inline error below the textarea and MUST
  preserve the existing textarea content.
- **FR-010**: On "✦ Generate Dataset" click, the system MUST persist the Step 2 state and navigate to
  Step 3 immediately. Step 3 MUST show an indeterminate progress bar while the dataset generation request
  is in progress, and MUST show a success message when the dataset response is received (no job id).
- **FR-011**: If generate dataset fails, the system MUST show an inline error and MUST remain on Step 2
  with the user's inputs preserved.
- **FR-012**: If dataset model fetch fails or returns empty, the system MUST block the entire Step 2 UI
  and show a retry action.
- **FR-013**: Step 2 state MUST be retained and available to Steps 3–5:
  `datasetPrompt`, `datasetModelId`, full `datasetModel` object, and `testCaseCount`.
- **FR-014**: The wizard UI MUST provide a "New Eval" action on every step. On click, it MUST show a
  confirmation modal (Yes/No). If the user confirms, the wizard state MUST be cleared and the user
  MUST be returned to Step 1 with default values.

### Key Entities *(include if feature involves data)*

- **Dataset Model**: A selectable LLM option used to generate dataset cases (stable id, display name,
  description).
- **Step 2 State**: Dataset prompt text, selected dataset model (id + full object), and test case count.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When model fetch succeeds, users see the dataset model grid populated within 3 seconds.
- **SC-002**: With valid inputs, "✦ Generate Dataset" enables immediately (no perceptible delay).
- **SC-003**: Clicking "✦ Generate Dataset" transitions to Step 3 and Step 2 state is available in Step 3.
- **SC-004**: When model fetch fails or returns empty, Step 2 shows a clear blocked error state with retry.

## Assumptions

- Step 2 will use the same backend model-list mechanism as Step 1, but filtered to dataset-generation models.
  Endpoint: `GET /llm?type=dataset`.
- Step 2 refine uses `POST /refine` with `{ type: "dataset", prompt, target_model }` and returns
  `{ refined_prompt }` (same response shape as Step 1).
- Generate Dataset uses a backend endpoint that accepts dataset prompt + model + count and returns the
  dataset in the response body (no job id). Step 3 shows a progress bar while waiting for the response.

