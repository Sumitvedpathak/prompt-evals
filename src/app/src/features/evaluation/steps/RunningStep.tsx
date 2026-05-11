"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { NewEvalButton } from "@/components/ui/NewEvalButton";
import { StepStepper } from "@/components/ui/StepStepper";
import { useEvaluationWizard } from "@/features/evaluation/store/evaluationWizardStore";
import { useRunningStep } from "@/features/evaluation/hooks/useRunningStep";

export function RunningStep() {
  const router = useRouter();
  const { clear } = useEvaluationWizard();
  const { runState, isComplete, isSuccess, testCaseCount, evalModelCount } = useRunningStep();

  return (
    <div className="min-h-screen bg-[#0f0f1a] px-4 py-8 text-slate-100">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <header className="mb-6 flex items-start gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-sm font-bold text-white">
            LLM
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-semibold tracking-tight text-slate-100">
              LLM Evaluation System
            </div>
            <div className="mt-1 text-sm text-slate-400">
              Test and compare language models with custom prompts and datasets
            </div>
          </div>
        </header>

        {/* Stepper */}
        <div className="mb-6">
          <StepStepper activeStep={4} />
        </div>

        {/* Running card */}
        <section className="rounded-2xl border border-[#2a2a3e] bg-[#1a1a2e] p-8 shadow-xl shadow-black/30">
          <div className="flex flex-col items-center gap-6 text-center">
            {/* App icon */}
            <div className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-violet-600/30 to-fuchsia-500/30 ring-1 ring-violet-500/40">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="size-8 text-violet-300"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-xl font-semibold text-slate-100">Running Evaluation</h1>
              <p className="mt-1 text-sm text-slate-400">
                Testing {evalModelCount} model across {testCaseCount} test cases
              </p>
            </div>

            {/* Progress or result */}
            <div className="w-full max-w-md">
              {runState.status === "loading" && (
                <div className="space-y-2">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div className="animate-indeterminate absolute h-2 w-2/5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500" />
                  </div>
                  <div className="text-center text-sm text-slate-400">Running...</div>
                </div>
              )}

              {runState.status === "success" && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 px-6 py-4">
                  <div className="font-semibold text-emerald-400">
                    {runState.message}
                  </div>
                  <div className="mt-1 text-sm text-emerald-300">
                    Your results are ready to view.
                  </div>
                </div>
              )}

              {runState.status === "error" && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-6 py-4">
                  <div className="font-semibold text-rose-300">Evaluation failed</div>
                  <div className="mt-1 text-sm text-rose-400">{runState.message}</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Navigation row */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <NewEvalButton
            onConfirm={() => {
              clear();
              router.push("/");
            }}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => router.push("/viewdata")}
              className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800"
            >
              ← Back to Step 3
            </button>
            <button
              type="button"
              disabled={!isSuccess}
              onClick={() => router.push("/results")}
              className={[
                "inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm",
                isSuccess
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400"
                  : "cursor-not-allowed bg-slate-800 text-slate-500",
              ].join(" ")}
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                  clipRule="evenodd"
                />
              </svg>
              View Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
