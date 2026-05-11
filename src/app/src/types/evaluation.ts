export type TargetModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export type LLMModel = TargetModel;

export type Step1State = {
  mainPrompt: string;
  targetModelId: string;
  targetModel: TargetModel;
};

export type DatasetStepState = {
  datasetPrompt: string;
  datasetModelId: string;
  datasetModel: LLMModel;
  testCaseCount: number;
};

export type RefineMainPromptRequest = {
  type: "main";
  prompt: string;
  target_model: string;
};

export type RefineMainPromptResponse = {
  refined_prompt: string;
};

export type RefineDatasetPromptRequest = {
  type: "default_ds_prompt";
  prompt: string;
  target_model: string;
};

export type RefineDatasetPromptResponse = RefineMainPromptResponse;

export type GenerateCreateRequest = {
  dataset_prompt: string;
  dataset_model: string;
  count: number;
};

export type GenerateCreateResponse = unknown;

export type ViewDataStepState = {
  evalModelId: string;
  evalModel: LLMModel;
};

export type EvaluateRequest = {
  main_prompt: string;
  main_model: string;
  evaluate_model: string;
};

export type EvaluateResponse = {
  status: string;
  total: number;
};

export type EvalProgressResponse = {
  completed: number;
  total: number;
  status: "idle" | "running" | "complete" | "error";
};

export type EvaluationSummary = {
  overall_score: number;
  grade: string;
  pass: boolean;
};

export type DimensionScores = {
  accuracy: number;
  consistency: number;
  creativity: number;
  safety: number;
  instruction_adherence: number;
  naturalness: number;
  brevity_efficiency: number;
};

export type EvalResult = {
  id: string;
  category: string;
  difficulty: string;
  evaluation_summary: EvaluationSummary;
  dimension_scores: DimensionScores;
  detected_failure_modes: string[];
  detected_strengths: string[];
  detected_issues: string[];
  evaluation_confidence: number;
  recommended_action: string;
};

export type EvalResultsResponse = EvalResult[];

