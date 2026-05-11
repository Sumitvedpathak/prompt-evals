# Feature Specification: Step 3 — View Data & Run Evaluation

**Feature Branch**: `003-view-data-run-eval`
**Created**: 2026-05-10
**Status**: Draft
**Input**: User description: "Step 3 — View Data & Run Evaluation"

## Clarifications

### Session 2026-05-10

- Q: Does the Run Evaluation API return a run ID or other value that Step 5 needs? → A: The API returns a success message or error message. Step 4 stays on screen and displays the result based on the API response. No run ID is stored.
- Q: Is the Step 3 evaluation model grid populated from the same LLM endpoint as Steps 1/2 or a separate one? → A: Same `/llm` endpoint, filtered by `type=evaluation_llms`.
- Q: What actions are available on Step 4 when the evaluation API returns an error? → A: Step 4 always shows three bottom buttons: "New Eval", "← Back to Step 3", and "View Results →". "View Results →" is disabled while the API is in-flight and on error; it becomes enabled only when the API returns success.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Review Dataset and Download (Priority: P1)

The user arrives at Step 3 directly after completing Step 2. The generated dataset JSON
is immediately visible in a scrollable viewer. The user can toggle the viewer on/off and
download the dataset as a JSON file for offline inspection before proceeding.

**Why this priority**: Reviewing and downloading the dataset is the primary purpose of
Step 3. Without it the step has no value, and it requires no model selection to be useful.

**Independent Test**: Navigate to Step 3 with a completed Step 2; confirm dataset JSON
is shown instantly, Hide/Show toggle works, and Download JSON triggers a file download.

**Acceptance Scenarios**:

1. **Given** the user completed Step 2 and the dataset was generated, **When** Step 3
   loads, **Then** the dataset JSON is displayed immediately in the scrollable viewer
   without any additional fetch.
2. **Given** the viewer is visible, **When** the user clicks "Hide Dataset", **Then**
   the JSON viewer disappears and the button label changes to "Show Dataset".
3. **Given** the viewer is hidden, **When** the user clicks "Show Dataset", **Then**
   the JSON viewer reappears and the button label reverts to "Hide Dataset".
4. **Given** the viewer is visible, **When** the user clicks "Download JSON", **Then**
   the browser downloads a `.json` file containing the dataset.

---

### User Story 2 — Select Evaluation Model (Priority: P2)

The user selects exactly one evaluation model from a grid of available models. The
"Run Evaluation" button remains disabled until a selection is made. Only one card can be
selected at a time (radio-style within a checkbox-styled grid).

**Why this priority**: Model selection gates the evaluation run; it must work correctly
before the run flow can be built, but the dataset review step above is independently
testable without it.

**Independent Test**: Load Step 3; verify evaluation model grid populates from the API,
one card can be selected at a time, and "Run Evaluation" toggles from disabled to enabled
upon selection.

**Acceptance Scenarios**:

1. **Given** Step 3 loads, **When** evaluation models are fetched successfully, **Then**
   the model grid is populated with one card per available model.
2. **Given** the model grid is populated, **When** the user selects a model card,
   **Then** that card shows as selected (checked) and "Run Evaluation" becomes enabled.
3. **Given** one model is already selected, **When** the user selects a different model,
   **Then** the first model deselects and only the new model is marked as selected.
4. **Given** the model grid is populated and no model has been selected, **Then**
   "Run Evaluation" is disabled.
5. **Given** the evaluation model fetch fails or returns an empty list, **When** Step 3
   loads, **Then** Card 2 shows a full-card error state with a Retry button; Card 1
   remains fully usable.

---

### User Story 3 — Run Evaluation & Transition to Step 4 (Priority: P3)

The user clicks "Run Evaluation" after selecting a model. The wizard navigates to Step 4
immediately and displays a loading/progress indicator while the evaluation API call is
in-flight. When the API responds, Step 4 shows the result: a success message with a
"View Results →" button on success, or an error message on failure. The user stays on
Step 4 in both cases.

**Why this priority**: The run transition depends on US1 (dataset) and US2 (model
selection) being complete. It is the culmination of the wizard's forward flow.

**Independent Test**: With a model selected, click "Run Evaluation"; confirm navigation
to Step 4 is immediate, the loading indicator is visible while the API is in-flight, and
the correct success or error message is shown when the API responds.

