import { useCallback, useEffect, useState } from "react";
import { createSession, disconnectSession, persistSession, startMatch } from "@/lib/chat-api";
import { subscribeToSession, type SessionEvent } from "@/lib/chat-realtime";
import {
  clearActiveSession,
  clearChatMessages,
  getActiveSession,
  saveActiveSession,
  type ActiveSession,
  type UserPreferences,
} from "@/lib/chat-session";

type TerminalSessionEvent = "PARTNER_DISCONNECTED" | "DISCONNECTED" | null;

function normalizePartnerGender(event: SessionEvent): ActiveSession["partner"] {
  if (event.partnerGender === "FEMALE") {
    return { gender: "female" };
  }

  if (event.partnerGender === "MALE") {
    return { gender: "male" };
  }

  return undefined;
}

export function useChatSession() {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(() => getActiveSession());
  const [terminalEvent, setTerminalEvent] = useState<TerminalSessionEvent>(null);

  const updateActiveSession = useCallback((nextSession: ActiveSession | null) => {
    setActiveSession(nextSession);

    if (nextSession) {
      saveActiveSession(nextSession);
      return nextSession;
    }

    clearActiveSession();
    return null;
  }, []);

  const resetSession = useCallback(() => {
    updateActiveSession(null);
  }, [updateActiveSession]);

  const clearCurrentRoomMessages = useCallback((session: ActiveSession | null) => {
    if (session?.sessionId && session.roomId) {
      clearChatMessages(session.sessionId, session.roomId);
    }
  }, []);

  useEffect(() => {
    let unsubscribeSession: (() => void) | undefined;

    if (!activeSession?.sessionId) {
      return;
    }

    const wireSession = async () => {
      unsubscribeSession = await subscribeToSession(activeSession.sessionId, (event: SessionEvent) => {
        if (event.type === "PARTNER_DISCONNECTED" || event.type === "DISCONNECTED") {
          clearCurrentRoomMessages(getActiveSession() ?? activeSession);
          resetSession();
          setTerminalEvent(event.type);
          return;
        }

        setTerminalEvent(null);
        const latestSession = getActiveSession();
        const nextSession = {
          ...(latestSession?.sessionId === activeSession.sessionId ? latestSession : activeSession),
          roomId: event.roomId ?? undefined,
          status: event.status.toLowerCase() as ActiveSession["status"],
          partner: normalizePartnerGender(event) ?? latestSession?.partner ?? activeSession.partner,
        } satisfies ActiveSession;

        updateActiveSession(nextSession);
      });
    };

    void wireSession();

    return () => {
      unsubscribeSession?.();
    };
  }, [activeSession, clearCurrentRoomMessages, resetSession, updateActiveSession]);

  const startSearching = useCallback(
    async (preferences: UserPreferences) => {
      setTerminalEvent(null);
      const existingSession = getActiveSession() ?? activeSession;
      const session = existingSession ?? persistSession(await createSession());

      updateActiveSession(session);
      const matchState = await startMatch(session.sessionId, preferences);
      const latestSession = getActiveSession();
      updateActiveSession({
        ...(latestSession?.sessionId === session.sessionId ? latestSession : session),
        status: matchState.status.toLowerCase() as ActiveSession["status"],
      });

      return matchState.status;
    },
    [activeSession, updateActiveSession],
  );

  const disconnectCurrent = useCallback(async () => {
    const session = getActiveSession() ?? activeSession;

    try {
      if (session?.sessionId) {
        await disconnectSession(session.sessionId);
      }
    } finally {
      clearCurrentRoomMessages(session);
      resetSession();
      setTerminalEvent(null);
    }
  }, [activeSession, clearCurrentRoomMessages, resetSession]);

  const skipToNextMatch = useCallback(
    async (preferences: UserPreferences) => {
      const session = getActiveSession() ?? activeSession;

      if (!session?.sessionId) {
        resetSession();
        throw new Error("No active session");
      }

      setTerminalEvent(null);
      clearCurrentRoomMessages(session);
      const nextState = await startMatch(session.sessionId, preferences);
      const latestSession = getActiveSession();
      updateActiveSession({
        ...(latestSession?.sessionId === session.sessionId ? latestSession : { sessionId: session.sessionId }),
        status: nextState.status.toLowerCase() as ActiveSession["status"],
      });

      return nextState.status;
    },
    [activeSession, clearCurrentRoomMessages, resetSession, updateActiveSession],
  );

  return {
    activeSession,
    sessionId: activeSession?.sessionId ?? "",
    roomId: activeSession?.roomId ?? "",
    partnerGender: activeSession?.partner?.gender,
    status: activeSession?.status,
    terminalEvent,
    resetSession,
    startSearching,
    disconnectCurrent,
    skipToNextMatch,
  };
}
