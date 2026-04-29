# FaceHunter — Codebase Analysis

## Overview

FaceHunter is a real-time multiplayer mobile game combining facial recognition, BLE-based relative positioning, and social features. The architecture is split across 4 main codebases and a shared types package.

---

## 1. `/api` — Python Flask Image Recognition Server

### Structure
- Single file `app.py` with 2 endpoints: `/check-face` and `/identify-face`
- Uses `face_recognition` (dlib wrapper), `Pillow`, `numpy`, `requests`
- Connects to MongoDB but never reads/writes (dead connection)

### Assessment
| Aspect | Rating | Notes |
|--------|--------|-------|
| Architecture | Poor | Single monolithic file, no separation of concerns |
| Error Handling | Fair | Basic try/catch, but no graceful degradation |
| Performance | Poor | Synchronous requests to fetch player faces at runtime — blocks per request |
| Security | Concern | `app.run(debug=True)` in production path; no auth on endpoints |
| Testing | None | No tests found |
| Config | None | `config.py` and `requirements.txt` are empty files |

### Issues
1. **`/identify-face` downloads every player's reference image synchronously** via `requests.get()` inside the request handler — this blocks the entire endpoint for N sequential HTTP calls. If a game has 8 players, that's 8 sequential downloads before any encoding comparison begins.
2. **MongoClient connection is unused** — initialized but no DB operations performed.
3. **No authentication/authorization** — any client can hit these endpoints.
4. **`debug=True`** is enabled, which exposes the Werkzeug debugger in production.
5. **No Dockerfile or requirements.txt** — no reproducible environment.
6. **Hardcoded `model="hog"`** — no GPU/CNN acceleration option, making it slow on CPU.

### Suggestions
- Move all `requests.get()` calls for reference images out of the request path: pre-fetch and cache encodings in Redis or in-memory.
- Use `model="cnn"` with GPU support for production.
- Add authentication (shared secret from NestJS backend).
- Containerize with Docker and a proper `requirements.txt`.
- Add async processing with a task queue (Celery/Redis) for face identification.
- Remove unused MongoDB connection.

---

## 2. `/backend` — NestJS 11 TypeScript Backend

### Structure
- 13 feature modules (auth, bullet, comment, facehunt, game, gamemode, like, message, player, role, shot, user, weapon)
- 12 Mongoose models
- Socket.IO gateway for real-time game state
- Cloudinary module for image uploads
- Unit tests and e2e tests configured with Jest

### Assessment
| Aspect | Rating | Notes |
|--------|--------|-------|
| Architecture | Good | Well-modularized NestJS structure with clear separation |
| Error Handling | Good | Consistent exception filters, validation pipes |
| Performance | Fair | N+1 queries in several places; no pagination |
| Security | Good | JWT auth, Passport strategy, class-validator DTOs |
| Testing | Fair | Spec files exist but coverage is unclear |
| Config | Good | dotenv, ConfigModule, proper .gitignore for secrets |

### Issues
1. **N+1 queries in game gateway**: `handleJoin`, `handleReady`, `handleShoot` all fetch `game.players` then iterate calling `playerService.findById` individually for each player. This is N queries instead of a single `$in` lookup.
2. **`Jwt_SECRET` vs `JWT_SECRET` inconsistency**: `app.module.ts` uses `process.env.Jwt_SECRET` (camelCase) while `auth.service.ts` and `jwt.strategy.ts` use `process.env.JWT_SECRET` (uppercase). This will cause silent auth failures in production.
3. **No pagination on any list endpoints**: `getAll()` on services returns all documents — will crash with thousands of users/games/shots.
4. **`cors: { origin: '*' }`** in WebSocket gateway — no restrictions for production.
5. **`game.gateway.ts`** mixes too many concerns: game logic, player management, voting, and shot handling all in one gateway file (~309 lines). Could be split.
6. **`endGame` and `setAlive` for all players** called on every round end — this resets ALL players even those who weren't in the game.
7. **No rate limiting** — the `voteShot` endpoint can be spammed.
8. **`gameType` field in Game references GameMode but no population or validation** that the GameMode actually exists.

### Strengths
- Consistent CRUD patterns across all modules.
- `class-validator` DTOs with proper decorators.
- `isValidObjectId` checks before DB operations.
- Guest user support with separate JWT tokens.
- Cloudinary integration for image hosting.

### Suggestions
- Fix `Jwt_SECRET` → `JWT_SECRET` in `app.module.ts`.
- Use `$in` queries instead of per-player `findById` loops.
- Add pagination (`limit`/`skip`) to all list endpoints.
- Add rate limiting (e.g., `@nestjs/throttler`).
- Split `game.gateway.ts` into separate handlers/services.
- Add Redis for session caching and WebSocket adapter (scalability).
- Use `@nestjs/serve-static` or nginx to serve static assets if needed.
- Add request validation pipe globally.

