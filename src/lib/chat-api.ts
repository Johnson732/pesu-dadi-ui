import type {
  ActiveSession,
  ChatMessage,
  PartnerProfile,
  UserPreferences,
} from "@/lib/chat-session";

export interface MatchResponse {
  sessionId: string;
  status: "searching" | "matched";
  partner?: PartnerProfile;
  messages?: ChatMessage[];
}

export interface SessionStateResponse {
  sessionId: string;
  status: "searching" | "matched" | "disconnected";
  partner?: PartnerProfile;
  messages: ChatMessage[];
}

type PersistableSession =
  | ActiveSession
  | MatchResponse
  | SessionStateResponse;

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

export function startMatch(preferences: UserPreferences) {
  return request<MatchResponse>("/api/chat/match", {
    method: "POST",
    body: JSON.stringify({
      gender: preferences.gender,
      ageRange: preferences.ageRange,
    }),
  });
}

export function getSessionState(sessionId: string) {
  return request<SessionStateResponse>(`/api/chat/sessions/${sessionId}`);
}

export function sendMessage(sessionId: string, text: string) {
  return request<ChatMessage>(`/api/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function disconnectSession(sessionId: string) {
  return request<{ success: true }>(`/api/chat/sessions/${sessionId}/disconnect`, {
    method: "POST",
  });
}

export async function nextSession(sessionId: string, preferences: UserPreferences) {
  await request<{ success: true }>(`/api/chat/sessions/${sessionId}/next`, {
    method: "POST",
  });

  return startMatch(preferences);
}

export function persistSession(match: PersistableSession) {
  return {
    sessionId: match.sessionId,
    partner: "partner" in match ? match.partner : undefined,
  };
}
