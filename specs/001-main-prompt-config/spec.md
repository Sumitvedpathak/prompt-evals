# Feature Specification: Main Prompt Configuration (Step 1)

**Feature Branch**: `001-main-prompt-config`  
**Created**: 2026-04-26  
**Status**: Draft  
**Input**: User description: "Step 1 — Main Prompt Configuration (Wizard Step 1 of 5) for the LLM Evaluation UI. User enters a main prompt, selects a target model, can refine the prompt via API, and proceeds to Step 2 with state preserved. Includes stepper, model grid, loading/disabled rules, and error handling for model list and refine."

## Clarifications

### Session 2026-04-26

- Q: Is a target model required in Step 1, and does it affect refinement? → A: Target model selection is required for Step 1 state and later dataset execution; Refine uses the selected target model to refine the user-written prompt for that model.
- Q: What parameters does the `/refine` request accept for Step 1? → A: `type=main` (always), `prompt=<textarea>`, `target_model=<selected model>`.
- Q: What should happen if `/llm` fails or returns 0 models? → A: Block the entire Step 1 UI (including textarea) until models can be loaded; show a clear error state with retry.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure and proceed to Step 2 (Priority: P1)

As a user evaluating a production prompt, I want to enter my main prompt, pick a target model, and
continue to the next wizard step so the rest of the evaluation pipeline uses my choices.

**Why this priority**: This is the entry gate into the evaluation flow; without it, none of the
remaining steps can run.

**Independent Test**: Can be fully tested by loading the page, entering a prompt, selecting a model,
clicking Next, and verifying the app navigates to Step 2 with the entered prompt and model available.

**Acceptance Scenarios**:

1. **Given** the Step 1 page is loaded and the model list request succeeds, **When** the user types a
   non-empty prompt and selects a model, **Then** Refine and Next become enabled.
2. **Given** the user has entered a non-empty prompt and selected a model, **When** the user clicks
   "Next: Dataset Generation →", **Then** the app navigates to Step 2 and the Step 1 state is
   preserved for later steps in the wizard.

---

### User Story 2 - Refine the main prompt (Priority: P2)

As a user, I want to refine my main prompt against the selected target model so I can quickly improve
prompt quality before generating datasets and running evaluations.

**Why this priority**: Refinement improves usability and reduces trial-and-error, but the wizard can
still proceed without refinement.

**Independent Test**: Can be fully tested by entering a prompt, clicking Refine, and verifying the
prompt text is replaced by the refine response.

**Acceptance Scenarios**:

1. **Given** the user has entered a non-empty prompt and a model is selected, **When** the user clicks
   Refine, **Then** the UI calls the refine API with `type=main`, the current prompt, and the selected
   model, shows a loading state, prevents editing the textarea during the request, and replaces the
   textarea content with the refined prompt returned by the API.
2. **Given** the refine request fails, **When** the UI receives an error, **Then** an inline error is
   shown and the existing textarea content is preserved.

---

### User Story 3 - Continue even if model list fails to load (Priority: P3)

As a user, I want a clear error and recovery path when the model list cannot be loaded so I
understand why I cannot proceed and can retry.

**Why this priority**: Model selection is mandatory for Step 1; when models cannot load, the UI must
fail clearly rather than allowing partial progress that cannot proceed.

**Independent Test**: Can be fully tested by simulating an `/llm` failure and verifying the Step 1
controls are disabled while a clear error + retry affordance is shown.

**Acceptance Scenarios**:

1. **Given** the model list request fails, **When** the page renders, **Then** the model grid shows an
   error state, the textarea and primary actions are disabled, and a retry mechanism is presented.

### Edge Cases

- `/llm` returns an empty list: treat as an error/blocked state (no model can be selected); show a
  clear message and retry.
- `/llm` returns more than 6 models: the grid remains usable in a 3-column layout (wrapping or scroll
  is acceptable) and selection remains single-choice.
- Refreshing the page: if Step 1 state was previously set, the prompt/model are restored (so the user
  can continue without re-entering data).
- Slow `/refine`: the refine action remains visibly in-progress; the textarea is not editable until
  completion; the user cannot double-submit refine.
- Model not selected: Refine and Next remain disabled even if the prompt is non-empty.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present Step 1 of a 5-step evaluation wizard with a horizontal stepper
  showing: Main Prompt (active), Dataset, View Data, Running, Results (inactive and not clickable).
