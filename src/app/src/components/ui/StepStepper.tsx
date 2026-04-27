import React from "react";

const STEPS = ["Main Prompt", "Dataset", "View Data", "Running", "Results"] as const;

export function StepStepper({ activeStep }: { activeStep: number }) {
  return (
    <nav aria-label="Evaluation steps" className="w-full">
      <ol className="flex items-center gap-3 overflow-x-auto py-1 text-sm">
        {STEPS.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === activeStep;
          const isComplete = stepNum < activeStep;

          const circleClass = isActive
            ? "border-blue-600 bg-blue-600 text-white"
            : isComplete
              ? "border-blue-600 bg-white text-blue-600"
              : "border-slate-300 bg-white text-slate-500";

          const labelClass = isActive
            ? "text-blue-700"
            : isComplete
              ? "text-slate-700"
              : "text-slate-500";

          return (
            <React.Fragment key={label}>
              <li
                className="flex shrink-0 items-center gap-2"
                aria-current={isActive ? "step" : undefined}
              >
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
              </li>
              {idx < STEPS.length - 1 && (
                <li aria-hidden="true" className="shrink-0 text-slate-300">
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

