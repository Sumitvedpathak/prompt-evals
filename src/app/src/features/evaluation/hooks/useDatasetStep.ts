"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getDatasetModels, refineDatasetPrompt } from "@/lib/api/evaluationApi";
import { useEvaluationWizard } from "@/features/evaluation/store/evaluationWizardStore";
import type { LLMModel } from "@/types/evaluation";

type ModelsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; models: LLMModel[] };

function parsePositiveInt(raw: string): { value: number | null; error: string | null } {
  const trimmed = raw.trim();
  if (!trimmed) return { value: null, error: "Enter a positive integer." };
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return { value: null, error: "Enter a positive integer." };
  if (!Number.isInteger(n)) return { value: null, error: "Must be an integer." };
  if (n <= 0) return { value: null, error: "Must be greater than 0." };
  return { value: n, error: null };
}

export function useDatasetStep() {
  const { state, setStep2, clear } = useEvaluationWizard();

  const [modelsState, setModelsState] = useState<ModelsState>({ status: "loading" });
  const [selectedModelId, setSelectedModelId] = useState<string>(
    () => state.step2?.datasetModelId ?? "",
  );
  const [prompt, setPrompt] = useState<string>(() => state.step2?.datasetPrompt ?? "");

  const initialCount = state.step2?.testCaseCount ?? 1;
  const [testCaseCount, setTestCaseCount] = useState<number>(initialCount);
  const [testCaseCountInput, setTestCaseCountInput] = useState<string>(() => String(initialCount));
  const [testCaseCountError, setTestCaseCountError] = useState<string | null>(null);

  const [refineError, setRefineError] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadModels = useCallback(async (opts?: { setLoading?: boolean }) => {
    if (opts?.setLoading) setModelsState({ status: "loading" });
    try {
      const models = await getDatasetModels();
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
        const models = await getDatasetModels();
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
    () => models.find((m) => m.id === selectedModelId) ?? null,
    [models, selectedModelId],
  );

  const promptIsNonEmpty = useMemo(() => prompt.trim().length > 0, [prompt]);
  const canInteract = modelsState.status === "ready";

  const countValidation = useMemo(() => parsePositiveInt(testCaseCountInput), [testCaseCountInput]);
  const isCountValid = countValidation.error === null;

  const step1Prompt = state.step1?.mainPrompt?.trim() ?? "";
  const hasRefinableContent = promptIsNonEmpty || step1Prompt.length > 0;
  const canRefine = canInteract && hasRefinableContent && !!selectedModel && !isRefining;
  const canGenerate = canInteract && promptIsNonEmpty && !!selectedModel && isCountValid && !isGenerating;

  const onSelectModel = useCallback((id: string) => setSelectedModelId(id), []);

  const onChangeCount = useCallback((raw: string) => {
    setTestCaseCountInput(raw);
    const v = parsePositiveInt(raw);
    setTestCaseCountError(v.error);
    if (v.value !== null) setTestCaseCount(v.value);
  }, []);

  const runRefine = useCallback(
    async (basePrompt: string) => {
      if (!selectedModelId) return;
      const normalizedPrompt = basePrompt.trim();
      if (!normalizedPrompt) return;
      setRefineError(null);
      setIsRefining(true);
      try {
        const res = await refineDatasetPrompt({
          type: "default_ds_prompt",
          prompt: normalizedPrompt,
          target_model: selectedModelId,
        });
        setPrompt(res.refined_prompt);
      } catch (err) {
        setRefineError(err instanceof Error ? err.message : "Failed to refine prompt.");
      } finally {
        setIsRefining(false);
      }
    },
    [selectedModelId],
  );

  const onRefine = useCallback(async () => {
    if (!canRefine || !selectedModelId) return;
    // Use the textbox content if non-empty, otherwise fall back to the Step 1 prompt.
    const basePrompt = prompt.trim() || step1Prompt;
    await runRefine(basePrompt);
  }, [canRefine, prompt, runRefine, selectedModelId, step1Prompt]);

  const persistStep2 = useCallback(() => {
    if (!selectedModel) return;
    const count = isCountValid ? (countValidation.value ?? testCaseCount) : testCaseCount;
    setStep2({
      datasetPrompt: prompt,
      datasetModelId: selectedModel.id,
      datasetModel: selectedModel,
      testCaseCount: count,
    });
  }, [countValidation.value, isCountValid, prompt, selectedModel, setStep2, testCaseCount]);

  const onGenerate = useCallback((): boolean => {
    if (!selectedModel) return false;
    const count = isCountValid ? (countValidation.value ?? testCaseCount) : testCaseCount;
    const datasetPrompt = prompt.trim();
    if (!datasetPrompt) return false;

    setGenerateError(null);
    setStep2({
      datasetPrompt,
      datasetModelId: selectedModel.id,
      datasetModel: selectedModel,
      testCaseCount: count,
    });
    return true;
  }, [countValidation.value, isCountValid, prompt, selectedModel, setStep2, testCaseCount]);

  // Keep persisted wizard state in sync when user edits Step 2.
  useEffect(() => {
    if (!selectedModel) return;
    // Avoid re-populating cleared state on "New Eval" before the user starts typing.
    if (!promptIsNonEmpty && !state.step2) return;
    const nextCount = isCountValid ? (countValidation.value ?? testCaseCount) : testCaseCount;
    if (
      state.step2?.datasetPrompt === prompt &&
      state.step2?.datasetModelId === selectedModel.id &&
      state.step2?.datasetModel?.id === selectedModel.id &&
      state.step2?.testCaseCount === nextCount
    ) {
      return;
    }
    setStep2({
      datasetPrompt: prompt,
      datasetModelId: selectedModel.id,
      datasetModel: selectedModel,
      testCaseCount: nextCount,
    });
  }, [
    countValidation.value,
    isCountValid,
    prompt,
    promptIsNonEmpty,
    selectedModel,
    setStep2,
    state.step2,
    testCaseCount,
  ]);

  const startNewEval = useCallback(() => {
    clear();
    setRefineError(null);
    setIsRefining(false);
    setPrompt("");
    setSelectedModelId(models[0]?.id || "");
    setTestCaseCount(1);
    setTestCaseCountInput("1");
    setTestCaseCountError(null);
    setGenerateError(null);
    setIsGenerating(false);
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
    isGenerating,
    refineError,
    generateError,
    canRefine,
    canGenerate,
    canInteract,
    testCaseCount,
    testCaseCountInput,
    testCaseCountError,
    onSelectModel,
    onChangeCount,
    onRefine,
    onGenerate,
    retryLoadModels: () => loadModels({ setLoading: true }),
    persistStep2,
    startNewEval,
  };
}

