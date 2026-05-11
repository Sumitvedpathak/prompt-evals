# Research: Evaluation Results Dashboard (Step 5)

**Branch**: `004-eval-results-dashboard` | **Date**: 2026-05-10

## 1. Recharts — Installation and Usage

**Decision**: Install `recharts` as a production dependency via npm.

**Rationale**: Recharts is the specified charting library; it is React 19 compatible, supports `ResponsiveContainer` for fluid layouts, and has first-class TypeScript types via `@types/recharts` (bundled in newer versions). It avoids the complexity of a full chart library (e.g. Chart.js + adapter) while supporting all required chart types (BarChart, RadarChart).

**Installation**:
```bash
cd src/app
npm install recharts
```

**BarChart pattern** (Overall Performance):
```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Data shape per model group
type BarChartEntry = { model: string; score: number; accuracy: number; consistency: number };

<ResponsiveContainer width="100%" height={280}>
  <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis dataKey="model" tick={{ fontSize: 12 }} />
    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
    <Tooltip />
    <Legend verticalAlign="bottom" />
    <Bar dataKey="score"       name="Score"       fill="#3b82f6" />
    <Bar dataKey="accuracy"    name="Accuracy"    fill="#22c55e" />
    <Bar dataKey="consistency" name="Consistency" fill="#f59e0b" />
  </BarChart>
</ResponsiveContainer>
```

**RadarChart pattern** (Multi-Dimensional Analysis):
```tsx
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

// Data shape per dimension axis
type RadarChartEntry = { dimension: string; value: number };
// Axes: Accuracy, Consistency, Creativity, Safety

<ResponsiveContainer width="100%" height={280}>
  <RadarChart data={radarChartData}>
    <PolarGrid />
    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
    <Radar name="Model" dataKey="value" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.5} />
  </RadarChart>
</ResponsiveContainer>
```

**Alternatives considered**: Chart.js + react-chartjs-2 (heavier, requires Canvas adapter), Victory (larger bundle, less commonly used), D3 (too low-level for this use case).

---

## 2. PDF Export — window.print() Approach

**Decision**: Use native `window.print()` triggered by the "Export Results" button, with a `@media print` CSS block that hides navigation elements and ensures charts render fully.

**Rationale**: No third-party PDF library is required per spec. `window.print()` is universally available in desktop browsers, produces a faithful rendering of the visible page, and avoids adding a large dependency (e.g. jsPDF + html2canvas). The filename is set by the browser's print dialog; custom filename (`eval-results-YYYY-MM-DD.pdf`) is communicated to the user as a recommended save name via the `document.title` being set at render time.

**Print media query** (add to `globals.css`):
```css
@media print {
  .no-print {
    display: none !important;
  }

  body {
    background: white !important;
    background-image: none !important;
    color: black !important;
  }

  /* Ensure recharts SVGs render at full size */
  .recharts-responsive-container {
    width: 100% !important;
    page-break-inside: avoid;
  }
}
```

Elements to mark with `no-print`: the horizontal stepper, the "New Evaluation" button, and the "Export Results" button itself.

**Custom filename pattern**: Set `document.title` to `eval-results-YYYY-MM-DD` before calling `window.print()`, then restore the original title afterward. The browser's "Save as PDF" dialog will use this as the default filename.

**Alternatives considered**: jsPDF + html2canvas (adds ~200KB to bundle, requires canvas rendering workarounds for SVG charts), Puppeteer server-side (adds backend complexity, not necessary for a client-side capture).

---

## 3. StepStepper — Clickable Completed Steps

**Decision**: Extend `StepStepper` with an optional `onStepClick?: (step: number) => void` prop. When provided, completed steps (those with `stepNum < activeStep`) render as `<button>` elements. When absent, behavior is unchanged (backward-compatible).

**Current behavior**: `StepStepper` is a pure display component; step indicators are `<span>` elements inside a `<li>`.

**Required change** (non-breaking):
```tsx
export function StepStepper({
  activeStep,
  onStepClick,
}: {
  activeStep: number;
  onStepClick?: (step: number) => void;
}) {
  // For completed steps (stepNum < activeStep), if onStepClick is defined:
  // wrap the step indicator in a <button onClick={() => onStepClick(stepNum)}>
  // Add cursor-pointer and hover styles for interactive completed steps
}
```

