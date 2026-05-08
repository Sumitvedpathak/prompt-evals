# Research: Dataset Generation (Step 2)

## Decisions

### API response typing for `POST /generate/create`

- **Decision**: Define `GenerateCreateResponse` as `unknown` in TypeScript until the backend response schema is finalized.
- **Rationale**: The feature requirements explicitly mark the response as placeholder. Step 2 behavior only requires that the request succeeds and the UI navigates to Step 3.
- **Alternatives considered**:
  - Define a speculative dataset schema now → rejected to avoid contract drift and breaking changes.

### UI error/loading patterns

- **Decision**: Reuse the Step 1 patterns: skeleton model cards while loading; full-card blocked error state on model fetch failure/empty; inline errors for refine/generate failures.
- **Rationale**: Consistency across wizard steps and alignment with constitution “phased vertical slices” and “UI loading/error states for every API call”.

### Testing approach

- **Decision**: Keep UI testing **out of scope** for Step 2 planning unless a test harness already exists in `src/app` (to be revisited during `/speckit-tasks` if needed).
- **Rationale**: No explicit test framework is established in the feature inputs. We will still enforce lint/typecheck gates.