**Acceptance Scenarios**:

1. **Given** a model is selected, **When** the user clicks "Run Evaluation", **Then**
   the evaluation job is submitted and the app navigates to Step 4 immediately.
2. **Given** Step 4 is active and the API call is in-flight, **Then** a progress/loading
   indicator is shown, the subtitle reads "Testing 1 model across [X] test cases" where
   X matches the test case count from Step 2, and the three bottom buttons ("New Eval",
   "← Back to Step 3", "View Results →") are visible — with "View Results →" disabled.
3. **Given** the API call returns a success response, **Then** the loading indicator
   stops, a success message (from the API response) is shown on Step 4, and
   "View Results →" becomes enabled.
4. **Given** the success state, **When** the user clicks "View Results →", **Then**
   the wizard navigates to Step 5.
5. **Given** the API call returns an error response, **Then** the loading indicator
   stops, an error message (from the API response) is shown on Step 4, and
   "View Results →" remains disabled; "New Eval" and "← Back to Step 3" are available.

---

### User Story 4 — Navigation Continuity (Priority: P4)

The user can move backwards to Step 2 without losing any Step 3 selections, and can
restart the entire wizard from Step 3 via "New Eval".

**Why this priority**: Navigation correctness is a hygiene concern; it does not affect
the core evaluation flow but is required for a complete UX.

**Independent Test**: Select a model, click "← Back", return to Step 3; verify the
selection is still present. Click "New Eval"; verify all wizard state is cleared and
Step 1 loads.

**Acceptance Scenarios**:

1. **Given** the user has selected an evaluation model, **When** the user clicks
   "← Back", **Then** the wizard returns to Step 2 and the model selection is retained
   in state.
2. **Given** the user returns to Step 3 from Step 2, **Then** the previously selected
   model remains selected.
3. **Given** the user clicks "New Eval" from Step 3, **Then** all wizard state is
   cleared and the app navigates to Step 1.
4. **Given** the user clicks "New Eval" from Step 4, **Then** all wizard state is
   cleared and the app navigates to Step 1.

---

### Edge Cases

- What happens when the evaluation model list is empty? → Card 2 shows an error/empty
  state with a Retry button; Card 1 remains functional.
- What happens if the user navigates to Step 3 directly without completing Step 2?
  → Assume Step 2 state is always present (wizard enforces sequential completion); no
  special handling required in this spec.
- What if "Download JSON" is clicked and the dataset is very large? → Browser handles
  the download; no size validation needed for v1.
- What if the user clicks "Run Evaluation" twice rapidly? → The button is disabled
  immediately on first click to prevent duplicate submissions.
- What if the user clicks "← Back to Step 3" on Step 4 while the API call is still
  in-flight? → The navigation proceeds; the in-flight request is abandoned. Step 3
  state (selected model) is still intact.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Step 3 MUST display the dataset JSON generated in Step 2 immediately on
  page load without making an additional API call.
- **FR-002**: The dataset viewer MUST be scrollable to handle datasets of arbitrary size.
- **FR-003**: Users MUST be able to toggle the dataset viewer visibility; button label
  MUST reflect current state ("Hide Dataset" / "Show Dataset").
- **FR-004**: Users MUST be able to download the dataset as a `.json` file via a browser
  download triggered by "Download JSON".
- **FR-005**: Step 3 MUST fetch available evaluation models on page load by calling the
  `/llm` endpoint with `type=evaluation_llms` and display the results in a model card
  grid.
- **FR-006**: Users MUST be able to select exactly one evaluation model at a time from
  the grid (radio-style selection with checkbox-styled cards).
- **FR-007**: The "Run Evaluation" button MUST be disabled until an evaluation model is
  selected.
- **FR-008**: On "Run Evaluation" click the system MUST submit the evaluation job (main
  prompt + main model from Step 1 + selected evaluation model) and immediately navigate
  to Step 4; the API call is awaited on Step 4, not Step 3.
- **FR-009**: Step 4 MUST show a loading/progress indicator while the evaluation API
  call is in-flight; the "Run Evaluation" button on Step 3 MUST be disabled on first
  click to prevent duplicate submissions.
- **FR-010**: If evaluation model fetch fails or returns no models, Card 2 MUST show a
  full-card error state with a Retry button; Card 1 MUST remain fully functional.
