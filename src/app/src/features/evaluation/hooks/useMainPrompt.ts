"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getTargetModels, refineMainPrompt } from "@/lib/api/evaluationApi";
import type { TargetModel } from "@/types/evaluation";
import { useEvaluationWizard } from "@/features/evaluation/store/evaluationWizardStore";

type ModelsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; models: TargetModel[] };

export function useMainPrompt() {
  const { state, setStep1, clear } = useEvaluationWizard();

  const [modelsState, setModelsState] = useState<ModelsState>({ status: "loading" });
  const [selectedModelId, setSelectedModelId] = useState<string>(() => state.step1?.targetModelId ?? "");
  const [prompt, setPrompt] = useState<string>(() => state.step1?.mainPrompt ?? "");

  const [refineError, setRefineError] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);

  const loadModels = useCallback(async (opts?: { setLoading?: boolean }) => {
    if (opts?.setLoading) setModelsState({ status: "loading" });
    try {
      const models = await getTargetModels();
      if (!models.length) {
        setModelsState({ status: "error", message: "No models available. Please retry." });
        setSelectedModelId("");
        return;
      }
      setModelsState({ status: "ready", models });
      setSelectedModelId((prev) => prev || models[0]?.id || "");
    } catch (err) {
      setModelsState({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to load models.",
      });
      setSelectedModelId("");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const models = await getTargetModels();
        if (cancelled) return;
        if (!models.length) {
          setModelsState({ status: "error", message: "No models available. Please retry." });
          setSelectedModelId("");
          return;
        }
        setModelsState({ status: "ready", models });
        setSelectedModelId((prev) => {
          const desired = prev || models[0]?.id || "";
          return models.some((m) => m.id === desired) ? desired : (models[0]?.id || "");
        });
      } catch (err) {
        if (cancelled) return;
        setModelsState({
          status: "error",
          message: err instanceof Error ? err.message : "Failed to load models.",
        });
        setSelectedModelId("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const models = useMemo(
    () => (modelsState.status === "ready" ? modelsState.models : []),
    [modelsState],
  );
  const selectedModel = useMemo(
    () => models.find((m) => m.id === selectedModelId) || null,
    [models, selectedModelId],
  );

  const promptIsNonEmpty = useMemo(() => prompt.trim().length > 0, [prompt]);
  const canInteract = modelsState.status === "ready";
  const canRefine = canInteract && promptIsNonEmpty && !!selectedModel && !isRefining;
  const canNext = canInteract && promptIsNonEmpty && !!selectedModel;

  const onSelectModel = useCallback((id: string) => setSelectedModelId(id), []);

  const onRefine = useCallback(async () => {
    if (!canRefine || !selectedModelId) return;
    setRefineError(null);
    setIsRefining(true);
    try {
      const res = await refineMainPrompt({ type: "main", prompt, target_model: selectedModelId });
      setPrompt(res.refined_prompt);
    } catch (err) {
      setRefineError(err instanceof Error ? err.message : "Failed to refine prompt.");
    } finally {
      setIsRefining(false);
    }
  }, [canRefine, prompt, selectedModelId]);

  const persistStep1 = useCallback(() => {
    if (!selectedModel) return;
    setStep1({
      mainPrompt: prompt,
      targetModelId: selectedModel.id,
      targetModel: selectedModel,
    });
  }, [prompt, selectedModel, setStep1]);

  // Keep persisted wizard state in sync when user edits Step 1.
  // This ensures navigation away/back (or refresh) does not lose work-in-progress.
  useEffect(() => {
    if (!promptIsNonEmpty) return;
    if (!selectedModelId) return;
    const model = models.find((m) => m.id === selectedModelId);
    if (!model) return;
    // Avoid redundant writes (prevents render loops and preserves performance).
    if (
      state.step1?.mainPrompt === prompt &&
      state.step1?.targetModelId === model.id &&
      state.step1?.targetModel?.id === model.id
    ) {
      return;
    }
    setStep1({ mainPrompt: prompt, targetModelId: model.id, targetModel: model });
  }, [models, prompt, promptIsNonEmpty, selectedModelId, setStep1, state.step1]);

  const startNewEval = useCallback(() => {
    clear();
    setRefineError(null);
    setIsRefining(false);
    setPrompt("");
    setSelectedModelId(models[0]?.id || "");
  }, [clear, models]);

  return {
    modelsState,
    models,
    selectedModelId,
    selectedModel,
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
    retryLoadModels: () => loadModels({ setLoading: true }),
    persistStep1,
    startNewEval,
  };
}

