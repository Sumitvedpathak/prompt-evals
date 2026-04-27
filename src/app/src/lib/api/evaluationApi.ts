import { API_ENDPOINTS, apiUrl } from "./config";
import type {
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
    throw new Error("Invalid /llms response shape");
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

  throw new Error("Invalid /llms response shape");
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

