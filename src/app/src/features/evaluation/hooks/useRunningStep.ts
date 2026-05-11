"use client";

import { useEffect, useRef, useState } from "react";
import { getEvalProgress, runEvaluation } from "@/lib/api/evaluationApi";
import { useEvaluationWizard } from "@/features/evaluation/store/evaluationWizardStore";

const POLL_INTERVAL_MS = 1000;

type RunState =
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

export function useRunningStep() {
  const { state } = useEvaluationWizard();
  const testCaseCount = state.step2?.testCaseCount ?? 0;
  const evalModelCount = 1;

  const step1 = state.step1;
  const step3 = state.step3;

  const [runState, setRunState] = useState<RunState>({ status: "loading" });
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(testCaseCount);

  // Prevents duplicate requests in React 18 StrictMode's simulated remount.
  const hasFiredRef = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!step1 || !step3) return;
    if (hasFiredRef.current) return;
    hasFiredRef.current = true;

    const startPoll = () => {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const progress = await getEvalProgress();
          setCompleted(progress.completed);
          setTotal(progress.total > 0 ? progress.total : testCaseCount);

          if (progress.status === "complete") {
            if (pollIntervalRef.current !== null) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setRunState({ status: "success" });
          } else if (progress.status === "error") {
            if (pollIntervalRef.current !== null) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setRunState({ status: "error", message: "Evaluation failed on the server." });
          }
        } catch {
          // Polling errors are transient; keep retrying until the interval is cleared.
        }
      }, POLL_INTERVAL_MS);
    };

    (async () => {
      try {
        await runEvaluation({
          main_prompt: step1.mainPrompt,
          main_model: step1.targetModelId,
          evaluate_model: step3.evalModelId,
        });
        startPoll();
      } catch (err) {
        setRunState({
          status: "error",
          message: err instanceof Error ? err.message : "Evaluation failed.",
        });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup poll interval on unmount.
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current !== null) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return {
    runState,
    isComplete: runState.status !== "loading",
    isSuccess: runState.status === "success",
    completed,
    total,
    testCaseCount,
    evalModelCount,
  };
}
