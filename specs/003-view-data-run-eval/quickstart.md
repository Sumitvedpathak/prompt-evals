# Quickstart: Step 3 — View Data & Run Evaluation + Step 4 — Running

**Branch**: `003-view-data-run-eval` | **Date**: 2026-05-10

## Prerequisites

Both the API and the frontend app must be running.

```powershell
# Terminal 1 — Backend (from src/api/)
py -m uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend (from src/app/)
npm run dev
```

Open `http://localhost:3000`.

---

## Happy path — full flow from Step 1

1. **Step 1** — Enter a main prompt (e.g. "Generate a WhatsApp message for a party
   invitation") and select a target model. Click "Next →".
2. **Step 2** — Dataset prompt auto-generates. Confirm or edit it. Set test case
   count (e.g. 5 for a quick test). Click "Generate Dataset →".
3. **Step 3 (Card 1)** — The page navigates to `/viewdata` and immediately begins
   generating the dataset. Wait for the "Dataset generated successfully" banner.
   - Click "Hide Dataset" → JSON viewer disappears; button changes to "Show Dataset".
   - Click "Show Dataset" → viewer reappears.
   - Click "Download JSON" → browser downloads `dataset.json`.
4. **Step 3 (Card 2)** — Evaluation models load in the grid below.
   - Select one model card. "Run Evaluation" becomes enabled.
   - Select a different model. First card deselects; new card is selected.
5. **Run Evaluation** — Click the "Run Evaluation →" button.
   - Page navigates immediately to `/running`.
6. **Step 4** — Progress bar animates from 0% to 100% over ~3 seconds with a live
   percentage label.
   - On completion: success message appears, "View Results →" becomes enabled.
   - Click "View Results →" → navigates to `/results` (Step 5 placeholder).

---

## Testing failure states

### Card 2 — Evaluation model fetch failure

To simulate a model fetch error, temporarily break the endpoint (e.g. stop the
backend) and reload Step 3. Card 2 should show a full-card error with a "Retry"
button. Card 1 (dataset viewer) should remain functional.

### Run Evaluation — API error

Open browser DevTools → Network tab → right-click the `/testcase/evaluate` request
and block it (or stop the backend after dataset generation). Click "Run Evaluation".
An inline error message should appear below Card 2. "Run Evaluation" becomes
re-enabled. The page does NOT navigate to Step 4.

### Step 4 — After run evaluation error

If the backend returns an error body (`{"error": "..."}`) from `/testcase/evaluate`,
the page still navigates to Step 4 with a loading bar... 

Wait — per the clarification: Run Evaluation error shows inline on **Step 3**, and
does NOT navigate to Step 4. Step 4 is only reached on success. (Step 4's "error
state" refers to a scenario where the Step 3 API call returned success but the
message the API returned is an error — which does not apply given the current backend
returns a clean success string.)

---

## Navigation tests

| Action | Expected result |
|---|---|
| Step 3 → "← Back to Step 2" | Navigate to `/dataset`; model selection retained |
| Step 3 → navigate back, return to `/viewdata` | Dataset re-generates (local state cleared on unmount) |
| Step 3 → "New Eval" → confirm | All state cleared; navigate to `/` (Step 1) |
| Step 4 → "← Back to Step 3" | Navigate to `/viewdata`; evaluation model still selected |
| Step 4 → "New Eval" → confirm | All state cleared; navigate to `/` (Step 1) |
| Step 4 success → "View Results →" | Navigate to `/results` |

---

## API verification (manual)

```powershell
# Verify evaluation model list
curl http://localhost:8000/llm?type=evaluation

# Submit an evaluation (replace values with your Step 1/3 selections)
curl -X POST http://localhost:8000/testcase/evaluate `
  -H "Content-Type: application/json" `
  -d '{"main_prompt":"test prompt","main_model":"openai/gpt-4o","evaluate_model":"openai/gpt-5"}'
```

Expected responses:
- GET `/llm?type=evaluation` → JSON array with 4 models (GPT-5, Claude 4.5 Sonnet,
  Claude Opus 4.6, Gemini 1.5/2.0 Pro).
- POST `/testcase/evaluate` → `"Evaluation completed successfully"` (may take
  several minutes for real evaluation runs; use a small dataset count for testing).
