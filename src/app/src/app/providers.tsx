"use client";

import { EvaluationWizardProvider } from "@/features/evaluation/store/evaluationWizardStore";

export function Providers({ children }: { children: React.ReactNode }) {
  return <EvaluationWizardProvider>{children}</EvaluationWizardProvider>;
}

