"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { generateCreate, getEvalModels } from "@/lib/api/evaluationApi";
import { useEvaluationWizard } from "@/features/evaluation/store/evaluationWizardStore";
import type { LLMModel } from "@/types/evaluation";

type GenerateState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "success"; result: unknown }
  | { status: "error"; message: string };

type EvalModelsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; models: LLMModel[] };

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

export function useViewDataStep() {
  const router = useRouter();
  const { state, setStep3, clear } = useEvaluationWizard();
  const step2 = state.step2;
  const step1 = state.step1;

  // --- Dataset generation ---
  const [genState, setGenState] = useState<GenerateState>({ status: "idle" });
  const [attempt, setAttempt] = useState(0);
  const [showDataset, setShowDataset] = useState(true);

  const request = useMemo(() => {
    if (!step2) return null;
    return {
      dataset_prompt: step2.datasetPrompt,
      dataset_model: step2.datasetModelId,
      count: step2.testCaseCount,
    };
  }, [step2]);

  useEffect(() => {
    if (!request) return;
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      setGenState({ status: "running" });
      try {
        const result = await generateCreate(request);
        if (cancelled) return;
        setGenState({ status: "success", result });
      } catch (err) {
        if (cancelled) return;
        setGenState({
          status: "error",
          message: err instanceof Error ? err.message : "Failed to generate dataset.",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt, request]);

  const dataset = useMemo(() => {
    if (genState.status !== "success") return null;
    return getDatasetFromResult(genState.result);
  }, [genState]);

  const datasetJson = useMemo(() => {
    if (dataset === null) return "";
    return JSON.stringify(dataset, null, 2);
  }, [dataset]);

  const toggleDataset = useCallback(() => setShowDataset((v) => !v), []);

  const downloadDataset = useCallback(() => {
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
  }, [datasetJson]);

  const retryGenerate = useCallback(() => setAttempt((n) => n + 1), []);

  // --- Eval model fetch ---
  const [evalModelsState, setEvalModelsState] = useState<EvalModelsState>({ status: "loading" });
  const [selectedEvalModelId, setSelectedEvalModelId] = useState<string>("");
  const [evalModelAttempt, setEvalModelAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setEvalModelsState({ status: "loading" });
      try {
        const models = await getEvalModels();
        if (cancelled) return;
        setEvalModelsState({ status: "ready", models });
      } catch (err) {
        if (cancelled) return;
        setEvalModelsState({
          status: "error",
          message: err instanceof Error ? err.message : "Failed to load evaluation models.",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [evalModelAttempt]);

  const evalModels = useMemo(
    () => (evalModelsState.status === "ready" ? evalModelsState.models : []),
    [evalModelsState],
  );

  const selectedEvalModel = useMemo(
    () => evalModels.find((m) => m.id === selectedEvalModelId) ?? null,
    [evalModels, selectedEvalModelId],
  );

  const onSelectEvalModel = useCallback((id: string) => setSelectedEvalModelId(id), []);

  const retryLoadEvalModels = useCallback(() => setEvalModelAttempt((n) => n + 1), []);

  const canRunEval =
    evalModelsState.status === "ready" &&
    !!selectedEvalModelId &&
    genState.status === "success";

  const onRunEval = useCallback(() => {
    if (!canRunEval || !selectedEvalModel) return;
    setStep3({ evalModelId: selectedEvalModelId, evalModel: selectedEvalModel });
    router.push("/running");
  }, [canRunEval, router, selectedEvalModel, selectedEvalModelId, setStep3]);

  return {
    step2,
    genState,
    dataset,
    datasetJson,
    showDataset,
    toggleDataset,
    downloadDataset,
    retryGenerate,
    evalModelsState,
    evalModels,
    selectedEvalModelId,
    selectedEvalModel,
    onSelectEvalModel,
    retryLoadEvalModels,
    canRunEval,
    onRunEval,
    clear,
  };
}
