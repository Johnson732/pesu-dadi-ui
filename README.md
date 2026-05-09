# PesuDadi UI

This frontend is a standalone Vite + React app that talks to a separate backend.

## Backend Wiring

Set the backend origin with:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

Run locally with:

```bash
npm install
npm run dev
```

The UI currently expects these endpoints:

- `POST /api/chat/match`
- `GET /api/chat/sessions/:sessionId`
- `POST /api/chat/sessions/:sessionId/messages`
- `POST /api/chat/sessions/:sessionId/disconnect`
- `POST /api/chat/sessions/:sessionId/next`

The request and response mapping lives in [src/lib/chat-api.ts](/Users/sribharath/Desktop/pesudadi-ui/src/lib/chat-api.ts). If your backend uses different routes or payload names, update that file only.

## Notes

- The old fake matchmaking timeout has been removed.
- The chat page now hydrates itself from the active backend session.
- Replit-specific Vite plugins and environment requirements have been removed.
- Matchmaking stays on the searching screen until the backend reports a matched session.
