# Data Model: Evaluation Results Dashboard (Step 5)

**Branch**: `004-eval-results-dashboard` | **Date**: 2026-05-10

---

## 1. API Response Types (add to `src/types/evaluation.ts`)

These types represent the exact shape of the `GET /eval/results` response and are the source of truth for frontend integration.

```typescript
// Aggregate outcome of a single evaluation run for one model.
export type EvaluationSummary = {
  overall_score: number; // 0–100 integer
  grade: string;         // e.g. "Poor", "Good", "Excellent"
  pass: boolean;
};

// Per-dimension metric values. All values are 0–100 integers.
export type DimensionScores = {
  accuracy: number;
  consistency: number;
  creativity: number;
  safety: number;
  instruction_adherence: number;
  naturalness: number;
  brevity_efficiency: number;
};

// One evaluated result item, corresponding to one test case.
export type EvalResult = {
  id: string;
  category: string;
  difficulty: string;
  evaluation_summary: EvaluationSummary;
  dimension_scores: DimensionScores;
  detected_failure_modes: string[];
  detected_strengths: string[];
  detected_issues: string[];
  evaluation_confidence: number; // 0–100 integer; from dashboard_metadata in raw output
  recommended_action: string;    // e.g. "fail", "pass"; from dashboard_metadata in raw output
};

// The full response from GET /eval/results.
export type EvalResultsResponse = EvalResult[];
```

---

## 2. Derived UI Types (local to feature — not exported from `evaluation.ts`)

These are computed by `useResultsStep` and passed to chart/table components. They are not API types.

```typescript
// One group of bars per model in the Overall Performance chart.
export type BarChartEntry = {
  model: string;       // targetModel.name from Step 1 store
  score: number;       // evaluation_summary.overall_score (averaged across all results)
  accuracy: number;    // dimension_scores.accuracy (averaged)
  consistency: number; // dimension_scores.consistency (averaged)
};

// One spoke per dimension in the Multi-Dimensional Analysis radar chart.
export type RadarChartEntry = {
  dimension: string; // "Accuracy" | "Consistency" | "Creativity" | "Safety"
  value: number;     // corresponding dimension_scores value (averaged if multiple results)
};

// One row in the results comparison table.
export type ResultTableRow = {
  model: string;        // targetModel.name from Step 1 store
  overallScore: number; // evaluation_summary.overall_score (averaged)
  accuracy: number;
  consistency: number;
  creativity: number;
  safety: number;
};
```

---

## 3. Component Prop Types

### SummaryCard

```typescript
// src/components/ui/SummaryCard.tsx
export type SummaryCardProps = {
  title: string;
  value: string;
  subtitle: string;
  accentColor: "gold" | "blue" | "purple";
  icon: React.ReactNode;
};
```

**Instances**:

| Card | `title` | `value` | `subtitle` | `accentColor` |
|---|---|---|---|---|
| Top Performer | `"Top Performer"` | `targetModel.name` | `overall_score + "% score"` | `"gold"` |
| Avg Accuracy | `"Avg Accuracy"` | `avgAccuracy + "%"` | `"Across all models"` | `"blue"` |
| Tests Run | `"Tests Run"` | `testCaseCount ?? "—"` | `"Total evaluations"` | `"purple"` |

### BarChart (Overall Performance)

```typescript
// src/components/ui/BarChart.tsx
export type OverallPerformanceChartProps = {
  data: BarChartEntry[];
};
```

### RadarChart (Multi-Dimensional Analysis)

```typescript
// src/components/ui/RadarChart.tsx
export type MultiDimensionalChartProps = {
  data: RadarChartEntry[];
};
```

### ResultsTable

```typescript
// src/components/ui/ResultsTable.tsx
export type ResultsTableProps = {
  rows: ResultTableRow[];
};
```

---

## 4. useResultsStep Hook Interface

```typescript
// src/features/evaluation/hooks/useResultsStep.ts
export type UseResultsStepReturn = {
  // Fetch state
  results: EvalResultsResponse | null;
  isLoading: boolean;
  isError: boolean;
  retryCount: number;   // 0 = no retry attempted; 1 = retry fired; used to gate Retry → permanent error
  refetch: () => void;

  // Derived display values
  completionDate: string;    // "YYYY-MM-DD" captured at mount
  testCaseCount: number | null; // from Step 2 store; null if not available
  topPerformer: string;      // targetModel.name (Step 1 store); always the evaluated model name
  avgAccuracy: number;       // average accuracy across all EvalResults (or 0 if empty)
  overallScore: number;      // average overall_score across all EvalResults

  // Chart / table data
  barChartData: BarChartEntry[];
  radarChartData: RadarChartEntry[];
  tableRows: ResultTableRow[];
};
```

---

## 5. Data Mapping

### averageResults helper

When `EvalResultsResponse` contains multiple items (e.g. one per test case), the dashboard aggregates values for display:

```
avgOverallScore = mean(results[i].evaluation_summary.overall_score)
avgAccuracy     = mean(results[i].dimension_scores.accuracy)
avgConsistency  = mean(results[i].dimension_scores.consistency)
avgCreativity   = mean(results[i].dimension_scores.creativity)
avgSafety       = mean(results[i].dimension_scores.safety)
```

The model name always comes from the Step 1 wizard store (`targetModel.name`), not from the API response (since the API response represents per-test-case evaluations, not per-model labels).

### barChartData mapping

```
barChartData = [{
  model:       targetModel.name,
  score:       round(avgOverallScore),
  accuracy:    round(avgAccuracy),
  consistency: round(avgConsistency),
}]
```

### radarChartData mapping

```
radarChartData = [
  { dimension: "Accuracy",    value: round(avgAccuracy) },
  { dimension: "Consistency", value: round(avgConsistency) },
  { dimension: "Creativity",  value: round(avgCreativity) },
  { dimension: "Safety",      value: round(avgSafety) },
]
```

### tableRows mapping

```
tableRows = [{
  model:        targetModel.name,
  overallScore: round(avgOverallScore),
  accuracy:     round(avgAccuracy),
  consistency:  round(avgConsistency),
  creativity:   round(avgCreativity),
  safety:       round(avgSafety),
}]
```

---

## 6. Wizard Store — Read-Only Access from Step 5

Step 5 reads the following from `useEvaluationWizard()`:

| Store field | Used for | Fallback |
|---|---|---|
| `state.step1?.targetModel.name` | Model name label in all UI surfaces | `"Unknown Model"` |
| `state.step2?.testCaseCount` | Tests Run card value | `null` → displays `"—"` |
| `clear()` | "New Evaluation" button | — |

Step 5 does **not** call `setStep1`, `setStep2`, `setStep3`, or write to session storage.

---

## 7. Entity Lifecycle

```
EvalResult (API) ──averageResults──► aggregated numbers
                                        │
              ┌─────────────────────────┼────────────────────┐
              ▼                         ▼                    ▼
        BarChartEntry[]          RadarChartEntry[]     ResultTableRow[]
              │                         │                    │
         BarChart.tsx            RadarChart.tsx        ResultsTable.tsx
              │                         │                    │
              └─────────────────────────┴────────────────────┘
                                        │
                                  ResultsStep.tsx
```

The `SummaryCard` instances are fed directly from `useResultsStep` return values (`topPerformer`, `avgAccuracy`, `overallScore`, `testCaseCount`) — they don't consume chart data arrays.
