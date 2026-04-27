## Prompt Evals UI (`src/app`)

Next.js App Router frontend for the Prompt Evals system.

### Environment variables

Create `src/app/.env.local` with:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

All API URLs MUST be constructed from this base URL and named endpoint constants (no hardcoded URLs
in components or hooks).

## Getting Started

From `src/app/`, run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Project structure (contract)

See repository root `README.md` for the required `src/app/src/` layout.
