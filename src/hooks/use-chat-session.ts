import { useCallback, useEffect, useRef, useState } from "react";
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
  const activeSessionRef = useRef<ActiveSession | null>(activeSession);
  const unsubscribeSessionRef = useRef<(() => void) | null>(null);
  const subscriptionPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

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

  const ensureSessionSubscription = useCallback(async (session: ActiveSession) => {
    if (activeSessionRef.current?.sessionId !== session.sessionId) {
      unsubscribeSessionRef.current?.();
      unsubscribeSessionRef.current = null;
      subscriptionPromiseRef.current = null;
    }

    if (unsubscribeSessionRef.current) {
      return;
    }

    if (subscriptionPromiseRef.current) {
      await subscriptionPromiseRef.current;
      return;
    }

    subscriptionPromiseRef.current = (async () => {
      const unsubscribe = await subscribeToSession(session.sessionId, (event: SessionEvent) => {
        const currentSession = getActiveSession() ?? activeSessionRef.current ?? session;

        if (event.type === "PARTNER_DISCONNECTED" || event.type === "DISCONNECTED") {
          clearCurrentRoomMessages(currentSession);
          unsubscribeSessionRef.current?.();
          unsubscribeSessionRef.current = null;
          subscriptionPromiseRef.current = null;
          resetSession();
          setTerminalEvent(event.type);
          return;
        }

        setTerminalEvent(null);
        const latestSession = getActiveSession() ?? currentSession;
        const nextSession = {
          ...(latestSession?.sessionId === session.sessionId ? latestSession : session),
          roomId: event.roomId ?? undefined,
          status: event.status.toLowerCase() as ActiveSession["status"],
          partner: normalizePartnerGender(event) ?? latestSession?.partner ?? session.partner,
        } satisfies ActiveSession;

        updateActiveSession(nextSession);
      });

      unsubscribeSessionRef.current = unsubscribe;
    })();

    try {
      await subscriptionPromiseRef.current;
    } finally {
      subscriptionPromiseRef.current = null;
    }
  }, [clearCurrentRoomMessages, resetSession, updateActiveSession]);

  useEffect(() => {
    if (!activeSession?.sessionId) {
      unsubscribeSessionRef.current?.();
      unsubscribeSessionRef.current = null;
      subscriptionPromiseRef.current = null;
      return;
    }

    void ensureSessionSubscription(activeSession);

    return () => {
      if (!activeSessionRef.current?.sessionId) {
        unsubscribeSessionRef.current?.();
        unsubscribeSessionRef.current = null;
        subscriptionPromiseRef.current = null;
      }
    };
  }, [activeSession?.sessionId, ensureSessionSubscription]);

  const startSearching = useCallback(
    async (preferences: UserPreferences) => {
      setTerminalEvent(null);
      const existingSession = getActiveSession() ?? activeSession;
      const session = existingSession ?? persistSession(await createSession());

      updateActiveSession(session);
      await ensureSessionSubscription(session);
      const matchState = await startMatch(session.sessionId, preferences);
      const latestSession = getActiveSession();
      updateActiveSession({
        ...(latestSession?.sessionId === session.sessionId ? latestSession : session),
        status: matchState.status.toLowerCase() as ActiveSession["status"],
      });

      return matchState.status;
    },
    [activeSession, ensureSessionSubscription, updateActiveSession],
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
