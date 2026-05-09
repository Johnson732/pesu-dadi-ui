import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getUserPreferences } from "@/lib/chat-session";
import { useChatSession } from "@/hooks/use-chat-session";

export default function Searching() {
  const [, setLocation] = useLocation();
  const { roomId, status, terminalEvent, startSearching, disconnectCurrent, resetSession } = useChatSession();
  const hasStartedSearchRef = useRef(false);

  useEffect(() => {
    const preferences = getUserPreferences();
    if (!preferences) {
      setLocation("/");
      return;
    }

    if (roomId || status === "matched") {
      setLocation("/chat");
      return;
    }

    if (hasStartedSearchRef.current) {
      return;
    }

    hasStartedSearchRef.current = true;
    void startSearching(preferences).catch((error) => {
      console.error(error);
      resetSession();
      setLocation("/disconnected");
    });
  }, [resetSession, roomId, setLocation, startSearching, status]);

  useEffect(() => {
    if (roomId || status === "matched") {
      setLocation("/chat");
    }
  }, [roomId, setLocation, status]);

  useEffect(() => {
    if (terminalEvent === "DISCONNECTED") {
      setLocation("/disconnected");
    }
  }, [setLocation, terminalEvent]);

  const handleCancelSearch = async () => {
    try {
      await disconnectCurrent();
    } catch (error) {
      console.error(error);
    } finally {
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
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
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
          <p className="text-gray-500">Waiting for a match from the Java backend</p>
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
