# Quickstart: Evaluation Results Dashboard (Step 5)

**Branch**: `004-eval-results-dashboard` | **Date**: 2026-05-10

---

## Prerequisites

- Backend (`src/api/`) running on `http://localhost:8000`
- Backend `GET /eval/results` endpoint returning the correct shape (see `contracts/http-api.md`)
- A completed evaluation run so `dataset_output.json` exists and is non-empty
- Node.js + npm installed

---

## 1. Install recharts

```powershell
cd src/app
npm install recharts
```

Verify it appears in `package.json` under `dependencies`.

---

## 2. Start the Frontend Dev Server

```powershell
cd src/app
npm run dev
```

App available at `http://localhost:3000`.

---

## 3. Start the Backend (if not already running)

```powershell
cd src/api
py -m uvicorn main:app --reload --port 8000
```

---

## 4. Run a Full Evaluation Flow to Populate Results

To see the Results page with real data:

1. Open `http://localhost:3000`
2. Complete Step 1 — enter a main prompt and select a target model
3. Complete Step 2 — configure dataset (prompt, model, test case count)
4. Complete Step 3 — select an evaluation model
5. Complete Step 4 — wait for the evaluation to finish, then click "View Results"
6. Step 5 Results Dashboard loads automatically

---

## 5. Verify the Results Page

On the Results page, check:

- [ ] Stepper shows Steps 1–4 complete, Step 5 active
- [ ] "Completed on YYYY-MM-DD" shows today's date (top right)
- [ ] Top Performer card: shows model name (from Step 1) and overall score percentage
- [ ] Avg Accuracy card: shows accuracy percentage
- [ ] Tests Run card: shows test case count from Step 2
- [ ] Bar chart renders Score, Accuracy, Consistency bars for the model
- [ ] Radar chart renders a filled polygon across Accuracy, Consistency, Creativity, Safety
- [ ] Results table shows one row with correct values; no Latency column
- [ ] Clicking a completed step (1–4) in the stepper navigates back to that step

---

## 6. Verify Error States

To test the error state:

1. Stop the backend server
2. Navigate to `http://localhost:3000/results`
3. Verify a full-page error state appears with a "Retry" button
4. Click "Retry" — verify another attempt is made
5. Verify that after the retry also fails, the Retry button is replaced with a permanent error and "New Evaluation" button

To test the empty state:

```powershell
# Temporarily rename the output file to simulate an empty response
cd src/api/resources
Rename-Item dataset_output.json dataset_output.json.bak
# Create an empty array file
Set-Content -Path dataset_output.json -Value "[]"
```

Then navigate to `http://localhost:3000/results` and verify the empty state message and "New Evaluation" button appear.

Restore:
```powershell
Remove-Item dataset_output.json
Rename-Item dataset_output.json.bak dataset_output.json
```

---

## 7. Verify PDF Export

1. On the Results page, click "Export Results"
2. The browser's print dialog opens
3. Select "Save as PDF"
4. Verify the filename pre-filled is `eval-results-YYYY-MM-DD`
5. Verify the saved PDF contains: summary cards, both charts, results table
6. Verify the stepper, "New Evaluation" button, and "Export Results" button do NOT appear in the PDF

---

## 8. Run the Linter

```powershell
cd src/app
npm run lint
```

Expected: zero errors, zero warnings related to the new files.

---

## 9. Verify New Evaluation Flow

1. On the Results page, click "New Evaluation"
2. Verify the wizard resets and you land on Step 1
3. Verify all wizard state is cleared (main prompt, model selection, dataset config)

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Charts don't render | Verify `recharts` is in `node_modules`; run `npm install` |
| "Avg Latency" card appears | Check that the Avg Latency card instance was not implemented; it must be absent |
| Latency column in table | Remove it — only MODEL, OVERALL SCORE, ACCURACY, CONSISTENCY, CREATIVITY, SAFETY |
| `/eval/results` returns 405 Method Not Allowed | Backend still has `POST`; change to `GET` per contract |
| `/eval/results` returns `{ results: [...] }` instead of `[...]` | Backend wrapping needs to be removed per contract |
| PDF includes nav buttons | Ensure stepper, nav row elements have `no-print` class |
| PDF export filename not pre-filled | Check that `document.title` is set before `window.print()` |