---

## 3. `/frontend` — React Native (Expo SDK 54)

### Structure
- Expo Router (file-based routing): 10 screens
- 15+ reusable components
- Zustand store for player state
- Service layer with axios and Socket.IO client
- Custom hooks for game logic, chat, socket lifecycle
- Full Android and iOS native projects

### Assessment
| Aspect | Rating | Notes |
|--------|--------|-------|
| Architecture | Good | Clean separation: pages → components → services → hooks → stores |
| State Management | Fair | Only one Zustand store for player; auth token in AsyncStorage |
| Performance | Good | RN Reanimated, gesture handler included |
| Security | Concern | `API` constant hardcodes an ngrok URL |
| Testing | None | Zero test files detected |
| Types | Fair | `any` types in store, some missing interfaces |

### Issues
1. **Hardcoded ngrok URL** in `frontend/constants/API.ts`: `https://ae77c72ebff1.ngrok-free.app`. This is a development tunnel — it changes on every ngrok restart. Should use env vars.
2. **`usePlayerStore` uses `any` types** for the entire player object — defeats TypeScript's purpose.
3. **`gestureEnabled: false` and `headerBackVisible: false`** in root layout — disables all native navigation gestures and back buttons.
4. **No error boundaries** — unhandled promise rejections could crash the app.
5. **`gameSocket.ts` uses module-level mutable `let socket`** — singleton pattern but no cleanup on unmount. The `initSocket` function doesn't check for existing connections before creating a new one.
6. **Expo new architecture enabled** (`newArchEnabled: true`) — Fabric architecture is still experimental in SDK 54 and may cause instability.
7. **No offline-first strategy** — all data fetches assume connectivity.
8. **Icons are PNGs** (not vector/SVG) — larger bundle size.

### Strengths
- Expo Router for clean file-based routing.
- Proper hook cleanup (`useEffect` return functions disconnect sockets).
- Service layer abstraction keeps API calls out of components.
- Zustand is lightweight and well-suited for this scale.

### Suggestions
- Move the API URL to an `.env` file with `EXPO_PUBLIC_API_URL`.
- Type the player store with proper interfaces from `/types`.
- Add react-native-error-boundary or Sentry for crash reporting.
- Fix the socket singleton to prevent duplicate connections.
- Add unit tests with Jest + React Native Testing Library.
- Replace PNG icons with SVG (react-native-svg already in deps).
- Add a splash screen loading flow that matches game expectations.

---

## 4. `/types` — Shared TypeScript Definitions

### Structure
- 10 type definition files (Bullet, Class, Comment, FaceHunt, Game, Like, Message, Shot, User, Weapon)

### Assessment
| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Fair | Covers main entities but shallow — no generics, utility types |
| Consistency | Fair | Some types use optional fields where they should be required |
| Usage | Poor | Frontend defines its own interfaces in `/interfaces/` instead of importing from `/types` |
| Export Pattern | Good | Named exports with `export interface` |

### Issues
1. **Duplicated types**: `/types/` defines shared types, but `/frontend/interfaces/` defines its own separate set (chat.ts, create.ts, game.ts, etc.). These will inevitably drift out of sync.
2. **No discriminated unions** for game states (lobby, playing, voting, leaderboard).
3. **`GameType.ts` uses `any[]`** for players instead of a typed reference.

### Suggestions
- Make `/types` an actual npm workspace package (`@facehunter/types`) and import it in both frontend and backend.
- Remove the `/frontend/interfaces/` directory entirely in favor of the shared package.
- Add discriminated union types for game phases, socket events, and API responses.

---

## 5. `/express` — WebSocket Localization Server

### Structure
- Single `server.js` file (~65 lines)
- Express + raw `ws` WebSocket server
- Computes relative angles between BLE-connected clients using `atan2`

### Assessment
| Aspect | Rating | Notes |
|--------|--------|-------|
| Architecture | Simple | Single file, single concern — appropriate for a localization relay |
| Performance | Good | In-memory Map, O(n) broadcast per message |
| Error Handling | Poor | Silent `catch(e) { return }` on JSON parse — no logging |
| Security | Poor | No auth, no rate limiting, no origin check |
| Maintainability | Fair | Works but CommonJS (`require`) in an otherwise ESM/TypeScript project |

### Issues
1. **Port conflict**: Runs on port 3000 — same default as the NestJS backend.
2. **No authentication** — any client with the server address can connect.
3. **Silent error handling** — JSON parse errors are swallowed silently.
4. **CommonJS** in a TypeScript-heavy project — inconsistent.