**ResultsStep usage**:
```tsx
const router = useRouter();
<StepStepper
  activeStep={5}
  onStepClick={(step) => {
    const routes: Record<number, string> = {
      1: "/", 2: "/dataset", 3: "/viewdata", 4: "/running"
    };
    if (routes[step]) router.push(routes[step]);
  }}
/>
```

**Rationale**: Backward-compatible extension; existing step pages pass no `onStepClick` and continue to render statically.

---

## 4. Backend API Contract Discrepancy

**Current state** (from `src/api/main.py` and `src/api/service/service.py`):
- Method: `POST /eval/results`
- Response: `{ results: RawEvalItem[] }` where `RawEvalItem` includes the full dataset item plus an `evaluation` sub-object
- The `evaluation_confidence` and `recommended_action` fields live inside `evaluation.dashboard_metadata`

**Required state** (per user-confirmed contract):
- Method: `GET /eval/results`
- Response: `EvalResult[]` directly (an array, not wrapped in `{ results: ... }`)
- Each `EvalResult` is the `evaluation` sub-object from the current output, with `evaluation_confidence` and `recommended_action` promoted from `dashboard_metadata`

**Backend changes needed** (flagged for explicit user authorization per Constitution VI):
1. Change `@app.post("/eval/results")` → `@app.get("/eval/results")`
2. Update `get_evaluation_results()` in `service.py` to extract and reshape each item's `evaluation` sub-object, promoting `dashboard_metadata.evaluation_confidence` and `dashboard_metadata.recommended_action` to the top level
3. Update `EvaluationResultsResponse` Pydantic model or return the list directly

**Frontend adapter approach** (alternative, avoiding backend changes): The frontend `getEvalResults()` function could internally normalize `response.results[i].evaluation` — but this hides a contract mismatch and violates Principle I (contracts-first). Preferred approach: fix the backend and expose the clean contract.

**Action required**: Before the backend implementation task begins, the user must explicitly confirm authorization to modify `src/api/main.py` and `src/api/service/service.py`.

---

## 5. Light Theme for Step 5

**Decision**: Step 5 uses a light theme (white/light-gray background, colored card accents) per the provided design mockup, departing from the dark theme used in Steps 1–4 (`bg-[#0f0f1a]`).

**Rationale**: The user-provided screenshot clearly shows a light theme. The spec says "light theme consistent with Steps 1 and 2" — this refers to the intended design of the Results page as a summary/report surface, not the current dark implementation of those steps.

**Color palette** (from screenshot analysis):
- Page background: `bg-white` or `bg-gray-50`
- Card backgrounds: white with colored left-border or top accent
- Top Performer card: amber/gold accent (`bg-amber-50`, border/text `amber-500`)
- Avg Accuracy card: blue accent (`bg-blue-50`, border/text `blue-500`)
- Tests Run card: purple accent (`bg-purple-50`, border/text `purple-500`)
- Charts section: white card with `border border-gray-200 rounded-xl`
- Table: white with `border-b border-gray-100`, alternating `bg-gray-50`
- Text: `text-gray-900` (headings), `text-gray-500` (labels), `text-gray-700` (body)

**Note**: The page-level `body` background in `globals.css` applies to all pages. The `ResultsStep` component overrides via its own `className` (e.g., `min-h-screen bg-gray-50`). No global CSS changes are needed for the theme shift.

---

## 6. testCaseCount — Store Access Pattern

**Decision**: `useResultsStep` reads `testCaseCount` from the wizard store via `useEvaluationWizard().state.step2?.testCaseCount ?? null`. If `null` (direct URL navigation, bypassed Step 2), the Tests Run card displays `"—"` as a fallback.

**Rationale**: Matches the existing pattern in `useRunningStep.ts` which reads `state.step2?.testCaseCount ?? 0`. Using `null` (not `0`) as the fallback makes missing state visually distinguishable.

---

## 7. Completion Date Derivation

**Decision**: `completionDate` is derived at hook mount time as:
```typescript
const completionDate = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD" format
```

Using `en-CA` locale produces `YYYY-MM-DD` format natively in all browsers. The value is stored in a `useRef` inside `useResultsStep` so it doesn't change on re-renders (the date is captured once at mount, not recalculated on every render).

**PDF export filename**: Before calling `window.print()`, set `document.title = \`eval-results-${completionDate}\`` and restore it afterward via a try/finally block.
