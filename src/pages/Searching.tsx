import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  clearActiveSession,
  getActiveSession,
  getUserPreferences,
  saveActiveSession,
} from "@/lib/chat-session";
import { disconnectSession, getSessionState, persistSession, startMatch } from "@/lib/chat-api";

export default function Searching() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    let cancelled = false;
    let pollInterval: number | undefined;

    const stopPolling = () => {
      if (pollInterval !== undefined) {
        window.clearInterval(pollInterval);
        pollInterval = undefined;
      }
    };

    const resolveSession = async (sessionId: string) => {
      const session = await getSessionState(sessionId);
      if (cancelled) return;

      saveActiveSession(persistSession(session));

      if (session.status === "matched") {
        stopPolling();
        setLocation("/chat");
        return;
      }

      if (session.status === "disconnected") {
        stopPolling();
        clearActiveSession();
        setLocation("/disconnected");
      }
    };

    const searchForMatch = async () => {
      const preferences = getUserPreferences();

      if (!preferences) {
        setLocation("/");
        return;
      }

      const activeSession = getActiveSession();

      try {
        if (activeSession?.sessionId) {
          await resolveSession(activeSession.sessionId);
        } else {
          const match = await startMatch(preferences);
          if (cancelled) return;

          saveActiveSession(persistSession(match));

          if (match.status === "matched") {
            setLocation("/chat");
            return;
          }
        }

        const currentSession = getActiveSession();
        if (!currentSession?.sessionId || cancelled) {
          return;
        }

        pollInterval = window.setInterval(() => {
          void resolveSession(currentSession.sessionId);
        }, 3000);
      } catch (error) {
        if (cancelled) return;

        console.error(error);
        clearActiveSession();
        setLocation("/disconnected");
      }
    };

    void searchForMatch();

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [setLocation]);

  const handleCancelSearch = async () => {
    const activeSession = getActiveSession();

    try {
      if (activeSession?.sessionId) {
        await disconnectSession(activeSession.sessionId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      clearActiveSession();
      setLocation("/");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50/50 relative overflow-hidden"
    >
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="z-10 flex flex-col items-center space-y-8 text-center p-6">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 rounded-full border-4 border-indigo-100 border-t-indigo-600"
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-indigo-600 rounded-full" />
            </div>
          </motion.div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Searching for someone...</h2>
          <p className="text-gray-500">Please wait while we find a match</p>
        </div>

        <Button 
          variant="ghost" 
          onClick={() => {
            void handleCancelSearch();
          }}
          className="text-gray-500 hover:text-gray-900 rounded-2xl h-12 px-8"
        >
          Cancel Search
        </Button>
      </div>
    </motion.div>
  );
}
