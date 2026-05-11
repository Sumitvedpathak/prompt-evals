"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ModelCard } from "@/components/ui/ModelCard";
import { NewEvalButton } from "@/components/ui/NewEvalButton";
import { StepStepper } from "@/components/ui/StepStepper";
import { useDatasetStep } from "@/features/evaluation/hooks/useDatasetStep";

export function DatasetStep() {
  const router = useRouter();
  const {
    modelsState,
    models,
    selectedModelId,
    prompt,
    setPrompt,
    promptIsNonEmpty,
    isRefining,
    isGenerating,
    refineError,
    generateError,
    canRefine,
    canGenerate,
    canInteract,
    testCaseCountInput,
    testCaseCountError,
    onSelectModel,
    onChangeCount,
    onRefine,
    onGenerate,
    retryLoadModels,
    persistStep2,
    startNewEval,
  } = useDatasetStep();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 text-slate-100">
      <header className="mb-6 flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-sm font-bold text-white">
          LLM
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-semibold tracking-tight text-slate-100">
            LLM Evaluation System
          </div>
          <div className="mt-1 text-sm text-slate-300">
            Test and compare language models with custom prompts and datasets
          </div>
        </div>
      </header>

      <div className="mb-6">
        <StepStepper activeStep={2} />
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/85 p-6 shadow-xl shadow-black/25 backdrop-blur">
        <div className="mb-5">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-100">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5 text-slate-400"
              aria-hidden="true"
            >
              <path d="M3.5 6.5A3 3 0 0 1 6.5 3.5h7a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3v-7Z" />
              <path
                fillRule="evenodd"
                d="M6.5 7.25a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z"
                clipRule="evenodd"
              />
            </svg>
            Step 2: Dataset Generation
          </div>
          <div className="mt-1 text-sm text-slate-300">
            Generate a dataset of test cases to evaluate your prompt across different models.
          </div>
        </div>

        {modelsState.status === "loading" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-56 rounded bg-slate-800" />
              <div className="h-32 w-full rounded-xl border border-slate-800 bg-slate-900" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-72 rounded bg-slate-800" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-xl border border-slate-800 bg-slate-900" />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-4 w-44 rounded bg-slate-800" />
              <div className="h-10 w-40 rounded-xl border border-slate-800 bg-slate-900" />
            </div>

            <div className="flex justify-end">
              <div className="h-10 w-44 rounded-xl bg-slate-800" />
            </div>
          </div>
        )}

        {modelsState.status === "error" && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-4">
            <div className="font-semibold text-rose-200">Unable to load models</div>
            <div className="mt-1 text-sm text-rose-300">{modelsState.message}</div>
            <div className="mt-4">
              <button
                type="button"
                onClick={retryLoadModels}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {modelsState.status === "ready" && (
          <div className="space-y-6">
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-100">
                Dataset Generation Prompt
              </div>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    "Describe the dataset you want to generate.\nExample: 'Generate 100 customer support tickets about billing, each with category and expected resolution steps.'"
                  }
                  className="min-h-36 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-28 text-sm text-slate-100 shadow-sm outline-none placeholder:text-slate-500 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/30"
                  readOnly={!canInteract || isRefining}
                />
                <button
                  type="button"
                  onClick={onRefine}
                  disabled={!canRefine}
                  aria-busy={isRefining}
                  className={[
                    "absolute right-3 top-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300",
                    isRefining
                      ? "cursor-wait bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:200%_100%] text-white shadow-lg shadow-fuchsia-400/40 ring-4 ring-fuchsia-300/30 animate-pulse"
                      : canRefine
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-sm hover:from-violet-500 hover:to-fuchsia-400 hover:shadow-md hover:shadow-fuchsia-200/70"
                        : "cursor-not-allowed bg-slate-800 text-slate-500",
                  ].join(" ")}
                >
                  {isRefining ? (
                    <>
                      <span className="relative inline-flex">
                        <span className="absolute inline-flex size-4 animate-ping rounded-full bg-white/40" />
                        <span className="relative inline-flex size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      </span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="size-4"
                        aria-hidden="true"
                      >
                        <path d="M10 2.5l.9 2.7a1 1 0 0 0 .63.63l2.7.9-2.7.9a1 1 0 0 0-.63.63l-.9 2.7-.9-2.7a1 1 0 0 0-.63-.63l-2.7-.9 2.7-.9a1 1 0 0 0 .63-.63L10 2.5Z" />
                        <path d="M15.5 10.5l.55 1.65a.75.75 0 0 0 .47.47l1.65.55-1.65.55a.75.75 0 0 0-.47.47l-.55 1.65-.55-1.65a.75.75 0 0 0-.47-.47l-1.65-.55 1.65-.55a.75.75 0 0 0 .47-.47l.55-1.65Z" />
                      </svg>
                      Refine
                    </>
                  )}
                </button>
              </div>
              {refineError && <div className="mt-2 text-sm text-rose-300">{refineError}</div>}
              {!promptIsNonEmpty && (
                <div className="mt-2 text-xs text-slate-400">Enter a prompt to enable actions.</div>
              )}
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold text-slate-100">
                Select Model for Dataset Generation
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {models.map((m) => (
                  <ModelCard
                    key={m.id}
                    name="dataset-model"
                    model={m}
                    selected={m.id === selectedModelId}
                    onSelect={onSelectModel}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold text-slate-100">Number of Test Cases</div>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={testCaseCountInput}
                onChange={(e) => onChangeCount(e.target.value)}
                className="w-40 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 shadow-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/30"
              />
              {testCaseCountError && (
                <div className="mt-2 text-sm text-rose-300">{testCaseCountError}</div>
              )}
              {generateError && <div className="mt-2 text-sm text-rose-300">{generateError}</div>}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <NewEvalButton
                onConfirm={() => {
                  startNewEval();
                  router.push("/");
                }}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800"
                >
                  ← Back to Step 1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!canGenerate) return;
                    persistStep2();
                    const ok = onGenerate();
                    if (!ok) return;
                    router.push("/viewdata");
                  }}
                  disabled={!canGenerate}
                  className={[
                    "rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm",
                    canGenerate
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400"
                      : "cursor-not-allowed bg-slate-800 text-slate-500",
                  ].join(" ")}
                >
                  {isGenerating ? "Generating..." : "Generate Dataset →"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

