# Feature Specification: Evaluation Results Dashboard

**Feature Branch**: `004-eval-results-dashboard`  
**Created**: 2026-05-10  
**Status**: Draft  
**Input**: User description: "Step 5 — Evaluation Results Dashboard"

## Clarifications

### Session 2026-05-10

- Q: Does `/eval/results` require a run/session identifier to know which evaluation to return? → A: No — the endpoint returns the most recent completed evaluation for the current session; no ID is passed in the request.
- Q: What scale do score and dimension values use in the API response? → A: 0–100 integers (e.g., `94`, `96`); displayed as-is with a `%` suffix appended.
- Q: Is the stepper on the Results page interactive (clickable) or display-only? → A: Interactive — Steps 1–4 are clickable and navigate the user back to that step to adjust inputs.
- Q: What filename should the exported PDF use? → A: `eval-results-YYYY-MM-DD.pdf`, using the current date at time of export.
- Q: How many times can the user retry a failed `/eval/results` load before a permanent error is shown? → A: Once — after a single failed retry, a permanent error state is shown with a "New Evaluation" button.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Evaluation Results After Completion (Priority: P1)

After the evaluation finishes running in Step 4, the user is automatically taken to the Results Dashboard (Step 5). The page loads and populates all summary cards, charts, and the results table from the evaluation API response. The user can immediately see which model performed best, its key metrics, and a visual breakdown of performance dimensions.

**Why this priority**: This is the primary deliverable of the entire evaluation wizard — without results, the tool has no value. Everything else in this flow leads to this moment.

**Independent Test**: Can be fully tested by navigating to the Results page with a valid completed evaluation state and verifying that all cards, charts, and the table populate with correct data from the API.

**Acceptance Scenarios**:

1. **Given** Step 4 completes successfully, **When** the evaluation finishes, **Then** the user is automatically redirected to Step 5 with the stepper showing Steps 1–4 complete and Step 5 active.
2. **Given** the Results page loads, **When** the `/eval/results` API responds successfully, **Then** all 3 summary cards display: Top Performer (model name + score), Avg Accuracy (percentage), and Tests Run (count from Step 2 state).
3. **Given** the Results page loads, **When** the API responds, **Then** the bar chart renders Score, Accuracy, and Consistency bars for each evaluated model.
4. **Given** the Results page loads, **When** the API responds, **Then** the radar chart displays a filled polygon across the Accuracy, Consistency, Creativity, and Safety axes for the evaluated model.
5. **Given** the Results page loads, **When** the API responds, **Then** the results table shows one row per evaluated model with columns: Model, Overall Score, Accuracy, Consistency, Creativity, and Safety (no Latency column).
6. **Given** the Results page loads at any time, **When** the page renders, **Then** the "Completed on [date]" label in the top-right corner shows the current system date at time of load.

---

### User Story 2 - Export Results as PDF (Priority: P2)

After reviewing the results, the user wants to share or archive the findings. They click "Export Results" and receive a PDF download of the full visible results page, including all cards, charts, and the comparison table.

**Why this priority**: Exporting is a high-value action that extends the utility of the tool beyond the session, but results are still readable without it.

**Independent Test**: Can be tested by loading a results page with data and clicking "Export Results," then verifying a PDF file is downloaded that includes the visible page content.

**Acceptance Scenarios**:

1. **Given** the Results page is loaded with data, **When** the user clicks "Export Results," **Then** a PDF file is downloaded containing the full visible results page.
2. **Given** the export is triggered, **When** the PDF generation fails, **Then** an inline error message appears near the "Export Results" button explaining the failure.

---

### User Story 3 - Start a New Evaluation (Priority: P3)

The user has reviewed the results and wants to run a fresh evaluation with different settings. They click "New Evaluation," which resets all wizard state and returns them to Step 1.

**Why this priority**: Enables iterative use of the tool, but the current session results are already delivered by P1.

**Independent Test**: Can be tested by clicking "New Evaluation" on the Results page and verifying the wizard resets to Step 1 with all previous inputs cleared.

**Acceptance Scenarios**:

1. **Given** the Results page is active, **When** the user clicks "New Evaluation," **Then** all wizard state is reset (main prompt, dataset, model selection, evaluation run) and the user is navigated to Step 1.

---

### User Story 4 - Handle Results Load Failure (Priority: P2)

If the results API call fails on page load, the user sees a clear full-page error state with a retry option so they are not left with a blank or broken screen.

**Why this priority**: Error handling is essential to usability; a failed load with no feedback would be a critical UX failure.

**Independent Test**: Can be tested by simulating a failed `/eval/results` call and verifying the error state and retry button appear.

**Acceptance Scenarios**:

1. **Given** the Results page loads, **When** `/eval/results` returns an error, **Then** a full-page error state is shown with an explanatory message and a "Retry" button.
2. **Given** the error state is displayed, **When** the user clicks "Retry," **Then** the page re-attempts the `/eval/results` call.
3. **Given** the Results page loads, **When** `/eval/results` returns an empty response, **Then** an empty state is shown with an explanatory message and a "New Evaluation" button.

---

### Edge Cases

