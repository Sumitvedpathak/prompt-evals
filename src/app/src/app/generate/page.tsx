"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { generateCreate } from "@/lib/api/evaluationApi";
import { NewEvalButton } from "@/components/ui/NewEvalButton";
import { StepStepper } from "@/components/ui/StepStepper";
import { useEvaluationWizard } from "@/features/evaluation/store/evaluationWizardStore";

type GenerateState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "success"; result: unknown }
  | { status: "error"; message: string };

function getDatasetFromResult(result: unknown): unknown {
  if (
    result &&
    typeof result === "object" &&
    "dataset" in result &&
    (result as { dataset: unknown }).dataset !== undefined
  ) {
    return (result as { dataset: unknown }).dataset;
  }
  return result;
}

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
  const [showDataset, setShowDataset] = useState(true);

  const dataset = useMemo(() => {
    if (gen.status !== "success") return null;
    return getDatasetFromResult(gen.result);
  }, [gen]);

  const datasetJson = useMemo(() => {
    if (dataset === null) return "";
    return JSON.stringify(dataset, null, 2);
  }, [dataset]);

  const downloadDataset = () => {
    if (!datasetJson) return;
    const blob = new Blob([datasetJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "dataset.json";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!request) return;
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
          <div className="text-lg font-semibold text-slate-100">Step 3: View Data</div>
          <div className="mt-1 text-sm text-slate-300">
            We generate your dataset here, then you can inspect and download it as JSON.
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
            <div className="text-sm font-semibold text-slate-100">Generating dataset...</div>
            <div
              role="progressbar"
              aria-label="Generating dataset"
              className="h-2 w-full overflow-hidden rounded-full bg-slate-800"
            >
              <div className="h-2 w-1/2 animate-pulse rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500" />
            </div>
            <div className="text-xs text-slate-400">
              Model: {step2.datasetModel.name} ({step2.datasetModel.provider}) · Count:{" "}
              {step2.testCaseCount}
            </div>
          </div>
        )}

        {step2 && gen.status === "success" && (
          <div className="space-y-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4">
            <div className="font-semibold text-emerald-200">Dataset generated successfully</div>
            <div className="text-sm text-emerald-300">
              Generation is complete. You can view the dataset below and download it as JSON.
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setShowDataset((v) => !v)}
                className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-900/40"
              >
                {showDataset ? "Hide Dataset" : "View Dataset"}
              </button>
              <button
                type="button"
                onClick={downloadDataset}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white hover:from-violet-500 hover:to-fuchsia-400"
              >
                Download JSON
              </button>
            </div>
            {showDataset && (
              <pre className="max-h-72 overflow-auto rounded-lg border border-emerald-500/30 bg-slate-900 p-3 text-xs text-slate-200">
                {datasetJson}
              </pre>
            )}
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