- **FR-002**: The system MUST render a page header containing an app icon, the title
  "LLM Evaluation System", and the subtitle "Test and compare language models with custom prompts and datasets".
- **FR-003**: The system MUST render a single primary content card titled
  "Step 1: Main Prompt Configuration" with the provided subtitle text.
- **FR-004**: The system MUST provide a labeled textarea "Main Prompt to Test" with the provided
  placeholder text.
- **FR-005**: The system MUST render a "✦ Refine" action within the prompt input area and MUST keep it
  disabled until the user has entered non-empty prompt text and selected a target model.
- **FR-005a**: For the purposes of enabling Refine and Next, "non-empty prompt text" MUST mean the
  prompt contains at least one non-whitespace character after trimming.
- **FR-006**: The system MUST fetch available target models on initial page load and display them in a
  model selection grid labeled "Select Model for Main Prompt" by calling `GET /llm?type=target`.
- **FR-006a**: If the model list response contains at least one model, the system MUST pre-select the
  first model by default.
- **FR-007**: The model selection UI MUST support single selection and MUST visually highlight the
  selected model card.
- **FR-008**: The system MUST keep the "Next: Dataset Generation →" button disabled until the user has
  entered non-empty prompt text and selected a target model.
- **FR-009**: When the user clicks Refine, the system MUST call the refine API using the current
  prompt text, the selected target model, and `type=main`, and MUST replace the textarea content with
  the `refined_prompt` value returned by the API.
- **FR-010**: While a refine request is in-flight, the system MUST show a loading state for Refine and
  MUST prevent editing of the textarea until the call completes.
- **FR-011**: If the model list request fails, the system MUST show an error state in the model grid
  and MUST disable the Step 1 inputs/actions until models can be loaded.
- **FR-011a**: When the model list request fails or returns zero models, the UI MUST provide a retry
  mechanism to attempt loading models again.
- **FR-012**: If the refine request fails, the system MUST show an inline error near the prompt input
  and MUST preserve the existing prompt text.
- **FR-013**: On clicking Next, the system MUST navigate to Step 2 and MUST preserve Step 1 state
  (prompt text and selected model) such that it is available to subsequent wizard steps.
- **FR-015**: The wizard UI MUST provide a "New Eval" action on every step. On click, it MUST show a
  confirmation modal (Yes/No). If the user confirms, the wizard state MUST be cleared and the user
  MUST be returned to Step 1 with default values.
- **FR-014**: The system MUST be responsive and MUST define behavior at these viewport widths:
  - Mobile: < 640px
  - Tablet: 640px–1023px
  - Desktop: ≥ 1024px
  At minimum:
  - The model selection grid MUST be 1 column (mobile), 2 columns (tablet), and 3 columns (desktop).
  - The stepper MUST remain usable on mobile (labels must not overlap); wrapping or horizontal scrolling
    is acceptable as long as the active step remains visually clear.
  - The "Next" button MUST remain accessible without requiring horizontal scrolling.

### Key Entities *(include if feature involves data)*

- **Target Model**: A selectable model option displayed to the user (name, provider name, short
  description, and a stable identifier). The selected target model is used in later steps to run the
  main prompt against generated dataset cases.
- **Step 1 State**: The user-entered prompt text and selected target model; carried forward to later
  steps of the wizard.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can load Step 1 and see the model grid populated (when `/llm` succeeds) within
  3 seconds on a typical broadband connection.
- **SC-002**: With a non-empty prompt, Refine and Next become enabled immediately (no perceptible delay
  to the user).
- **SC-003**: On successful refine, the prompt textarea content is replaced with the API response and
  remains stable when navigating to Step 2 and back (state preserved).
- **SC-004**: When `/llm` fails (or returns 0 models), the UI shows a clear error state with a retry
  path, and the Step 1 inputs/actions are disabled to prevent proceeding with incomplete state.
- **SC-005**: At viewport widths of 390px (mobile), 768px (tablet), and 1280px (desktop), Step 1 remains
  usable without horizontal scrolling for the main content card, and the model grid column count matches
  the responsive requirement (1/2/3 respectively).

## Assumptions

- The UI will call backend HTTP endpoints `/llm?type=target` (for target model list) and `/refine`
  (for prompt refinement), as described in the acceptance checks.
- The model list provides enough information to render each model card (name, model, description)
  and includes a stable model identifier for later wizard steps (the `model` field).
- Step 2 exists and can consume the Step 1 state (prompt + selected model) provided by Step 1.
