"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getEvalResults } from "@/lib/api/evaluationApi";
import { useEvaluationWizard } from "@/features/evaluation/store/evaluationWizardStore";
import type { EvalResultsResponse } from "@/types/evaluation";
import type { BarChartEntry } from "@/components/ui/BarChart";
import type { RadarChartEntry } from "@/components/ui/RadarChart";
import type { ResultTableRow } from "@/components/ui/ResultsTable";

export type UseResultsStepReturn = {
  results: EvalResultsResponse | null;
  isLoading: boolean;
  isError: boolean;
  retryCount: number;
  refetch: () => void;

  completionDate: string;
  testCaseCount: number | null;
  topPerformer: string;
  avgAccuracy: number;
  overallScore: number;

  barChartData: BarChartEntry[];
  radarChartData: RadarChartEntry[];
  tableRows: ResultTableRow[];
};

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export function useResultsStep(): UseResultsStepReturn {
  const { state } = useEvaluationWizard();

  const modelName = state.step1?.targetModel.name ?? "Unknown Model";
  const testCaseCount = state.step2?.testCaseCount ?? null;

  const [completionDate] = useState<string>(() => new Date().toLocaleDateString("en-CA"));

  const [results, setResults] = useState<EvalResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const hasFiredRef = useRef(false);

  const fetchResults = useCallback(async (isRetry: boolean) => {
    setIsLoading(true);
    setIsError(false);
    if (isRetry) {
      setRetryCount((prev) => prev + 1);
    }
    try {
      const data = await getEvalResults();
      setResults(data);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasFiredRef.current) return;
    hasFiredRef.current = true;
    fetchResults(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetch = useCallback(() => {
    fetchResults(true);
  }, [fetchResults]);

  const items = results ?? [];

  const overallScore = average(items.map((r) => r.evaluation_summary.overall_score));
  const avgAccuracy = average(items.map((r) => r.dimension_scores.accuracy));
  const avgConsistency = average(items.map((r) => r.dimension_scores.consistency));
  const avgCreativity = average(items.map((r) => r.dimension_scores.creativity));
  const avgSafety = average(items.map((r) => r.dimension_scores.safety));

  const barChartData: BarChartEntry[] = items.length > 0
    ? [{ model: modelName, score: overallScore, accuracy: avgAccuracy, consistency: avgConsistency }]
    : [];

  const radarChartData: RadarChartEntry[] = items.length > 0
    ? [
        { dimension: "Accuracy", value: avgAccuracy },
        { dimension: "Consistency", value: avgConsistency },
        { dimension: "Creativity", value: avgCreativity },
        { dimension: "Safety", value: avgSafety },
      ]
    : [];

  const tableRows: ResultTableRow[] = items.length > 0
    ? [
        {
          model: modelName,
          overallScore,
          accuracy: avgAccuracy,
          consistency: avgConsistency,
          creativity: avgCreativity,
          safety: avgSafety,
        },
      ]
    : [];

  return {
    results,
    isLoading,
    isError,
    retryCount,
    refetch,
    completionDate,
    testCaseCount,
    topPerformer: modelName,
    avgAccuracy,
    overallScore,
    barChartData,
    radarChartData,
    tableRows,
  };
}