- **FR-011**: Step 4 MUST always display three bottom navigation buttons: "New Eval",
  "← Back to Step 3", and "View Results →". "View Results →" MUST be disabled while
  the API call is in-flight and when the API returns an error; it MUST be enabled only
  when the API returns a success response.
- **FR-012**: Step 4 subtitle MUST read "Testing [N] model(s) across [X] test cases"
  where N = 1 and X = testCaseCount from Step 2 wizard state.
- **FR-013**: When the evaluation API returns a success response, Step 4 MUST replace
  the loading indicator with the success message from the API response and enable
  "View Results →".
- **FR-014**: When the evaluation API returns an error response, Step 4 MUST replace
  the loading indicator with the error message from the API response; "View Results →"
  remains disabled.
- **FR-015**: Clicking "View Results →" (when enabled) MUST navigate to Step 5.
- **FR-016**: "New Eval" (on Step 3 or Step 4) MUST clear all wizard state and navigate
  to Step 1.
- **FR-017**: "← Back to Step 3" on Step 4 MUST return to Step 3 without losing Step 3
  state (selected evaluation model retained in the wizard store).
- **FR-018**: "← Back" on Step 3 MUST return to Step 2 without losing Step 3 state
  (selected evaluation model retained in the wizard store).
- **FR-019**: The stepper MUST reflect the current step accurately across Steps 3 and 4.
- **FR-020**: Steps 3 and 4 MUST use the dark theme throughout (background, stepper,
  cards, buttons, navigation row).

### Key Entities

- **EvaluationModel**: An LLM available for judging/evaluating prompt outputs. Attributes:
  `id`, `name`, `provider`, `description`.
- **EvaluationJob**: The submitted job containing main prompt, main model, selected
  evaluation model, dataset reference, and test case count.
- **WizardStep3State**: Persisted state for Step 3 — `evalModelId: string`,
  `evalModel: EvaluationModel | null`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The dataset JSON viewer is visible within 1 second of Step 3 loading
  (no additional network request required — data is already in state).
- **SC-002**: The evaluation model grid is populated within 3 seconds of Step 3 loading
  under normal local-dev network conditions.
- **SC-003**: Hide/Show dataset toggle responds within 100 ms (visual state change is
  immediate).
- **SC-004**: "Download JSON" triggers a browser file download within 1 second of the
  button click.
- **SC-005**: The "Run Evaluation" button transitions from disabled to enabled within
  100 ms of a model card being selected.
- **SC-006**: Navigation from Step 3 to Step 4 occurs within 500 ms of "Run Evaluation"
  being clicked.
- **SC-007**: The Step 4 loading/progress indicator is visible within 200 ms of
  navigating to Step 4, and remains visible for the full duration of the API call.
- **SC-008**: The success or error message from the API is displayed on Step 4 within
  500 ms of the API response being received.
- **SC-009**: "New Eval" returns the user to Step 1 with all state cleared within
  500 ms.
- **SC-010**: All failure states (model fetch error, evaluation API error) are communicated
  to the user with a visible, descriptive message within 1 second of the error being
  received; error messages use the text returned by the API where available.

## Assumptions

- The dataset JSON from Step 2 is already available in the wizard store when Step 3
  mounts; no re-fetch of the dataset is needed.
- Evaluation models are fetched from the `/llm` endpoint with `type=evaluation_llms`,
  the same endpoint used in Steps 1 and 2 with a different type filter.
- The evaluation run submission is a single synchronous API call. The API returns either
  a success message or an error message. Step 4 awaits this response and displays the
  result; no polling or background job tracking is needed.
- The "Run Evaluation" API request body includes at minimum: main prompt text, main
  model ID (from Step 1), selected evaluation model ID, and dataset/test case count
  from Step 2.
- Only one evaluation model can be selected at a time (radio semantics); multi-model
  evaluation is out of scope for this step.
- "View Results →" navigates to Step 5, which is a future step and only needs to be
  reachable; its implementation is out of scope for this spec.
- Dark theme applies to all UI surfaces on Steps 3 and 4 (background, stepper, cards,
  buttons, navigation row) and must match the dark navy style from the reference
  screenshot.
- Navigation from Step 3 back to Step 2 must not trigger a re-fetch of the dataset;
  the dataset remains in state.
