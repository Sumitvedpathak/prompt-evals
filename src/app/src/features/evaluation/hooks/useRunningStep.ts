"use client";

import { useEffect, useRef, useState } from "react";
import { runEvaluation } from "@/lib/api/evaluationApi";
import { useEvaluationWizard } from "@/features/evaluation/store/evaluationWizardStore";

type RunState =
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export function useRunningStep() {
  const { state } = useEvaluationWizard();
  const testCaseCount = state.step2?.testCaseCount ?? 0;
  const evalModelCount = 1;

  const step1 = state.step1;
  const step3 = state.step3;

  const [runState, setRunState] = useState<RunState>({ status: "loading" });

  // Ref persists across React 18 StrictMode's simulated unmount/remount,
  // ensuring only one network request is ever fired per page visit.
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (!step1 || !step3) return;
    if (hasFiredRef.current) return;
    hasFiredRef.current = true;

    (async () => {
      try {
        const message = await runEvaluation({
          main_prompt: step1.mainPrompt,
          main_model: step1.targetModelId,
          evaluate_model: step3.evalModelId,
        });
        setRunState({ status: "success", message });
      } catch (err) {
        setRunState({
          status: "error",
          message: err instanceof Error ? err.message : "Evaluation failed.",
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    runState,
    isComplete: runState.status !== "loading",
    isSuccess: runState.status === "success",
    testCaseCount,
    evalModelCount,
  };
}
