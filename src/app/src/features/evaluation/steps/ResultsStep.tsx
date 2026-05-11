"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { StepStepper } from "@/components/ui/StepStepper";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { OverallPerformanceChart } from "@/components/ui/BarChart";
import { MultiDimensionalChart } from "@/components/ui/RadarChart";
import { ResultsTable } from "@/components/ui/ResultsTable";
import { useResultsStep } from "@/features/evaluation/hooks/useResultsStep";
import { useEvaluationWizard } from "@/features/evaluation/store/evaluationWizardStore";

function TrophyIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="size-4" aria-hidden="true">
      <path d="M2.5 1A1.5 1.5 0 0 0 1 2.5v1A3.5 3.5 0 0 0 4.5 7H5v.5a3 3 0 0 0 2 2.83V12H5.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1H9v-1.67A3 3 0 0 0 11 7.5V7h.5A3.5 3.5 0 0 0 15 3.5v-1A1.5 1.5 0 0 0 13.5 1h-11ZM2 3.5V2.5a.5.5 0 0 1 .5-.5H4v2.5A2.5 2.5 0 0 1 2 3.5Zm10 0A2.5 2.5 0 0 1 12 4.5V2h1.5a.5.5 0 0 1 .5.5v1A2.5 2.5 0 0 1 12 6V4.5Z" />
    </svg>
  );
}

function AccuracyIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="size-4" aria-hidden="true">
      <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.97-9.03a.75.75 0 0 0-1.08-1.04L7.477 8.417 5.384 6.323a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function TestsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="size-4" aria-hidden="true">
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path fillRule="evenodd" d="M1.38 8a6.64 6.64 0 0 1 .24-.88l-1.3-.75a.75.75 0 0 1 .75-1.3l1.3.75a6.5 6.5 0 0 1 .88-.51V3.75a.75.75 0 0 1 1.5 0v1.31c.3-.1.62-.17.95-.21V3.75a.75.75 0 0 1 1.5 0v1.1c.33.04.65.11.95.21V3.75a.75.75 0 0 1 1.5 0v1.56c.32.15.62.32.88.51l1.3-.75a.75.75 0 0 1 .75 1.3l-1.3.75c.1.28.18.58.24.88H14a.75.75 0 0 1 0 1.5h-1.1c-.06.3-.14.6-.24.88l1.3.75a.75.75 0 0 1-.75 1.3l-1.3-.75c-.26.19-.56.36-.88.51v1.56a.75.75 0 0 1-1.5 0v-1.1c-.3.1-.62.17-.95.21v1.1a.75.75 0 0 1-1.5 0v-1.1a6.53 6.53 0 0 1-.95-.21v1.1a.75.75 0 0 1-1.5 0v-1.56a6.638 6.638 0 0 1-.88-.51l-1.3.75a.75.75 0 0 1-.75-1.3l1.3-.75a6.64 6.64 0 0 1-.24-.88H2a.75.75 0 0 1 0-1.5h1.38Z" clipRule="evenodd" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#2a2a3e] bg-[#1a1a2e] p-5">
      <div className="mb-3 h-3 w-24 rounded bg-slate-700" />
      <div className="mb-2 h-8 w-32 rounded bg-slate-700" />
      <div className="h-3 w-20 rounded bg-slate-800" />
    </div>
  );
}

