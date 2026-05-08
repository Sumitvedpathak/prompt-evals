"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateCreate, getDatasetModels, refineDatasetPrompt } from "@/lib/api/evaluationApi";
import { useEvaluationWizard } from "@/features/evaluation/store/evaluationWizardStore";
import type { LLMModel } from "@/types/evaluation";

const LAST_GENERATE_RESULT_KEY = "prompt-evals:last-generate-result";

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
  const hasAutoRefinedOnLoadRef = useRef(false);

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

  const canRefine = canInteract && promptIsNonEmpty && !!selectedModel && !isRefining;
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
    await runRefine(prompt);
  }, [canRefine, prompt, runRefine, selectedModelId]);

  // Auto-refine once when Step 2 first becomes interactive.
  // Priority for initial prompt source:
  // 1) Existing Step 2 prompt (if returning to this page)
  // 2) Step 1 main prompt (fresh transition from Step 1)
  useEffect(() => {
    if (hasAutoRefinedOnLoadRef.current) return;
    if (!canInteract || !selectedModelId || isRefining) return;

    const seedPrompt = (prompt.trim() || state.step1?.mainPrompt?.trim() || "").trim();
    if (!seedPrompt) return;

    hasAutoRefinedOnLoadRef.current = true;
    void runRefine(seedPrompt);
  }, [canInteract, isRefining, prompt, runRefine, selectedModelId, state.step1?.mainPrompt]);

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

  const onGenerate = useCallback(async (): Promise<boolean> => {
    if (!selectedModel) return false;
    const count = isCountValid ? (countValidation.value ?? testCaseCount) : testCaseCount;
    const payload = {
      dataset_prompt: prompt.trim(),
      dataset_model: selectedModel.id,
      count,
    };
    if (!payload.dataset_prompt) return false;

    setGenerateError(null);
    setIsGenerating(true);
    try {
      setStep2({
        datasetPrompt: payload.dataset_prompt,
        datasetModelId: selectedModel.id,
        datasetModel: selectedModel,
        testCaseCount: count,
      });
      const result = await generateCreate(payload);
      sessionStorage.setItem(LAST_GENERATE_RESULT_KEY, JSON.stringify(result));
      return true;
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate dataset.");
      return false;
    } finally {
      setIsGenerating(false);
    }
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