### Suggestions
- Change port (e.g., 3001) to avoid conflict with NestJS.
- Add a simple shared-secret handshake for WebSocket connections.
- Log parse errors at least at `console.warn` level.
- Consider migrating to TypeScript, or keep as-is since it's so small.

---

## Overall Assessment for v1.0

### Is this ready for v1.0?

**Yes, with caveats.** The codebase has a solid architectural foundation and implements the core game loop (create game → join → shoot → vote → leaderboard → facehunt). The feature set is ambitious and well-planned.

### Critical blockers for v1.0
1. **`Jwt_SECRET` typo** in `app.module.ts` will break auth in production.
2. **Hardcoded ngrok URL** in frontend — will not work outside of dev.
3. **No Docker/deployment configuration** — no Dockerfiles, no docker-compose, no CI/CD.
4. **Python API has no requirements.txt or Docker** — environment not reproducible.
5. **No rate limiting** — vote and shoot endpoints are unprotected.

### Recommended fixes before v1.0 launch
| Priority | Item | Component |
|----------|------|-----------|
| P0 | Fix `Jwt_SECRET` → `JWT_SECRET` | Backend |
| P0 | Move API URL to env var | Frontend |
| P0 | Add Dockerfiles + docker-compose | All |
| P1 | Fix N+1 queries in game gateway | Backend |
| P1 | Remove `debug=True` from Flask | API |
| P1 | Add requirements.txt to API | API |
| P2 | Type the Zustand store properly | Frontend |
| P2 | Add pagination to list endpoints | Backend |
| P2 | Add error boundaries to frontend | Frontend |
| P2 | Fix port conflict on 3000 | Express vs Backend |

### Deployment Strategy

```
Recommended architecture for production:

                       ┌─────────────┐
                       │   Cloudflare │
                       │   (DNS/CDN)  │
                       └──────┬──────┘
                              │
                       ┌──────┴──────┐
                       │   Nginx     │
                       │ (reverse proxy)│
                       └──┬──┬──┬────┘
                          │  │  │
              ┌───────────┘  │  └───────────┐
              │              │              │
       ┌──────┴──────┐ ┌────┴─────┐ ┌──────┴──────┐
       │ NestJS      │ │ Express  │ │ Flask       │
       │ (backend)   │ │ (BLE ws) │ │ (face API)  │
       │ :3000       │ │ :3001    │ │ :5000       │
       └──────┬──────┘ └──────────┘ └──────┬──────┘
              │                            │
       ┌──────┴──────┐            ┌────────┴────────┐
       │ MongoDB     │            │ Cloudinary CDN  │
       │ (Atlas)     │            │ (image hosting) │
       └─────────────┘            └─────────────────┘
              │
       ┌──────┴──────┐
       │ Redis       │
       │ (cache/ws)  │
       └─────────────┘
```

**Hosting options (cheapest → most scalable):**

| Option | Cost | Complexity | Best for |
|--------|------|------------|----------|
| Single VPS (DigitalOcean/$12mo) | Low | Low | MVP / beta |
| Railway / Render | Med | Low | Quick deploy |
| AWS ECS / Fargate | High | Med | Scale |
| Kubernetes (EKS/GKE) | High | High | Enterprise |

**Recommended for v1.0:**
- **Backend**: Dockerized NestJS + Express on a single $12/mo DigitalOcean droplet or Railway.
- **Database**: MongoDB Atlas free tier (512MB).
- **Face API**: Dockerized Flask on the same droplet or a separate $6/mo droplet.
- **Mobile**: Expo builds → App Store + Google Play via EAS Build.
- **Image CDN**: Cloudinary free tier (already integrated).
- **CI/CD**: GitHub Actions → build Docker image → deploy to Railway.

### Good Practices Observed (what to keep)

- Feature-based module organization in NestJS.
- DTO validation with `class-validator`.
- JWT auth with proper strategy pattern.
- Hook cleanup in React useEffect (socket disconnect).
- Zustand over Redux for simplicity.
- File-based routing with Expo Router.
- Cloudinary for image hosting (CDN offload).
- Separate WebSocket server for BLE localization (decoupling).

### Final Verdict

```
Architecture:       7/10  (good foundation, needs deployment infra)
Code Quality:       6/10  (NestJS is solid; Python and Express need cleanup)
Performance:        5/10  (N+1 queries, sync face downloads, no caching)
Security:           5/10  (JWT auth is good; missing rate limiting, CORS hardening)
Testing:            3/10  (backbone of tests exist but incomplete; no frontend tests)
Deployment:         2/10  (no Docker, no CI/CD, no env management)
v1.0 Readiness:     6/10  (core gameplay works; polish and infra needed)
```

The project is **viable for v1.0** after addressing the P0 + P1 items above. The core game loop is functional, the architecture is sound, and the tech stack is modern. With proper Dockerization and a deployment pipeline, this can ship.
