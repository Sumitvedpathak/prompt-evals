import { API_ENDPOINTS, apiUrl } from "./config";
import type {
  EvalProgressResponse,
  EvalResultsResponse,
  EvaluateRequest,
  EvaluateResponse,
  GenerateCreateRequest,
  GenerateCreateResponse,
  LLMModel,
  RefineDatasetPromptRequest,
  RefineDatasetPromptResponse,
  RefineMainPromptRequest,
  RefineMainPromptResponse,
  TargetModel,
} from "@/types/evaluation";

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) throw new Error("Empty response body");
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid JSON response");
  }
}

function isTargetModel(value: unknown): value is TargetModel {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.provider === "string" &&
    typeof v.description === "string"
  );
}

type LlmApiModel = {
  name: string;
  model: string;
  description: string;
};

function isLlmApiModel(value: unknown): value is LlmApiModel {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === "string" &&
    typeof v.model === "string" &&
    typeof v.description === "string"
  );
}

function toProviderLabel(modelId: string): string {
  const raw = modelId.includes("/") ? modelId.split("/", 1)[0] : modelId;
  const normalized = raw.toLowerCase();
  if (normalized === "openai") return "OpenAI";
  if (normalized === "anthropic") return "Anthropic";
  if (normalized === "google") return "Google";
  return raw;
}

export async function getTargetModels(): Promise<TargetModel[]> {
  const res = await fetch(apiUrl(API_ENDPOINTS.llms, { type: "target" }), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Failed to load models (${res.status})`);
  const data = await parseJson<unknown>(res);
  if (!Array.isArray(data)) {
    throw new Error("Invalid /llm response shape");
  }

  // Accept either:
  // - UI-shape: { id, name, provider, description }
  // - Backend-shape: { name, model, description } (model is the stable identifier)
  if (data.every(isTargetModel)) return data;

  if (data.every(isLlmApiModel)) {
    return data.map((m) => ({
      id: m.model,
      name: m.name,
      provider: toProviderLabel(m.model),
      description: m.description,
    }));
  }

  throw new Error("Invalid /llm response shape");
}

export async function getDatasetModels(): Promise<TargetModel[]> {
  const res = await fetch(apiUrl(API_ENDPOINTS.llms, { type: "dataset" }), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Failed to load models (${res.status})`);
  const data = await parseJson<unknown>(res);
  if (!Array.isArray(data)) {
    throw new Error("Invalid /llm response shape");
  }

  if (data.every(isTargetModel)) return data;

  if (data.every(isLlmApiModel)) {
    return data.map((m) => ({
      id: m.model,
      name: m.name,
      provider: toProviderLabel(m.model),
      description: m.description,
    }));
  }

  throw new Error("Invalid /llm response shape");
}

export async function refineMainPrompt(
  input: RefineMainPromptRequest,
): Promise<RefineMainPromptResponse> {
  const res = await fetch(apiUrl(API_ENDPOINTS.refine), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) throw new Error(`Failed to refine prompt (${res.status})`);
  const data = await parseJson<unknown>(res);
  if (
    !data ||
    typeof data !== "object" ||
    typeof (data as { refined_prompt?: unknown }).refined_prompt !== "string"
  ) {
    throw new Error("Invalid /refine response shape");
  }
  return data as RefineMainPromptResponse;
}

export async function refineDatasetPrompt(
  input: RefineDatasetPromptRequest,
): Promise<RefineDatasetPromptResponse> {
  const res = await fetch(apiUrl(API_ENDPOINTS.refine), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) throw new Error(`Failed to refine prompt (${res.status})`);
  const data = await parseJson<unknown>(res);
  if (
    !data ||
    typeof data !== "object" ||
    typeof (data as { refined_prompt?: unknown }).refined_prompt !== "string"
  ) {
    throw new Error("Invalid /refine response shape");
  }
  return data as RefineDatasetPromptResponse;
}

export async function getEvalModels(): Promise<LLMModel[]> {
  const res = await fetch(apiUrl(API_ENDPOINTS.llms, { type: "evaluation" }), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Failed to load evaluation models (${res.status})`);
  const data = await parseJson<unknown>(res);
  if (!Array.isArray(data)) {
    throw new Error("Invalid /llm response shape");
  }
  if (data.length === 0) {
    throw new Error("No evaluation models available.");
  }

  if (data.every(isTargetModel)) return data;

  if (data.every(isLlmApiModel)) {
    return data.map((m) => ({
      id: m.model,
      name: m.name,
      provider: toProviderLabel(m.model),
      description: m.description,
    }));
  }

  throw new Error("Invalid /llm response shape");
}

export async function runEvaluation(input: EvaluateRequest): Promise<EvaluateResponse> {
  const res = await fetch(apiUrl(API_ENDPOINTS.testcaseEvaluate), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) throw new Error(`Evaluation request failed (${res.status})`);
  const parsed = await parseJson<unknown>(res);

  if (
    parsed !== null &&
    typeof parsed === "object" &&
    "status" in parsed &&
    (parsed as { status: unknown }).status === "started"
  ) {
    return parsed as EvaluateResponse;
  }

  if (
    parsed !== null &&
    typeof parsed === "object" &&
    "error" in parsed &&
    typeof (parsed as { error: unknown }).error === "string"
  ) {
    throw new Error((parsed as { error: string }).error);
  }

  throw new Error("Unexpected response from evaluate endpoint");
}

export async function getEvalProgress(): Promise<EvalProgressResponse> {
  const res = await fetch(apiUrl(API_ENDPOINTS.testcaseProgress), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Progress request failed (${res.status})`);
  return parseJson<EvalProgressResponse>(res);
}

export async function getEvalResults(): Promise<EvalResultsResponse> {
  const res = await fetch(apiUrl(API_ENDPOINTS.evalResults), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Failed to load results (${res.status})`);

  const data = await parseJson<unknown>(res);

  if (!Array.isArray(data)) {
    throw new Error("Invalid /eval/results response shape");
  }

  return data as EvalResultsResponse;
}

export async function generateCreate(
  input: GenerateCreateRequest,
): Promise<GenerateCreateResponse> {
  const res = await fetch(apiUrl(API_ENDPOINTS.datasetCreate), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) throw new Error(`Failed to generate dataset (${res.status})`);
  // Shape not finalized yet.
  return parseJson<unknown>(res);
}
