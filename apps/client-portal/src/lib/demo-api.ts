export const DEMO_API_KEY = "COMPLIANCE_DEMO_KEY_abc123xyz";

export async function fetchDemo<T>(input: RequestInfo, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${DEMO_API_KEY}`);
  headers.set("Accept", "application/json");

  return fetch(input, { ...init, headers, cache: "no-store" }) as Promise<Response>;
}

