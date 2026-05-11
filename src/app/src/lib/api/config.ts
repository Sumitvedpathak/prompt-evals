export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000";

export const API_ENDPOINTS = {
  llms: "/llm",
  refine: "/refine",
  datasetCreate: "/dataset/create",
  testcaseEvaluate: "/testcase/evaluate",
  testcaseProgress: "/testcase/progress",
  evalResults: "/eval/results",
} as const;

export const ENDPOINT_DATASET_CREATE = API_ENDPOINTS.datasetCreate;
export const ENDPOINT_EVAL_RESULTS = API_ENDPOINTS.evalResults;

export function apiUrl(pathname: string, searchParams?: Record<string, string>) {
  const url = new URL(pathname, API_BASE_URL);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) url.searchParams.set(k, v);
  }
  return url.toString();
}

