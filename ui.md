# PesuDaDi UI

## Purpose

This frontend is the React + Vite client for the PesuDaDi anonymous chat app.

It provides:

- the landing page for selecting preferences
- the searching flow for matchmaking
- the realtime chat screen
- disconnect and next-chat actions

The UI is designed to work with the Java Spring Boot backend in `/Users/sribharath/Desktop/pesu/PesuDaDi`.

---

## Screen Flow

### 1. Home

File: [src/pages/Home.tsx](/Users/sribharath/Desktop/pesu/pesudadi-ui/src/pages/Home.tsx)

What it does:

- lets the user choose gender
- lets the user choose age range
- stores those preferences in `localStorage`
- clears any old active chat session
- routes the user to `/searching`

### 2. Searching

File: [src/pages/Searching.tsx](/Users/sribharath/Desktop/pesu/pesudadi-ui/src/pages/Searching.tsx)

What it does:

- creates a backend session with `POST /api/session` if one does not exist
- subscribes to `/topic/session/{sessionId}` over WebSocket
- starts matchmaking with `POST /api/chat/start`
- waits for backend session events such as:
  - `SEARCHING`
  - `MATCH_FOUND`
  - `DISCONNECTED`
- moves the user to `/chat` when a match is found
- lets the user cancel search and disconnect cleanly

### 3. Chat

File: [src/pages/Chat.tsx](/Users/sribharath/Desktop/pesu/pesudadi-ui/src/pages/Chat.tsx)

What it does:

- listens for session-level events on `/topic/session/{sessionId}`
- listens for room messages on `/topic/room/{roomId}`
- sends chat messages to `/app/chat.send`
- shows incoming and outgoing messages in realtime
- supports:
  - `Next Chat`
  - `Disconnect`

Behavior:

- when `Next Chat` is clicked, the same backend session starts matchmaking again
- when the partner disconnects, the UI routes to `/disconnected`

### 4. Disconnected

File: [src/pages/Disconnected.tsx](/Users/sribharath/Desktop/pesu/pesudadi-ui/src/pages/Disconnected.tsx)

What it does:

- shows that the current chat session ended
- lets the user start searching again
- lets the user go back home

---

## Backend Communication

### REST

REST helpers live in:

File: [src/lib/chat-api.ts](/Users/sribharath/Desktop/pesu/pesudadi-ui/src/lib/chat-api.ts)

The UI uses:

- `POST /api/session`
- `POST /api/chat/start`
- `POST /api/chat/disconnect`

### Realtime WebSocket

Realtime helpers live in:

File: [src/lib/chat-realtime.ts](/Users/sribharath/Desktop/pesu/pesudadi-ui/src/lib/chat-realtime.ts)

The UI connects to:

- WebSocket endpoint: `/ws`
- session topic: `/topic/session/{sessionId}`
- room topic: `/topic/room/{roomId}`
- send destination: `/app/chat.send`

This matches the backend design in:

- [DESIGN.md](/Users/sribharath/Desktop/pesu/PesuDaDi/DESIGN.md)
- [PLAN.md](/Users/sribharath/Desktop/pesu/PesuDaDi/PLAN.md)

---

## Local Storage

Session and preference storage live in:

File: [src/lib/chat-session.ts](/Users/sribharath/Desktop/pesu/pesudadi-ui/src/lib/chat-session.ts)

The UI stores:

- user preferences
- current backend session id
- current room id
- current session status

This lets the UI recover basic state across refreshes.

---

## Running

Start the backend:

```bash
cd /Users/sribharath/Desktop/pesu/PesuDaDi
./mvnw spring-boot:run
```

Start the UI:

```bash
cd /Users/sribharath/Desktop/pesu/pesudadi-ui
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

---

## Realtime Testing

To test two users:

1. Open the UI in a normal browser window.
2. Open the UI again in an Incognito or Private window.
3. Start chat in both windows.
4. Confirm both users get matched.
5. Send messages both ways.
6. Test `Next Chat`.
7. Test `Disconnect`.

Using separate browser storage contexts is important because each user needs a separate session id.
