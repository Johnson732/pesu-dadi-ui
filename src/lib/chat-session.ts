export type Gender = "male" | "female";
export type AgeRange = "18-25" | "25-35" | ">35";
export type SessionStatus = "idle" | "searching" | "matched" | "disconnected";

export interface UserPreferences {
  gender: Gender;
  ageRange: AgeRange;
}

export interface PartnerProfile {
  gender?: Gender;
  region?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isOwn: boolean;
  createdAt?: string;
}

export interface ActiveSession {
  sessionId: string;
  roomId?: string;
  status?: SessionStatus;
  partner?: PartnerProfile;
}

const USER_PREFERENCES_KEY = "pesudadi.userPreferences";
const ACTIVE_SESSION_KEY = "pesudadi.activeSession";
const CHAT_MESSAGES_KEY_PREFIX = "pesudadi.chatMessages";

export function saveUserPreferences(preferences: UserPreferences) {
  localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
}

export function getUserPreferences(): UserPreferences | null {
  const rawValue = localStorage.getItem(USER_PREFERENCES_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as Partial<UserPreferences> & { ageRange?: string };
    const normalizedAgeRange = normalizeAgeRange(parsed.ageRange);

    if ((parsed.gender !== "male" && parsed.gender !== "female") || !normalizedAgeRange) {
      localStorage.removeItem(USER_PREFERENCES_KEY);
      return null;
    }

    const normalized = {
      gender: parsed.gender,
      ageRange: normalizedAgeRange,
    } satisfies UserPreferences;

    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    return null;
  }
}

export function saveActiveSession(session: ActiveSession) {
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
}

export function getActiveSession(): ActiveSession | null {
  const rawValue = localStorage.getItem(ACTIVE_SESSION_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as Partial<ActiveSession>;

    if (!parsed.sessionId || typeof parsed.sessionId !== "string") {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
      return null;
    }

    return parsed as ActiveSession;
  } catch {
    return null;
  }
}

export function clearActiveSession() {
  localStorage.removeItem(ACTIVE_SESSION_KEY);
}

function getChatMessagesKey(sessionId: string, roomId: string) {
  return `${CHAT_MESSAGES_KEY_PREFIX}.${sessionId}.${roomId}`;
}

export function saveChatMessages(sessionId: string, roomId: string, messages: ChatMessage[]) {
  localStorage.setItem(getChatMessagesKey(sessionId, roomId), JSON.stringify(messages));
}

export function getChatMessages(sessionId: string, roomId: string): ChatMessage[] {
  const rawValue = localStorage.getItem(getChatMessagesKey(sessionId, roomId));
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (message): message is ChatMessage =>
        Boolean(message) &&
        typeof message.id === "string" &&
        typeof message.text === "string" &&
        typeof message.isOwn === "boolean" &&
        (message.createdAt === undefined || typeof message.createdAt === "string"),
    );
  } catch {
    return [];
  }
}

export function clearChatMessages(sessionId: string, roomId: string) {
  localStorage.removeItem(getChatMessagesKey(sessionId, roomId));
}

function normalizeAgeRange(ageRange?: string): AgeRange | null {
  switch (ageRange) {
    case "18-25":
    case "25-35":
    case ">35":
      return ageRange;
    case "18-24":
      return "18-25";
    case "25-34":
      return "25-35";
    case "35-44":
    case "45+":
    case "25+":
      return ">35";
    default:
      return null;
  }
}
