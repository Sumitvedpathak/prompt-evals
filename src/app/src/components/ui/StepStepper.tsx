import React from "react";

const STEPS = ["Main Prompt", "Dataset", "View Data", "Running", "Results"] as const;

const STEP_ROUTES: Record<number, string> = {
  1: "/",
  2: "/dataset",
  3: "/viewdata",
  4: "/running",
};

export function StepStepper({
  activeStep,
  onStepClick,
}: {
  activeStep: number;
  onStepClick?: (step: number) => void;
}) {
  return (
    <nav aria-label="Evaluation steps" className="w-full">
      <ol className="flex items-center gap-3 overflow-x-auto py-1 text-sm">
        {STEPS.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === activeStep;
          const isComplete = stepNum < activeStep;
          const isClickable = isComplete && !!onStepClick && stepNum in STEP_ROUTES;

          const circleClass = isActive
            ? "border-violet-500 bg-violet-500 text-white shadow-[0_0_20px_rgba(167,139,250,0.5)]"
            : isComplete
              ? "border-violet-400 bg-violet-500/10 text-violet-200"
              : "border-slate-700 bg-slate-900 text-slate-400";

          const labelClass = isActive
            ? "text-violet-200"
            : isComplete
              ? "text-slate-200"
              : "text-slate-400";

          const stepContent = (
            <>
              <span
                className={[
                  "grid size-6 place-items-center rounded-full border text-xs font-semibold",
                  circleClass,
                ].join(" ")}
              >
                {stepNum}
              </span>
              <span className={["whitespace-nowrap font-medium", labelClass].join(" ")}>
                {label}
              </span>
            </>
          );

          return (
            <React.Fragment key={label}>
              <li
                className="flex shrink-0 items-center gap-2"
                aria-current={isActive ? "step" : undefined}
              >
                {isClickable ? (
                  <button
                    type="button"
                    onClick={() => onStepClick(stepNum)}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    aria-label={`Go to step ${stepNum}: ${label}`}
                  >
                    {stepContent}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">{stepContent}</div>
                )}
              </li>
              {idx < STEPS.length - 1 && (
                <li aria-hidden="true" className="shrink-0 text-slate-600">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-4"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06-1.06l4.24 4.24a.75.75 0 0 1 0 1.06l-4.24 4.24a.75.75 0 0 1-1.06.02Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

