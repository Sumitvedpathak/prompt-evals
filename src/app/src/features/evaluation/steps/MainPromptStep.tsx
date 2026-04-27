"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ModelCard } from "@/components/ui/ModelCard";
import { NewEvalButton } from "@/components/ui/NewEvalButton";
import { StepStepper } from "@/components/ui/StepStepper";
import { useMainPrompt } from "@/features/evaluation/hooks/useMainPrompt";

export function MainPromptStep() {
  const router = useRouter();
  const {
    modelsState,
    models,
    selectedModelId,
    prompt,
    setPrompt,
    promptIsNonEmpty,
    isRefining,
    refineError,
    canRefine,
    canNext,
    canInteract,
    onSelectModel,
    onRefine,
    retryLoadModels,
    persistStep1,
    startNewEval,
  } = useMainPrompt();

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
        <StepStepper activeStep={1} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5 text-slate-500"
              aria-hidden="true"
            >
              <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2h3a.75.75 0 0 1 0 1.5h-3A1 1 0 0 0 5.5 4.5v3a.75.75 0 0 1-1.5 0v-3Z" />
              <path d="M15.5 12.5a.75.75 0 0 1 .75.75v1.25A2.5 2.5 0 0 1 13.75 17h-1.25a.75.75 0 0 1 0-1.5h1.25a1 1 0 0 0 1-1v-1.25a.75.75 0 0 1 .75-.75Z" />
              <path
                fillRule="evenodd"
                d="M11.965 3.76a1.75 1.75 0 0 1 2.475 0l1.8 1.8a1.75 1.75 0 0 1 0 2.475l-6.51 6.51a1.75 1.75 0 0 1-.73.43l-2.62.79a.75.75 0 0 1-.93-.93l.79-2.62c.095-.315.24-.607.43-.73l6.51-6.51Zm1.414 1.06a.25.25 0 0 0-.354 0L6.77 11.075a.25.25 0 0 0-.06.102l-.46 1.52 1.52-.46a.25.25 0 0 0 .102-.06l6.255-6.255a.25.25 0 0 0 0-.354l-1.8-1.8Z"
                clipRule="evenodd"
              />
            </svg>
            Step 1: Main Prompt Configuration
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Configure the main prompt that will be used in production and tested across different
            models.
          </div>
        </div>

        {modelsState.status === "loading" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-40 rounded bg-slate-100" />
              <div className="h-32 w-full rounded-xl border border-slate-200 bg-slate-50" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-56 rounded bg-slate-100" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-xl border border-slate-200 bg-slate-50"
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <div className="h-10 w-44 rounded-xl bg-slate-100" />
            </div>
          </div>
        )}

        {modelsState.status === "error" && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <div className="font-semibold text-rose-900">Unable to load models</div>
            <div className="mt-1 text-sm text-rose-800">{modelsState.message}</div>
            <div className="mt-4">
              <button
                type="button"
                onClick={retryLoadModels}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {modelsState.status === "ready" && (
          <div className="space-y-6">
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-900">Main Prompt to Test</div>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    "Enter the main prompt you want to evaluate across different models.\nExample: 'You are a helpful assistant that answers questions concisely and accurately.'"
                  }
                  className="min-h-36 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 pr-28 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  readOnly={!canInteract || isRefining}
                />
                <button
                  type="button"
                  onClick={onRefine}
                  disabled={!canRefine}
                  className={[
                    "absolute right-3 top-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold",
                    canRefine
                      ? "bg-fuchsia-600 text-white hover:bg-fuchsia-500"
                      : "cursor-not-allowed bg-slate-200 text-slate-500",
                  ].join(" ")}
                >
                  {isRefining ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Refining
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
              {refineError && <div className="mt-2 text-sm text-rose-700">{refineError}</div>}
              {!promptIsNonEmpty && (
                <div className="mt-2 text-xs text-slate-500">Enter a prompt to enable actions.</div>
              )}
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold text-slate-900">
                Select Model for Main Prompt
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {models.map((m) => (
                  <ModelCard
                    key={m.id}
                    name="target-model"
                    model={m}
                    selected={m.id === selectedModelId}
                    onSelect={onSelectModel}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <NewEvalButton
                onConfirm={() => {
                  startNewEval();
                  router.push("/");
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (!canNext) return;
                  persistStep1();
                  router.push("/dataset");
                }}
                disabled={!canNext}
                className={[
                  "rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm",
                  canNext
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400"
                    : "cursor-not-allowed bg-slate-200 text-slate-500",
                ].join(" ")}
              >
                Next: Dataset Generation →
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

