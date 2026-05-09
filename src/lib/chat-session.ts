export type Gender = "male" | "female";

export interface UserPreferences {
  gender: Gender;
  ageRange: string;
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
  partner?: PartnerProfile;
}

const USER_PREFERENCES_KEY = "pesudadi.userPreferences";
const ACTIVE_SESSION_KEY = "pesudadi.activeSession";

export function saveUserPreferences(preferences: UserPreferences) {
  localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
}

export function getUserPreferences(): UserPreferences | null {
  const rawValue = localStorage.getItem(USER_PREFERENCES_KEY);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as UserPreferences;
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
    return JSON.parse(rawValue) as ActiveSession;
  } catch {
    return null;
  }
}

export function clearActiveSession() {
  localStorage.removeItem(ACTIVE_SESSION_KEY);
}
