# UX Requirements Quality Checklist: Main Prompt Configuration (Step 1)

**Purpose**: Validate UX requirements completeness/clarity/consistency for Step 1 before implementation  
**Created**: 2026-04-26  
**Feature**: `../spec.md`

## Requirement Completeness

- [x] CHK001 Are all required screen sections explicitly specified (header, stepper, single content card, prompt input, model grid, Next button)? [Completeness, Spec §FR-001–FR-004]
- [x] CHK002 Is the stepper content fully specified (exact step names, active/inactive behavior, non-clickable steps 2–5)? [Completeness, Spec §FR-001]
- [x] CHK003 Are the exact header strings fully specified (title + subtitle), including whether they are copy-locked? [Clarity, Spec §FR-002]
- [x] CHK004 Are the content card title and subtitle text fully specified (including whether they are copy-locked)? [Clarity, Spec §FR-003]
- [x] CHK005 Is the prompt textarea placeholder text fully specified and copy-locked? [Clarity, Spec §FR-004]
- [x] CHK006 Are model card fields fully specified (radio presence, bold name, muted provider, description) rather than implied? [Gap, Completeness]
- [x] CHK007 Is the model grid size/shape specified (e.g., “6 cards shown”, “3 columns on desktop”) and what happens when the API returns fewer/more than 6 models? [Completeness, Spec §Edge Cases]
- [x] CHK008 Are selection visuals specified beyond “highlighted border” (e.g., what constitutes “selected” state for radio + card)? [Clarity, Spec §FR-007]
- [x] CHK009 Is the “Next” button visual style requirement specified at the UX level (e.g., gradient style) or intentionally left to design system defaults? [Gap]

## Requirement Clarity (Interaction & States)

- [x] CHK010 Are enable/disable rules for Refine and Next stated without ambiguity (prompt non-empty AND model selected)? [Clarity, Spec §FR-005, §FR-008]
- [x] CHK011 Is “non-empty prompt” clearly defined (e.g., whitespace-only counts as empty)? [Ambiguity, Spec §FR-005, §FR-008]
- [x] CHK012 Is the refine in-flight state specified clearly (loading indicator, textarea read-only, double-submit prevention)? [Clarity, Spec §FR-010; Spec §Edge Cases]
- [x] CHK013 Is the refine success behavior specified precisely (replace content with `refined_prompt` and whether selection/model remains unchanged)? [Clarity, Spec §FR-009]
- [x] CHK014 Is the refine error presentation specified (exact placement “below textarea”, error persistence/dismiss rules)? [Clarity, Plan §UX behavior mapping; Spec §FR-012]
- [x] CHK015 Is the retry behavior for `/llm` failure specified (what triggers retry, whether it re-shows loading skeleton, whether errors reset)? [Clarity, Spec §FR-011a]

## Scenario Coverage (Primary / Exception / Recovery)

- [x] CHK016 Are primary scenarios defined for: models load → user types → refine optional → next? [Coverage, Spec §User Story 1–2]
- [x] CHK017 Are exception scenarios defined for `/llm` fail AND `/llm` empty array (treated equivalently)? [Coverage, Spec §FR-011/§FR-011a; Spec §Edge Cases]
- [x] CHK018 Are recovery scenarios defined after `/llm` failure (retry succeeds → UI becomes interactive; prior inputs preserved or reset)? [Gap, Recovery Flow]
- [x] CHK019 Are exception scenarios defined for `/refine` fail (inline error + preserve prompt, what about re-trying refine)? [Coverage, Spec §FR-012]
- [x] CHK020 Are loading scenarios defined for `/llm` (skeleton grid) AND for `/refine` (spinner) with clear non-interactability rules? [Coverage, Plan §UX behavior mapping; Spec §FR-010]

## Requirement Consistency (No contradictions)

- [x] CHK021 Are the “blocked UI” rules for `/llm` failure consistent across User Stories, FRs, Edge Cases, and Success Criteria? [Consistency, Spec §User Story 3; §FR-011; §SC-004]
- [x] CHK022 Do acceptance scenarios align with the FRs regarding when Refine/Next become enabled? [Consistency, Spec §Acceptance Scenarios vs §FR-005/§FR-008]
- [x] CHK023 Are “pre-select first model” rules consistent across spec, contracts, and plan? [Consistency, Spec §FR-006a; Contracts §GET /llm; Plan Summary]

## Responsiveness & Layout (required)

- [x] CHK024 Are responsive breakpoints explicitly specified (at minimum: mobile/tablet/desktop) for the model grid columns and overall card layout? [Gap, Responsiveness Required]
- [x] CHK025 Is the behavior specified for long model names/descriptions on narrow screens (wrap/truncate rules)? [Gap, Responsiveness]
- [x] CHK026 Is the placement behavior specified for the Refine button within the prompt input on small screens (still in-border vs moves)? [Gap, Responsiveness]
- [x] CHK027 Is the stepper responsiveness specified (e.g., compress labels, wrap, or scroll on mobile)? [Gap, Responsiveness]
- [x] CHK028 Is the “Next” button placement specified on small screens (still bottom-right vs full-width vs sticky)? [Gap, Responsiveness]

## Dependencies & Assumptions (UX-impacting)

- [x] CHK029 Does the spec clearly state that the API base URL and endpoint paths must be centralized (no hardcoded URLs), and is the UX impact of misconfiguration addressed (e.g., user-visible error)? [Completeness, Plan §API client; Spec §Assumptions]
- [x] CHK030 Is state persistence across steps defined at a UX level (what the user sees on refresh/back navigation)? [Clarity, Spec §Edge Cases; Plan §State management]

## Accessibility (explicitly not mandatory yet)

- [x] CHK031 Does the spec explicitly declare whether accessibility requirements are in-scope or out-of-scope for Step 1 (keyboard navigation, focus states, ARIA labeling)? [Gap, Scope Declaration]

## Notes

- This checklist is intentionally **layout-focused** (not pixel-perfect). If pixel-perfect matching becomes a requirement, add explicit typography/spacing/token requirements to the spec and extend this checklist.
