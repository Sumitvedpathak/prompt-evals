"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { NewEvalButton } from "@/components/ui/NewEvalButton";
import { StepStepper } from "@/components/ui/StepStepper";
import { useEvaluationWizard } from "@/features/evaluation/store/evaluationWizardStore";

export default function ResultsPage() {
  const router = useRouter();
  const { clear } = useEvaluationWizard();

  return (
    <div className="min-h-screen bg-[#0f0f1a] px-4 py-8 text-slate-100">
      <div className="mx-auto w-full max-w-5xl">
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

        <div className="mb-6">
          <StepStepper activeStep={5} />
        </div>

        <section className="rounded-2xl border border-[#2a2a3e] bg-[#1a1a2e] p-8 shadow-xl shadow-black/30">
          <div className="text-lg font-semibold text-slate-100">Step 5: Results</div>
          <div className="mt-2 text-sm text-slate-400">Results coming soon.</div>
        </section>

        <div className="mt-6">
          <NewEvalButton
            onConfirm={() => {
              clear();
              router.push("/");
            }}
          />
        </div>
      </div>
    </div>
  );
}
