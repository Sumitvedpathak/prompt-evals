"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { generateCreate } from "@/lib/api/evaluationApi";
import { NewEvalButton } from "@/components/ui/NewEvalButton";
import { StepStepper } from "@/components/ui/StepStepper";
import { useEvaluationWizard } from "@/features/evaluation/store/evaluationWizardStore";

const LAST_GENERATE_RESULT_KEY = "prompt-evals:last-generate-result";

type GenerateState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "success"; result: unknown }
  | { status: "error"; message: string };

export default function GenerateDatasetPage() {
  const router = useRouter();
  const { state, clear } = useEvaluationWizard();
  const step2 = state.step2;

  const request = useMemo(() => {
    if (!step2) return null;
    return {
      dataset_prompt: step2.datasetPrompt,
      dataset_model: step2.datasetModelId,
      count: step2.testCaseCount,
    };
  }, [step2]);

  const [gen, setGen] = useState<GenerateState>({ status: "idle" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!request) return;
    if (attempt === 0 && typeof window !== "undefined") {
      const cached = sessionStorage.getItem(LAST_GENERATE_RESULT_KEY);
      if (cached) {
        try {
          setGen({ status: "success", result: JSON.parse(cached) });
          sessionStorage.removeItem(LAST_GENERATE_RESULT_KEY);
          return;
        } catch {
          sessionStorage.removeItem(LAST_GENERATE_RESULT_KEY);
        }
      }
    }
    let cancelled = false;
    (async () => {
      setGen({ status: "running" });
      try {
        const result = await generateCreate(request);
        if (cancelled) return;
        setGen({ status: "success", result });
      } catch (err) {
        if (cancelled) return;
        setGen({
          status: "error",
          message: err instanceof Error ? err.message : "Failed to generate dataset.",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt, request]);

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
        <StepStepper activeStep={3} />
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/85 p-6 shadow-xl shadow-black/25 backdrop-blur">
        <div className="mb-5">
          <div className="text-lg font-semibold text-slate-100">Step 3: Generating Dataset</div>
          <div className="mt-1 text-sm text-slate-300">
            We’re generating your dataset. This screen will be expanded in a later feature.
          </div>
        </div>

        {!step2 && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-4">
            <div className="font-semibold text-rose-200">Missing Step 2 configuration</div>
            <div className="mt-1 text-sm text-rose-300">
              Go back to Step 2 to configure a prompt, model, and test case count.
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <NewEvalButton
                onConfirm={() => {
                  clear();
                  router.push("/");
                }}
              />
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

        {step2 && gen.status === "running" && (
          <div className="space-y-4">
            <div className="text-sm font-semibold text-slate-100">Processing…</div>
            <div
              role="progressbar"
              aria-label="Generating dataset"
              className="h-2 w-full overflow-hidden rounded-full bg-slate-800"
            >
              <div className="h-2 w-1/2 animate-pulse rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500" />
            </div>
            <div className="text-sm text-slate-300">
              Prompt: <span className="font-medium text-slate-100">{step2.datasetPrompt}</span>
            </div>
            <div className="text-xs text-slate-400">
              Model: {step2.datasetModel.name} ({step2.datasetModel.provider}) · Count:{" "}
              {step2.testCaseCount}
            </div>
          </div>
        )}

        {step2 && gen.status === "success" && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4">
            <div className="font-semibold text-emerald-200">Dataset generated successfully</div>
            <div className="mt-1 text-sm text-emerald-300">
              We received a response from the API. The detailed dataset view will be added in a later
              step.
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-semibold text-emerald-200">
                View raw response (debug)
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-emerald-500/30 bg-slate-900 p-3 text-xs text-slate-200">
                {JSON.stringify(gen.result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {step2 && gen.status === "error" && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-4">
            <div className="font-semibold text-rose-200">Generation failed</div>
            <div className="mt-1 text-sm text-rose-300">{gen.message}</div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <NewEvalButton
                onConfirm={() => {
                  clear();
                  router.push("/");
                }}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => router.push("/dataset")}
                  className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-900/50"
                >
                  Back to Step 2
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAttempt((n) => n + 1);
                  }}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {step2 && (gen.status === "running" || gen.status === "success") && (
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
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800"
            >
              ← Back to Step 2
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

