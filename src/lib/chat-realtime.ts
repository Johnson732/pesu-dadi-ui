import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { ChatMessage } from "@/lib/chat-session";

type SessionEventType = "SEARCHING" | "MATCH_FOUND" | "PARTNER_DISCONNECTED" | "DISCONNECTED";
type SessionStatus = "IDLE" | "SEARCHING" | "MATCHED" | "DISCONNECTED";

export interface SessionEvent {
  type: SessionEventType;
  status: SessionStatus;
  sessionId: string;
  roomId: string | null;
  message: string;
  partnerGender?: "MALE" | "FEMALE" | "OTHER" | null;
}

export interface RoomMessageEvent {
  type: "CHAT_MESSAGE";
  roomId: string;
  senderSessionId: string;
  content: string;
  timestamp: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? window.location.origin).replace(/\/$/, "");
const WS_URL = `${API_BASE_URL}/ws`;

let client: Client | null = null;
let clientPromise: Promise<Client> | null = null;
let clientSessionId: string | null = null;

async function ensureClient(sessionId?: string) {
  if (sessionId && client && clientSessionId && clientSessionId !== sessionId) {
    const staleClient = client;
    client = null;
    clientPromise = null;
    clientSessionId = null;
    await staleClient.deactivate();
  }

  if (client?.connected && (!sessionId || clientSessionId === sessionId)) {
    return Promise.resolve(client);
  }

  if (clientPromise) {
    return clientPromise;
  }

  clientPromise = new Promise<Client>((resolve, reject) => {
    const nextClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: sessionId ? { sessionId } : {},
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        client = nextClient;
        clientSessionId = sessionId ?? clientSessionId;
        resolve(nextClient);
      },
      onStompError: (frame) => {
        reject(new Error(frame.headers.message ?? "WebSocket connection failed"));
      },
      onWebSocketError: () => {
        reject(new Error("WebSocket connection failed"));
      },
    });

    nextClient.activate();
  }).finally(() => {
    clientPromise = null;
  });

  return clientPromise;
}

export async function subscribeToSession(sessionId: string, onEvent: (event: SessionEvent) => void) {
  const activeClient = await ensureClient(sessionId);
  const subscription = activeClient.subscribe(`/topic/session/${sessionId}`, (message: IMessage) => {
    onEvent(JSON.parse(message.body) as SessionEvent);
  });

  return () => subscription.unsubscribe();
}

export async function subscribeToRoom(roomId: string, onMessage: (message: ChatMessage) => void, sessionId: string) {
  const activeClient = await ensureClient();
  const subscription: StompSubscription = activeClient.subscribe(`/topic/room/${roomId}`, (message: IMessage) => {
    const event = JSON.parse(message.body) as RoomMessageEvent;
    onMessage({
      id: `${event.roomId}:${event.senderSessionId}:${event.timestamp}`,
      text: event.content,
      isOwn: event.senderSessionId === sessionId,
      createdAt: event.timestamp,
    });
  });

  return () => subscription.unsubscribe();
}

export async function sendRoomMessage(sessionId: string, roomId: string, content: string) {
  const activeClient = await ensureClient();
  activeClient.publish({
    destination: "/app/chat.send",
    body: JSON.stringify({
      sessionId,
      roomId,
      content,
    }),
  });
}
