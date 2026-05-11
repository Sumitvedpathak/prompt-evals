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

export type EvaluateResponse = unknown;

