export type TargetModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export type Step1State = {
  mainPrompt: string;
  targetModelId: string;
  targetModel: TargetModel;
};

export type RefineMainPromptRequest = {
  type: "main";
  prompt: string;
  target_model: string;
};

export type RefineMainPromptResponse = {
  refined_prompt: string;
};

