"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { DatasetStepState, Step1State, ViewDataStepState } from "@/types/evaluation";

type EvaluationWizardState = {
  step1?: Step1State;
  step2?: DatasetStepState;
  step3?: ViewDataStepState;
};

type EvaluationWizardStore = {
  state: EvaluationWizardState;
  setStep1: (step1: Step1State) => void;
  setStep2: (step2: DatasetStepState) => void;
  setStep3: (step3: ViewDataStepState) => void;
  clear: () => void;
};

const STORAGE_KEY = "prompt-evals:evaluation-wizard:v1";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

const Ctx = createContext<EvaluationWizardStore | null>(null);

function readFromStorage(): EvaluationWizardState | null {
  try {
    const storage = getStorage();
    if (!storage) return null;
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EvaluationWizardState;
  } catch {
    return null;
  }
}

function writeToStorage(value: EvaluationWizardState) {
  try {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

function removeFromStorage() {
  try {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function isSameStep1(a: Step1State | undefined, b: Step1State): boolean {
  if (!a) return false;
  return (
    a.mainPrompt === b.mainPrompt &&
    a.targetModelId === b.targetModelId &&
    a.targetModel.id === b.targetModel.id &&
    a.targetModel.name === b.targetModel.name &&
    a.targetModel.provider === b.targetModel.provider &&
    a.targetModel.description === b.targetModel.description
  );
}

function isSameStep3(a: ViewDataStepState | undefined, b: ViewDataStepState): boolean {
  if (!a) return false;
  return a.evalModelId === b.evalModelId && a.evalModel.id === b.evalModel.id;
}

function isSameStep2(a: DatasetStepState | undefined, b: DatasetStepState): boolean {
  if (!a) return false;
  return (
    a.datasetPrompt === b.datasetPrompt &&
    a.datasetModelId === b.datasetModelId &&
    a.testCaseCount === b.testCaseCount &&
    a.datasetModel.id === b.datasetModel.id &&
    a.datasetModel.name === b.datasetModel.name &&
    a.datasetModel.provider === b.datasetModel.provider &&
    a.datasetModel.description === b.datasetModel.description
  );
}

export function EvaluationWizardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EvaluationWizardState>(() => readFromStorage() ?? {});

  useEffect(() => {
    // Migration cleanup: old versions used localStorage and could leak stale state across sessions.
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore unavailable storage.
    }
  }, []);

  useEffect(() => {
    writeToStorage(state);
  }, [state]);

  const setStep1 = useCallback((step1: Step1State) => {
    setState((prev) => {
      if (isSameStep1(prev.step1, step1)) return prev;
      return { ...prev, step1 };
    });
  }, []);

  const setStep2 = useCallback((step2: DatasetStepState) => {
    setState((prev) => {
      if (isSameStep2(prev.step2, step2)) return prev;
      return { ...prev, step2 };
    });
  }, []);

  const setStep3 = useCallback((step3: ViewDataStepState) => {
    setState((prev) => {
      if (isSameStep3(prev.step3, step3)) return prev;
      return { ...prev, step3 };
    });
  }, []);

  const clear = useCallback(() => {
    removeFromStorage();
    setState({});
  }, []);

  const store = useMemo<EvaluationWizardStore>(() => {
    return {
      state,
      setStep1,
      setStep2,
      setStep3,
      clear,
    };
  }, [clear, setStep1, setStep2, setStep3, state]);

  return React.createElement(Ctx.Provider, { value: store }, children);
}

export function useEvaluationWizard() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEvaluationWizard must be used within EvaluationWizardProvider");
  return ctx;
}

