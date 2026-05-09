import type { ActiveSession, AgeRange, Gender, UserPreferences } from "@/lib/chat-session";

export interface CreateSessionResponse {
  sessionId: string;
  status: "IDLE" | "SEARCHING" | "MATCHED" | "DISCONNECTED";
}

export interface SessionStateResponse {
  status: "IDLE" | "SEARCHING" | "MATCHED" | "DISCONNECTED";
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function withBase(path: string) {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) {
        message = data.message;
      }
    } catch {
      // Keep the fallback error message when the backend returns no JSON body.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(withBase(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  return parseResponse<T>(response);
}

function toBackendGender(gender: Gender) {
  return gender.toUpperCase();
}

function toBackendAgeRange(ageRange: AgeRange) {
  switch (ageRange) {
    case "18-25":
      return "EIGHTEEN_TO_TWENTY_FOUR";
    case "25-35":
      return "TWENTY_FIVE_TO_THIRTY_FOUR";
    case ">35":
      return "THIRTY_FIVE_TO_FORTY_FOUR";
  }
}

export function createSession() {
  return request<CreateSessionResponse>("/api/session", {
    method: "POST",
  });
}

export function startMatch(sessionId: string, preferences: UserPreferences) {
  return request<SessionStateResponse>("/api/chat/start", {
    method: "POST",
    body: JSON.stringify({
      sessionId,
      gender: toBackendGender(preferences.gender),
      ageRange: toBackendAgeRange(preferences.ageRange),
    }),
  });
}

export function disconnectSession(sessionId: string) {
  return request<SessionStateResponse>("/api/chat/disconnect", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}

export function persistSession(match: CreateSessionResponse): ActiveSession {
  return {
    sessionId: match.sessionId,
    status: match.status.toLowerCase() as ActiveSession["status"],
  };
}