- What happens when the `/eval/results` API is slow to respond? → A loading indicator is shown while the request is in flight.
- What happens if the Test Run count is missing from Step 2 state (e.g., user navigated directly to the page)? → The Tests Run card shows a fallback value (e.g., "—") rather than crashing.
- What happens if only one model was evaluated? → Charts and table render with a single model's data; the "Top Performer" card still shows that model.
- What happens if PDF export produces a partial capture (e.g., charts not rendered yet)? → The export waits for all visual elements to fully render before capturing.
- What happens when the user clicks a completed step in the stepper to navigate back? → The user is taken to that step with their previously entered inputs intact; the results from the current evaluation remain accessible only by navigating forward again through the wizard (they are not automatically re-shown until a new evaluation completes).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST automatically redirect the user from Step 4 to Step 5 upon evaluation completion, without requiring manual navigation.
- **FR-002**: On page load, the system MUST call the `/eval/results` endpoint with no run or session identifier; the endpoint returns the most recent completed evaluation automatically.
- **FR-003**: The page MUST display the horizontal 5-step stepper with Steps 1–4 marked complete and Step 5 active. Steps 1–4 MUST be clickable, navigating the user back to the selected step; wizard state from previous steps is preserved so the user can review and adjust inputs before re-running.
- **FR-004**: The system MUST display a "Completed on [date]" label in the top-right corner using the current system date at time of page load, not from the API response.
- **FR-005**: The system MUST display a "Top Performer" summary card showing the model name and overall score of the model with the highest `overall_score` in the evaluation summary.
- **FR-006**: The system MUST display an "Avg Accuracy" summary card showing the average accuracy value sourced from `dimension_scores` in the API response, labelled "Across all models."
- **FR-007**: The system MUST display a "Tests Run" summary card showing the `testCaseCount` value from Step 2 wizard state, labelled "Total evaluations."
- **FR-008**: The system MUST NOT display an "Avg Latency" summary card.
- **FR-009**: The system MUST render a bar chart titled "Overall Performance" with the X-axis showing evaluated model names, the Y-axis from 0–100, and bars representing Score, Accuracy, and Consistency per model, with a legend.
- **FR-010**: The system MUST render a radar/spider chart titled "Multi-Dimensional Analysis" with axes for Accuracy, Consistency, Creativity, and Safety, displaying a single filled polygon for the evaluated model's `dimension_scores`.
- **FR-011**: The system MUST display a results table with columns: MODEL, OVERALL SCORE, ACCURACY, CONSISTENCY, CREATIVITY, SAFETY — one row per evaluated model. The LATENCY column MUST be excluded.
- **FR-012**: When `/eval/results` fails to load, the system MUST display a full-page error state with an explanatory message and a "Retry" button. If the single retry attempt also fails, the Retry button MUST be replaced with a permanent error state and a "New Evaluation" button; no further retries are offered.
- **FR-013**: When `/eval/results` returns an empty result, the system MUST display an empty state with an explanatory message and a "New Evaluation" button.
- **FR-014**: The "Export Results" button MUST capture the full visible results page and download it as a PDF file named `eval-results-YYYY-MM-DD.pdf`, where the date reflects the current date at time of export.
- **FR-015**: When PDF export fails, the system MUST display an inline error message near the "Export Results" button.
- **FR-016**: The "New Evaluation" button MUST reset all evaluation wizard state and navigate the user to Step 1.
- **FR-017**: A loading indicator MUST be displayed while the `/eval/results` API call is in flight.

### Key Entities

- **Evaluation Summary**: Represents the aggregate outcome of an evaluation run — includes `overall_score` per model (0–100 integer) and serves as the source for the Top Performer card and bar chart.
- **Dimension Scores**: A set of per-dimension metric values for an evaluated model — includes Accuracy, Consistency, Creativity, and Safety — used for the radar chart and results table. All values are 0–100 integers; displayed with a `%` suffix.
- **Wizard State**: The accumulated inputs from Steps 1–4, specifically the `testCaseCount` from Step 2, consumed by the Results page without re-fetching.
- **Evaluation Results Response**: The API response from `/eval/results` containing the evaluation summary and dimension scores for all evaluated models.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The results page loads and displays all data within 3 seconds of the API responding for 95% of evaluation runs.
- **SC-002**: All 3 summary cards, both charts, and the results table are populated correctly from the API response on every successful load.
- **SC-003**: The "Export Results" PDF download completes successfully in under 10 seconds for 90% of export attempts.
- **SC-004**: Users can initiate a new evaluation within 2 clicks of viewing results (click "New Evaluation" → land on Step 1).
- **SC-005**: Error and empty states are displayed within 1 second of a failed or empty API response, without the page crashing or freezing.
- **SC-006**: The completion date shown on the page matches the current system date at time of load in 100% of cases.

## Assumptions

- The `/eval/results` endpoint is available and returns data in the agreed structure containing `evaluation_summary` (with `overall_score` per model) and `dimension_scores` (with Accuracy, Consistency, Creativity, Safety per model).
- Only one model is evaluated per run in the initial version; the charts and table are designed to accommodate multiple models but the primary tested scenario is a single model.
- The `testCaseCount` value from Step 2 wizard state is accessible in the global evaluation wizard store when the Results page mounts.
- The radar chart displays a single polygon for one evaluated model; multi-model radar charts are out of scope for this version.
- The "Avg Accuracy" card computes and displays the accuracy value from `dimension_scores`; if multiple models are evaluated, it shows the average across all models.
- PDF export captures the page as rendered in the browser; chart animations should complete before capture is initiated.
- The stepper component is shared with Steps 1–4 and requires no new stepper implementation for Step 5.
- Mobile responsiveness is out of scope for this version; the page targets desktop-width viewports.
