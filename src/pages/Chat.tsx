import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Navbar from "@/components/Navbar";
import ChatBubble from "@/components/ChatBubble";
import TypingIndicator from "@/components/TypingIndicator";
import {
  getChatMessages,
  getUserPreferences,
  saveChatMessages,
  type ChatMessage as SessionMessage,
} from "@/lib/chat-session";
import { sendRoomMessage, subscribeToRoom } from "@/lib/chat-realtime";
import { useChatSession } from "@/hooks/use-chat-session";

export default function Chat() {
  const [, setLocation] = useLocation();
  const { sessionId, roomId, partnerGender, terminalEvent, disconnectCurrent, skipToNextMatch, resetSession } = useChatSession();
  const [messages, setMessages] = useState<SessionMessage[]>(() =>
    sessionId && roomId ? getChatMessages(sessionId, roomId) : [],
  );
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!sessionId || !roomId) {
      return;
    }

    setMessages(getChatMessages(sessionId, roomId));
  }, [roomId, sessionId]);

  useEffect(() => {
    if (!sessionId || !roomId) {
      return;
    }

    saveChatMessages(sessionId, roomId, messages);
  }, [messages, roomId, sessionId]);

  useEffect(() => {
    if (!sessionId && !terminalEvent) {
      setLocation("/");
    }
  }, [sessionId, setLocation, terminalEvent]);

  useEffect(() => {
    if (terminalEvent) {
      setLocation("/disconnected");
    }
  }, [setLocation, terminalEvent]);

  useEffect(() => {
    let unsubscribeRoom: (() => void) | undefined;

    if (!sessionId || !roomId) {
      return;
    }

    const wireRoom = async () => {
      unsubscribeRoom = await subscribeToRoom(
        roomId,
        (message) => {
          setMessages((prev) => {
            if (prev.some((existing) => existing.id === message.id)) {
              return prev;
            }

            return [...prev, message];
          });
        },
        sessionId,
      );
    };

    void wireRoom();

    return () => {
      unsubscribeRoom?.();
    };
  }, [roomId, sessionId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !sessionId || !roomId) return;

    const messageText = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    try {
      await sendRoomMessage(sessionId, roomId, messageText);
    } catch (error) {
      console.error(error);
      setInputValue(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectCurrent();
    } catch (error) {
      console.error(error);
    } finally {
      setLocation("/disconnected");
    }
  };

  const handleNextChat = async () => {
    const preferences = getUserPreferences();

    if (!preferences) {
      resetSession();
      setLocation("/searching");
      return;
    }

    try {
      const nextStatus = await skipToNextMatch(preferences);
      setMessages([]);
      setLocation(nextStatus === "MATCHED" ? "/chat" : "/searching");
    } catch (error) {
      console.error(error);
      resetSession();
      setLocation("/searching");
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-gray-50/50">
      <Navbar
        isConnected={Boolean(roomId)}
        partnerGender={partnerGender}
        onDisconnect={handleDisconnect}
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
          </AnimatePresence>
          {!roomId && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-gray-200/50">
        <form onSubmit={handleSend} className="flex items-center space-x-2 max-w-4xl mx-auto">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                className="h-14 rounded-2xl bg-amber-100 border border-amber-200 text-amber-900 hover:bg-amber-200 flex-shrink-0 px-5 font-semibold shadow-sm transition-all"
                data-testid="button-next-chat-input"
              >
                Skip
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Skip this chat?</AlertDialogTitle>
                <AlertDialogDescription>
                  Do you really want to skip this stranger and look for someone else?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    void handleNextChat();
                  }}
                >
                  Yes, skip
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={roomId ? "Type a message..." : "Waiting for match..."}
            disabled={!roomId}
            className="flex-1 h-14 rounded-2xl bg-gray-50/50 border-gray-200 focus-visible:ring-indigo-500 text-base px-6"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isSending || !roomId}
            className="h-14 w-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 flex-shrink-0 transition-all"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
