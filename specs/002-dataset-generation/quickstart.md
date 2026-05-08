# Quickstart: Dataset Generation (Step 2)

## Prereqs

- Backend running (FastAPI) on `http://localhost:8000`
- Frontend running (Next.js) on `http://localhost:3000`
- Frontend env var set: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`

## Run

### Backend

From repository root:

```bash
python -m uvicorn src.api.main:app --reload --port 8000
```

### Frontend

From `src/app/`:

```bash
npm install
npm run dev
```

## Manual test plan (Step 2)

1. Navigate to Step 2 route: `/dataset`
2. Verify model grid shows loading skeletons, then loads dataset models from `GET /llm?type=dataset`
3. Verify first model is pre-selected by default
4. Enter a dataset prompt; verify Refine enables when prompt is non-empty (trimmed)
5. Click Refine; verify textarea becomes read-only and on success is replaced by `refined_prompt`
6. Set Number of Test Cases:
   - entering `0`, negative numbers, or non-integers shows inline validation error and blocks generation
7. Click Generate Dataset; verify immediate navigation to Step 3 with a visible indeterminate progress bar
8. When the API returns, verify Step 3 shows a success message (dataset display will come later) and Step 2 state is persisted

## Failure modes

- Force `GET /llm?type=dataset` to fail/return empty: Step 2 should show a blocked full-card error with Retry.
- Force `POST /refine` to fail: inline error below textarea; prompt preserved.
- Force `POST /generate/create` to fail: Step 3 should show a failure message and a way to return to Step 2; Step 2 inputs preserved.

