export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000";

export const API_ENDPOINTS = {
  llms: "/llm",
  refine: "/refine",
} as const;

export function apiUrl(pathname: string, searchParams?: Record<string, string>) {
  const url = new URL(pathname, API_BASE_URL);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) url.searchParams.set(k, v);
  }
  return url.toString();
}

