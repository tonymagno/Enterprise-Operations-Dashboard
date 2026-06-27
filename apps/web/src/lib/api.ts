// apps/web/src/lib/api.ts

const API_BASE_URL = "http://127.0.0.1:8000";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Só adiciona Authorization se estivermos no browser e o token existir
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export async function apiPost<T>(
  endpoint: string,
  body: unknown
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export async function apiPut<T>(
  endpoint: string,
  body: unknown
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export async function apiDelete(endpoint: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
}