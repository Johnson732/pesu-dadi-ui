import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import ChatBubble from "@/components/ChatBubble";
import TypingIndicator from "@/components/TypingIndicator";
import {
  clearActiveSession,
  getActiveSession,
  getUserPreferences,
  saveActiveSession,
  type ChatMessage as SessionMessage,
} from "@/lib/chat-session";
import {
  disconnectSession,
  getSessionState,
  nextSession,
  persistSession,
  sendMessage,
} from "@/lib/chat-api";

export default function Chat() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState(() => getActiveSession()?.sessionId ?? "");
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [partnerGender, setPartnerGender] = useState<"male" | "female" | undefined>();
  const [partnerRegion, setPartnerRegion] = useState("Unknown");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPartnerTyping]);

  useEffect(() => {
    let cancelled = false;

    if (!sessionId) {
      setLocation("/");
      return;
    }

    const syncSession = async () => {
      try {
        const session = await getSessionState(sessionId);
        if (cancelled) return;

        if (session.status === "disconnected") {
          clearActiveSession();
          setLocation("/disconnected");
          return;
        }

        setMessages(session.messages);
        setPartnerGender(session.partner?.gender);
        setPartnerRegion(session.partner?.region ?? "Unknown");
        saveActiveSession(persistSession(session));
      } catch (error) {
        if (!cancelled) {
          console.error(error);
        }
      }
    };

    syncSession();
    const interval = setInterval(syncSession, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId, setLocation]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !sessionId) return;

    if (!getActiveSession()?.sessionId) {
      setLocation("/");
      return;
    }

    const messageText = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    try {
      const newMessage = await sendMessage(sessionId, messageText);
      setMessages((prev) => [...prev, newMessage]);
      setIsPartnerTyping(true);

      const refreshedSession = await getSessionState(sessionId);
      setMessages(refreshedSession.messages);
      setPartnerGender(refreshedSession.partner?.gender);
      setPartnerRegion(refreshedSession.partner?.region ?? "Unknown");
    } catch (error) {
      console.error(error);
      setInputValue(messageText);
    } finally {
      setIsSending(false);
      setIsPartnerTyping(false);
    }
  };

  const handleDisconnect = async () => {
    const activeSession = getActiveSession();

    try {
      if (activeSession?.sessionId) {
        await disconnectSession(activeSession.sessionId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      clearActiveSession();
      setLocation("/disconnected");
    }
  };

  const handleNextChat = async () => {
    const activeSession = getActiveSession();
    const preferences = getUserPreferences();

    if (!activeSession?.sessionId || !preferences) {
      clearActiveSession();
      setLocation("/searching");
      return;
    }

    try {
      const nextMatch = await nextSession(activeSession.sessionId, preferences);
      saveActiveSession(persistSession(nextMatch));
      setSessionId(nextMatch.sessionId);
      setMessages(nextMatch.messages ?? []);
      setPartnerGender(nextMatch.partner?.gender);
      setPartnerRegion(nextMatch.partner?.region ?? "Unknown");
      setLocation(nextMatch.status === "matched" ? "/chat" : "/searching");
    } catch (error) {
      console.error(error);
      clearActiveSession();
      setLocation("/searching");
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-gray-50/50">
      <Navbar 
        partnerGender={partnerGender}
        partnerRegion={partnerRegion}
        onDisconnect={handleDisconnect}
        onNext={handleNextChat}
      />

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ChatBubble text={msg.text} isOwn={msg.isOwn} />
              </motion.div>
            ))}
            {isPartnerTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-gray-200/50">
        <form onSubmit={handleSend} className="flex items-center space-x-2 max-w-4xl mx-auto">
          <Button
            type="button"
            onClick={handleNextChat}
            className="h-14 rounded-2xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex-shrink-0 px-4 font-medium shadow-sm transition-all"
            data-testid="button-next-chat-input"
          >
            Next
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-14 rounded-2xl bg-gray-50/50 border-gray-200 focus-visible:ring-indigo-500 text-base px-6"
          />
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isSending}
            className="h-14 w-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 flex-shrink-0 transition-all"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
