"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { JsonViewer } from "@/components/ui/JsonViewer";
import { ModelCard } from "@/components/ui/ModelCard";
import { NewEvalButton } from "@/components/ui/NewEvalButton";
import { StepStepper } from "@/components/ui/StepStepper";
import { useViewDataStep } from "@/features/evaluation/hooks/useViewDataStep";

export function ViewDataStep() {
  const router = useRouter();
  const {
    step2,
    genState,
    dataset,
    showDataset,
    toggleDataset,
    downloadDataset,
    retryGenerate,
    evalModelsState,
    evalModels,
    selectedEvalModelId,
    onSelectEvalModel,
    retryLoadEvalModels,
    canRunEval,
    onRunEval,
    clear,
  } = useViewDataStep();

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
          <StepStepper activeStep={3} />
        </div>

        {/* Card 1 — View Data */}
        <section className="rounded-2xl border border-[#2a2a3e] bg-[#1a1a2e] p-6 shadow-xl shadow-black/30">
          <div className="mb-5">
            <div className="text-lg font-semibold text-slate-100">Step 3: View Data</div>
            <div className="mt-1 text-sm text-slate-400">
              We generate your dataset here, then you can inspect and download it as JSON.
            </div>
          </div>

          {!step2 && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-4">
              <div className="font-semibold text-rose-200">Missing Step 2 configuration</div>
              <div className="mt-1 text-sm text-rose-300">
                Go back to Step 2 to configure a prompt, model, and test case count.
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => router.push("/dataset")}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                >
                  Back to Step 2
                </button>
              </div>
            </div>
          )}

          {step2 && genState.status === "running" && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-300">Generating dataset...</div>
              <div
                role="progressbar"
                aria-label="Generating dataset"
                className="h-2 w-full overflow-hidden rounded-full bg-slate-800"
              >
                <div className="h-2 w-1/2 animate-pulse rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500" />
              </div>
              <div className="text-xs text-slate-500">
                Model: {step2.datasetModel.name} · Count: {step2.testCaseCount}
              </div>
            </div>
          )}

          {step2 && genState.status === "error" && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-4">
              <div className="font-semibold text-rose-200">Generation failed</div>
              <div className="mt-1 text-sm text-rose-300">{genState.message}</div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={retryGenerate}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {step2 && genState.status === "success" && (
            <div className="space-y-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4">
              <div className="font-semibold text-emerald-400">Dataset generated successfully</div>
              <div className="text-sm text-emerald-300">
                Generation is complete. You can view the dataset below and download it as JSON.
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={toggleDataset}
                  className="rounded-xl border border-emerald-500/50 bg-emerald-950/40 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-900/50"
                >
                  {showDataset ? "Hide Dataset" : "Show Dataset"}
                </button>
                <button
                  type="button"
                  onClick={downloadDataset}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white hover:from-violet-500 hover:to-fuchsia-400"
                >
                  Download JSON
                </button>
              </div>
              <JsonViewer value={dataset} visible={showDataset} />
            </div>
          )}
        </section>

        {/* Card 2 — Select Evaluation Model */}
        <section className="mt-4 rounded-2xl border border-[#2a2a3e] bg-[#1a1a2e] p-6 shadow-xl shadow-black/30">
          <div className="mb-5 flex items-start gap-3">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="mt-0.5 size-5 shrink-0 text-slate-400"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 0 1 2-2h4.586A2 2 0 0 1 12 2.586L15.414 6A2 2 0 0 1 16 7.414V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Zm2 6a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm1 3a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2H7Z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <div className="text-lg font-semibold text-slate-100">
                Select Models for Evaluation
              </div>
              <div className="mt-1 text-sm text-slate-400">
                Choose which models you want to test with your prompt and dataset.
              </div>
            </div>
          </div>

          {evalModelsState.status === "loading" && (
            <div className="space-y-3">
              <div className="h-4 w-40 rounded bg-slate-800" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-xl border border-slate-800 bg-slate-900/60" />
                ))}
              </div>
            </div>
          )}

          {evalModelsState.status === "error" && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-4">
              <div className="font-semibold text-rose-200">Unable to load evaluation models</div>
              <div className="mt-1 text-sm text-rose-300">{evalModelsState.message}</div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={retryLoadEvalModels}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {evalModelsState.status === "ready" && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-slate-300">Select Models to Test</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {evalModels.map((m) => (
                  <ModelCard
                    key={m.id}
                    name="eval-model"
                    model={m}
                    selected={m.id === selectedEvalModelId}
                    onSelect={onSelectEvalModel}
                  />
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onRunEval}
                  disabled={!canRunEval}
                  className={[
                    "inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all",
                    canRunEval
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
                    <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
                  </svg>
                  Run Evaluation
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Navigation row */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <NewEvalButton
            onConfirm={() => {
              clear();
              router.push("/");
            }}
          />
          <button
            type="button"
            onClick={() => router.push("/dataset")}
            className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800"
          >
            ← Back to Step 2
          </button>
        </div>
      </div>
    </div>
  );
}