function SkeletonChartArea() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#2a2a3e] bg-[#1a1a2e] p-6">
      <div className="mb-4 h-4 w-40 rounded bg-slate-700" />
      <div className="h-[280px] rounded-lg bg-slate-800" />
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-[#2a2a3e]">
      <div className="border-b border-[#2a2a3e] bg-[#1a1a2e] px-4 py-3">
        <div className="flex gap-8">
          {[120, 80, 60, 80, 80, 60].map((w, i) => (
            <div key={i} className="h-3 rounded bg-slate-700" style={{ width: w }} />
          ))}
        </div>
      </div>
      {[0, 1].map((i) => (
        <div
          key={i}
          className={["border-b border-[#2a2a3e] px-4 py-3 last:border-0", i % 2 === 0 ? "bg-[#1a1a2e]" : "bg-[#16162a]"].join(" ")}
        >
          <div className="flex gap-8">
            {[120, 80, 60, 80, 80, 60].map((w, j) => (
              <div key={j} className="h-3 rounded bg-slate-800" style={{ width: w }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ResultsStep() {
  const router = useRouter();
  const { clear } = useEvaluationWizard();
  const {
    results,
    isLoading,
    isError,
    retryCount,
    refetch,
    completionDate,
    testCaseCount,
    topPerformer,
    avgAccuracy,
    overallScore,
    barChartData,
    radarChartData,
    tableRows,
  } = useResultsStep();

  const handleNewEvaluation = () => {
    clear();
    router.push("/");
  };

  const handleStepClick = (step: number) => {
    const routes: Record<number, string> = {
      1: "/",
      2: "/dataset",
      3: "/viewdata",
      4: "/running",
    };
    if (routes[step]) router.push(routes[step]);
  };

  const handleExport = () => {
    const prevTitle = document.title;
    try {
      document.title = `eval-results-${completionDate}`;
      window.print();
    } finally {
      document.title = prevTitle;
    }
  };

  const isEmpty = !isLoading && !isError && results !== null && results.length === 0;
  const isSuccess = !isLoading && !isError && results !== null && results.length > 0;

  return (
    <div className="min-h-screen bg-[#0f0f1a] px-4 py-8 text-slate-100">
      <div className="mx-auto w-full max-w-5xl">

        {/* Header */}
        <header className="mb-6 flex items-start gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-sm font-bold text-white">
            LLM
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-semibold tracking-tight text-slate-100">
              LLM Evaluation System
            </div>
            <div className="mt-1 text-sm text-slate-400">
              Test and compare language models with custom prompts and datasets
            </div>
          </div>
        </header>

        {/* Stepper */}
        <div className="no-print mb-6">
          <StepStepper activeStep={5} onStepClick={handleStepClick} />
        </div>

        {/* Results section title + completion date */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-100">Evaluation Results</h1>
          {(isSuccess || isLoading) && (
            <span className="text-sm text-slate-400">Completed on {completionDate}</span>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SkeletonChartArea />
              <SkeletonChartArea />
            </div>
            <SkeletonTable />
          </div>
        )}

        {/* Error state */}
        {isError && (
          <section className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-12 text-center shadow-xl shadow-black/30">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-rose-900/40 ring-1 ring-rose-500/40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-7 text-rose-400" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-rose-300">Could not load evaluation results</h2>
            {retryCount === 0 ? (
              <>
                <p className="mb-6 text-sm text-slate-400">An error occurred while fetching your results. Please try again.</p>
                <button
                  type="button"
                  onClick={refetch}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white hover:from-violet-500 hover:to-fuchsia-400"
                >
                  Retry
                </button>
              </>
            ) : (
              <>
                <p className="mb-6 text-sm text-slate-400">Results could not be loaded. Please start a new evaluation.</p>
                <button
                  type="button"
                  onClick={handleNewEvaluation}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800"
                >
                  New Evaluation
                </button>
              </>
            )}
          </section>
        )}

        {/* Empty state */}
        {isEmpty && (
          <section className="rounded-2xl border border-[#2a2a3e] bg-[#1a1a2e] p-12 text-center shadow-xl shadow-black/30">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-slate-800 ring-1 ring-slate-600/40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-7 text-slate-400" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-slate-200">No evaluation results found</h2>
            <p className="mb-6 text-sm text-slate-400">Run an evaluation to see results here.</p>
            <button
              type="button"
              onClick={handleNewEvaluation}
              className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800"
            >
              New Evaluation
            </button>
          </section>
        )}

        {/* Success state */}
        {isSuccess && (
          <div className="space-y-6">

            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryCard
                title="Top Performer"
                value={topPerformer}
                subtitle={`${overallScore}% score`}
                accentColor="gold"
                icon={<TrophyIcon />}
              />
              <SummaryCard
                title="Avg Accuracy"
                value={`${avgAccuracy}%`}
                subtitle="Across all models"
                accentColor="blue"
                icon={<AccuracyIcon />}
              />
              <SummaryCard
                title="Tests Run"
                value={testCaseCount !== null ? String(testCaseCount) : "—"}
                subtitle="Total evaluations"
                accentColor="purple"
                icon={<TestsIcon />}
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <section className="rounded-2xl border border-[#2a2a3e] bg-[#1a1a2e] p-6 shadow-xl shadow-black/30">
                <h2 className="mb-4 text-sm font-semibold text-slate-200">Overall Performance</h2>
                <OverallPerformanceChart data={barChartData} />
              </section>
              <section className="rounded-2xl border border-[#2a2a3e] bg-[#1a1a2e] p-6 shadow-xl shadow-black/30">
                <h2 className="mb-4 text-sm font-semibold text-slate-200">Multi-Dimensional Analysis</h2>
                <MultiDimensionalChart data={radarChartData} />
              </section>
            </div>

            {/* Results table */}
            <ResultsTable rows={tableRows} />

          </div>
        )}

        {/* Navigation row */}
        {(isSuccess || isLoading) && (
          <div className="no-print mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleNewEvaluation}
              className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800"
            >
              New Evaluation
            </button>
            {isSuccess && (
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:from-violet-500 hover:to-fuchsia-400"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v5.69l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72V3.75A.75.75 0 0 1 10 3ZM3.75 15a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Z" clipRule="evenodd" />
                </svg>
                Export Results
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
