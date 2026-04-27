"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { NewEvalButton } from "@/components/ui/NewEvalButton";
import { StepStepper } from "@/components/ui/StepStepper";
import { useEvaluationWizard } from "@/features/evaluation/store/evaluationWizardStore";

export default function DatasetStepPlaceholderPage() {
  const router = useRouter();
  const { state, clear } = useEvaluationWizard();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6 flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-sm font-bold text-white">
          LLM
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-semibold tracking-tight text-slate-900">
            LLM Evaluation System
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Test and compare language models with custom prompts and datasets
          </div>
        </div>
      </header>

      <div className="mb-6">
        <StepStepper activeStep={2} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold text-slate-900">Step 2: Dataset Generation</div>
        <div className="mt-1 text-sm text-slate-600">
          Placeholder page. This exists to validate Step 1 navigation and shared state.
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">Step 1 state</div>
          <pre className="mt-2 overflow-auto text-xs text-slate-700">
            {JSON.stringify(state.step1 ?? null, null, 2)}
          </pre>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <NewEvalButton
            onConfirm={() => {
              clear();
              router.push("/");
            }}
          />
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Back to Step 1
          </button>
        </div>
      </section>
    </div>
  );
}

