"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Step1State } from "@/types/evaluation";

type EvaluationWizardState = {
  step1?: Step1State;
};

type EvaluationWizardStore = {
  state: EvaluationWizardState;
  setStep1: (step1: Step1State) => void;
  clear: () => void;
};

const STORAGE_KEY = "prompt-evals:evaluation-wizard:v1";

const Ctx = createContext<EvaluationWizardStore | null>(null);

function readFromStorage(): EvaluationWizardState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EvaluationWizardState;
  } catch {
    return null;
  }
}

function writeToStorage(value: EvaluationWizardState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

function removeFromStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
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

export function EvaluationWizardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EvaluationWizardState>(() => readFromStorage() ?? {});

  useEffect(() => {
    writeToStorage(state);
  }, [state]);

  const setStep1 = useCallback((step1: Step1State) => {
    setState((prev) => {
      if (isSameStep1(prev.step1, step1)) return prev;
      return { ...prev, step1 };
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
      clear,
    };
  }, [clear, setStep1, state]);

  return React.createElement(Ctx.Provider, { value: store }, children);
}

export function useEvaluationWizard() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEvaluationWizard must be used within EvaluationWizardProvider");
  return ctx;
}

