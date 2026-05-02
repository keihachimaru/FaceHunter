# Backend Analysis — FaceHunter

> Generated: 2026-05-02
> Tech Stack: NestJS 11 / TypeScript 5.7 / MongoDB 8 (Mongoose) / Socket.IO 4.8

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Tech Stack](#2-tech-stack)
3. [Directory Structure](#3-directory-structure)
4. [API Endpoints](#4-api-endpoints)
5. [Database Models](#5-database-models)
6. [WebSocket Events](#6-websocket-events)
7. [Must Fixes — To Launch](#7-must-fixes--to-launch)
8. [Must Fixes — Production](#8-must-fixes--production)
9. [Recommendations](#9-recommendations)

---

## 1. Overview & Architecture

NestJS backend with MongoDB (Mongoose ODM). Auth uses JWT (manual `jsonwebtoken` + `passport-jwt`). Real-time game and chat via Socket.IO gateways. File uploads to Cloudinary via Multer. Face recognition delegated to an external Flask microservice.

### Key Architectural Decisions

| Decision | Choice | Notes |
|---|---|---|
| Auth strategy | **JWT** (manual verify in guards, Passport in strategy) | Two parallel approaches |
| Real-time | **Socket.IO** (2 namespaces: `wsgame`, `wschat`) | Game + chat separated |
| Validation | **class-validator** DTOs | **No global ValidationPipe** — validation is dead code |
| File upload | **Multer → Cloudinary** | Disk storage path unused (always falls to buffer stream) |
| Face API | External **Flask microservice** | Called via Axios from PlayerController |
| Database indexes | **Mongoose schemas** | Default `_id` index only |

---

## 2. Tech Stack

### Production Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@nestjs/core` | 11.0.1 | NestJS core |
| `@nestjs/common` | 11.0.1 | Common decorators, guards, pipes |
| `@nestjs/mongoose` | 11.0.3 | MongoDB ODM integration |
| `@nestjs/jwt` | 11.0.0 | JWT module (used mostly by strategy) |
| `@nestjs/passport` | 11.0.5 | Passport integration |
| `@nestjs/platform-socket.io` | 11.1.3 | WebSocket gateway |
| `@nestjs/websockets` | 11.1.7 | WebSocket decorators |
| `mongoose` | 8.19.2 | MongoDB driver + ODM |
| `jsonwebtoken` | 9.0.2 | Manual JWT sign/verify |
| `bcryptjs` | 3.0.2 | Password hashing |
| `class-validator` | 0.14.2 | DTO validation decorators |
| `cloudinary` | 1.41.3 | Cloudinary SDK |
| `multer` | 2.0.2 | File upload handling |
| `multer-storage-cloudinary` | 4.0.0 | Cloudinary storage engine |
| `axios` | 1.10.0 | HTTP client (Flask API calls) |
| `socket.io` | 4.8.1 | Server-side Socket.IO |
| `passport` | 0.7.0 | Auth middleware |
| `passport-jwt` | 4.0.1 | JWT strategy for Passport |
| `rxjs` | 7.8.1 | Reactive extensions |

### Dev Dependencies (selected)

| Package | Version | Purpose |
|---|---|---|
| `typescript` | 5.7.3 | Type checking |
| `jest` | 29.7.0 | Testing |
| `mongodb-memory-server` | 10.1.4 | In-memory MongoDB for tests |
| `eslint` | 9.18.0 | Linting |
| `prettier` | 3.4.2 | Formatting |

---

## 3. Directory Structure

```
backend/
├── src/
│   ├── main.ts                    # Entry point, CORS, global middleware
│   ├── app.module.ts              # Root module, imports all feature modules
│   ├── app.service.ts             # EMPTY
│   ├── health.controller.ts       # GET /health
│   ├── common/
│   │   └── guards/
│   │       └── jwt-auth.guard.ts  # Generic JWT guard (duplicate)
│   ├── endpoints/
│   │   ├── auth/                  # Register, login, session, JWT strategy
│   │   ├── user/                  # Profile, friends, CRUD
│   │   ├── player/                # Game player data, picture upload, face ID
│   │   ├── game/                  # Create/join game, game gateway (WebSocket)
│   │   ├── facehunt/              # Facehunt posts CRUD
│   │   ├── comment/               # Comments CRUD
│   │   ├── like/                  # Like/unlike
│   │   ├── message/               # Chat gateway + service
│   │   ├── shot/                  # Shot records
│   │   ├── gamemode/              # Gamemode CRUD
│   │   ├── bullet/                # Bullet types CRUD
│   │   ├── weapon/                # Weapon types CRUD
│   │   ├── role/                  # Role types CRUD
│   │   └── cloudinary/            # File upload service
│   ├── models/                    # Mongoose schemas (12 models)
│   ├── lib/
│   │   └── mongodb.ts             # Test helper — not used in prod
│   └── utils/
│       └── utils.ts               # getChatRoomName helper
├── test/                          # E2E test setup
├── .env                           # ⚠️ Contains real credentials (leaked!)
├── Dockerfile
├── nest-cli.json
├── tsconfig.json
└── package.json
```

---

## 4. API Endpoints

### Public (no auth)

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/auth/session` | Get user data from token |
| GET | `/facehunts/details/:id` | Get facehunt by ID |
| GET | `/gamemode/get/:name` | Get gamemode by name |
| GET | `/gamemode/all` | List all gamemodes |
| GET | `/bullets/:id` | Get bullet by ID |
| GET | `/bullets/all` | List all bullets |
| GET | `/weapons/:id` | Get weapon by ID |
| GET | `/weapons/all` | List all weapons |
| GET | `/roles/:id` | Get role by ID |
| GET | `/roles/all` | List all roles |
| GET | `/users/chat/:id` | Get user public data |

### Authenticated (JWT)

| Method | Route | Guard | Description |
|---|---|---|---|
| GET | `/facehunts/all` | JwtAuthGuard | Paginated facehunts |
| POST | `/game/create` | JwtAuthGuard | Create game |
| GET | `/users/me` | JwtAuthGuard | Get own profile |
| DELETE | `/users` | JwtAuthGuard | Delete account |
| GET | `/users/friends` | JwtAuthGuard | Get friends list |
| PATCH | `/users/add-friend` | JwtAuthGuard | Add friend |
| PATCH | `/users/remove-friend` | JwtAuthGuard (x2) | Remove friend |
| GET | `/comments/:id` | JwtAuthGuard | Get comment |
| DELETE | `/comments/delete` | JwtAuthGuard | Delete comment |
| PATCH | `/comments/update` | JwtAuthGuard | Update comment |
| POST | `/comments/new` | JwtAuthGuard | Create comment |
| PATCH | `/likes/like` | JwtAuthGuard | Toggle like |
| GET | `/likes/liked` | JwtAuthGuard | Check if liked |
| GET | `/shots/:gameId` | JwtHttpGuard | Get game shots |

### Player Authenticated (JwtPlayerAuthGuard)

| Method | Route | Description |
|---|---|---|
| GET | `/player/me` | Get own player data |
| POST | `/player/identify` | Identify face via Flask API |
| POST | `/player/upload-picture/:id` | Upload player picture |
| PATCH | `/player/buyBullet` | Buy/sell bullets |
| **N/A** | `/player/changeWeapon` | **UNREACHABLE — no HTTP decorator** |

---

## 5. Database Models

| Model | Key Fields | Notes |
|---|---|---|
| **User** | `username` (unique), `email` (unique), `password`, `friends[]`, `credits` | Core user profile |
| **Game** | `identifier` (UUID, unique), `gameType` (ObjectId → Gamemode), `players[]`, `ended` | Game session |
| **Player** | `user` (ObjectId → User), `game` (ObjectId → Game), `weapon`, `bullets[]`, `role`, `remainingHP`, `credits`, `ready`, `picture` | Player in a specific game |
| **Facehunt** | `author`, `game`, `image` | ⚠️ `game` + `image` typed as ObjectId but receive strings |
| **Shot** | `valid`, `author`, `game`, `target`, `votes`, `image` | Shot record per round |
| **Comment** | `content`, `author`, `facehunt` | Post comment |
| **Like** | `author`, `value`, `facehunt` | Post like |
| **Message** | `content`, `sender`, `receipt`, `status` | Chat message |
| **Gamemode** | `name` (unique), `numRounds`, `roundLength`, `teams`, `teamLimit` | Game type config |
| **Bullet** | `name` (unique), `price`, `dmgMul` | Ammo type |
| **Weapon** | `name` (unique), `capacity`, `reloadTime`, `zoom` | Weapon type |
| **Role** | `name` (unique), `baseHP` (unique) | ⚠️ `baseHP: unique` is likely a bug |

---

## 6. WebSocket Events

### Game Gateway (`/wsgame`)

| Event | Direction | Guard | Description |
|---|---|---|---|
| `join` | Client → Server | JwtGuestGuard | Join game room |
| `ready` | Client → Server | JwtWsGuard | Mark ready |
| `shoot` | Client → Server | JwtGuestGuard | Fire shot |
| `voteShot` | Client → Server | JwtWsGuard | Vote for shot |
| `votingDone` | Client → Server | JwtWsGuard | Voting complete |
| `gameEnded` | Client → Server | JwtWsGuard | End game |
| `requestGameState` | Client → Server | JwtWsGuard | Request state |
| `round-ended` | Server → Client | — | Round over |
| `highlight-candidates` | Server → Client | — | Vote candidates |
| `voted` | Server → Client | — | Vote confirmation |

### Chat Gateway (`/wschat`)

| Event | Direction | Guard | Description |
|---|---|---|---|
| `joinChat` | Client → Server | None (JWT in middleware) | Join chat room |
| `dm` | Client → Server | None | Send DM |
| `messageReceived` | Client → Server | None | Mark received |
| `messageRead` | Client → Server | None | Mark read |
| `newMessage` | Server → Client | — | Incoming message |
| `status` | Server → Client | — | Delivery status |

---

## 7. Must Fixes — To Launch

### 7.1 Critical — Will Crash at Runtime

| # | File | Issue | Impact |
|---|---|---|---|
| **C1** | `game.controller.ts:47` | **Missing `await`** on `gamemodeService.findByName()`. The `gamemode` variable is a Promise, always truthy, so the null check never works and the gamemode object is never resolved. | Game creation always succeeds regardless of gamemode validity, but `gamemode` is never actually used. The game `identifier` is still returned. |
| **C2** | `player.controller.ts:197-210` | **`changeWeapon()` has NO HTTP decorator** (`@Post`, `@Patch`, `@Get`, etc.). It also lacks `await` on service calls. | **Endpoint is completely unreachable.** Any call to `/player/changeWeapon` returns 404. Even if reachable, service calls return Promises (always truthy). |
| **C3** | `message.gateway.ts:80-81` | **Missing `await`** on `this.userService.findById()` in `handleJoin`. `currentUser` and `otherUser` are Promises, so `if(!currentUser || !otherUser)` is always false. | User existence is never validated. All subsequent string interpolation of these Promises produces `[object Promise]`. Chat breaks silently. |
| **C4** | `game.gateway.ts:285-289` | **Facehunt creation in `votingDone` — CastError.** `Facehunt` model defines `game` and `image` as `Types.ObjectId`, but the code passes a UUID string (`gameId`) and a Cloudinary URL (`topShot.image`). | `create()` throws `CastError: Cast to ObjectId failed`. Facehunt posts are never created after a game ends. |
| **C5** | `like.controller.ts:55-56` | **Dead code — like creation path unreachable.** `getLikeByAuthorAndFacehunt()` throws `NotFoundException` when no like exists, so `if(!like)` can never be true. | Users can never create a new like, only toggle existing ones. First-time likes fail silently. |
| **C6** | `cloudinary.module.ts` + `.env` | **Cloudinary env var casing mismatch.** Code reads `CLOUDINARY_CLOUD_NAME` (uppercase), `.env` defines `cloudinary_cloud_name` (lowercase). | All three Cloudinary config values resolve to `undefined`. Uploads fail with auth errors. |

### 7.2 High — Likely Runtime Errors

| # | File | Issue |
|---|---|---|
| **H1** | `main.ts` | **No global `ValidationPipe`.** All `class-validator` decorators on DTOs are dead code. Invalid data passes through unchecked. |
| **H2** | `game.controller.ts:47` | **DTO sends gamemode name (string) but model expects ObjectId.** Even after fixing `await`, creating a Game with a string `gameType` causes a CastError. |
| **H3** | `game.gateway.ts:92-97` | **`round-ended` can fire prematurely.** `deadCount` increments per-shot with no check if target already dead. Multiple shots on the same body advance the round. |
| **H4** | `game.gateway.ts:73,82` | **`handleShoot` doesn't validate shot belongs to current game.** The shot could reference a different game entirely. |
| **H5** | `message.gateway.ts:121,150,172` | **Message status events emit to the WRONG room.** `client.to(`notifications:${senderID}`)` notifies the sender about their own message status. Should be `notifications:${receiptID}`. |
| **H6** | `player.controller.ts:75-77` | **`identify` sends ALL players' faces including the shooter's.** Flask API might match the shooter against themselves. |

### 7.3 Security — Immediate

| # | Issue |
|---|---|
| **S1** | **`.env` committed to git** with live MongoDB Atlas credentials (`Kei:Qgz2trQcq7upNmlm@...`), Cloudinary API secret (`bWV8hO23_lsQXBG445BUMXA6pmI`), and JWT secret. Rotate ALL credentials immediately. |
| **S2** | **No global ValidationPipe** — all input validation silently skipped. |
| **S3** | **CORS wide open** — `app.enableCors()` with no options + `cors: { origin: '*' }` on both WebSocket namespaces. |
| **S4** | **No rate limiting** — login/register endpoints are unprotected against brute force. |
| **S5** | **No Helmet/security headers** — no `helmet` middleware. |
| **S6** | **No upload size limit** — Multer has no file size limits. |
| **S7** | **All JWT tokens use same secret** — user auth, player tokens, guest tokens all share `JWT_SECRET`. |

---

## 8. Must Fixes — Production

| # | Category | Issue |
|---|---|---|
| P1 | Reliability | **JWT expiration inconsistency:** `auth.service.ts` signs tokens with `expiresIn: '7d'`, but `app.module.ts` registers `JwtModule` with `expiresIn: '1d'`. |
| P2 | Reliability | **`votingCompletedPlayers` Map never cleaned up** for disconnected players. Memory leak. |
| P3 | Reliability | **No real-time vote updates** — voting update emit is commented out. Players don't see live vote counts. |
| P4 | Reliability | **Unused imports** in many controllers (`Connection`, `Types`, service injections). Code bloat. |
| P5 | Maintainability | **Two identical guard files** — `common/guards/jwt-auth.guard.ts` and `endpoints/auth/jwt-auth.guard.ts`. One should be deleted. |
| P6 | Maintainability | **Duplicate `@UseGuards(JwtAuthGuard)`** on `user.controller.ts:removeFriend`. |
| P7 | Maintainability | **`role.model.ts:baseHP` has `unique: true`** — two roles can't share the same HP value. Likely a bug. |
| P8 | Maintainability | **`utils.ts` only has one function** used in one place. Could be inlined. |
| P9 | Maintainability | **`app.service.ts` is empty.** Can be removed. |
| P10 | Maintainability | **`ShotDTO` defined in `player.dto.ts`** but never used anywhere. |

---

## 9. Recommendations

### 9.1 Immediate (Pre-Launch)

- [ ] **Rotate ALL credentials** exposed in `.env` — MongoDB Atlas password, Cloudinary API secret, JWT secret
- [ ] **Add `await`** to `gamemodeService.findByName()` in `game.controller.ts:47`
- [x] **Fix ObjectId serialization** in `auth.service.ts:47` — add `String()` around `user._id` (DONE — frontend analysis fix)
- [ ] **Fix Facehunt model** — change `image` and `game` field types from `Types.ObjectId` to `String` (or use a mixed type)
- [ ] **Add HTTP decorator** to `changeWeapon()` in `player.controller.ts` (e.g. `@Patch('changeWeapon')`)
- [ ] **Add missing `await`** to `userService.findById()` calls in `message.gateway.ts:80-81`
- [ ] **Fix like creation** — change `getLikeByAuthorAndFacehunt()` to return `null` instead of throwing when not found
- [ ] **Register global `ValidationPipe`** in `main.ts`: `app.useGlobalPipes(new ValidationPipe())`
- [ ] **Fix Cloudinary env vars** — rename to uppercase in `.env` or fix module to use lowercase
- [ ] **Add `.env` to `.gitignore`** and remove from tracking: `git rm --cached .env`

### 9.2 Short-Term

- [ ] **Fix message notification rooms** — emit to `notifications:${receiptID}` instead of `notifications:${senderID}`
- [ ] **Add shot-game validation** in `handleShoot` — verify shot belongs to current game
- [ ] **Fix `deadCount` deduplication** — check if target already dead before incrementing
- [ ] **Add Helmet** for security headers
- [ ] **Add rate limiting** with `@nestjs/throttler` on auth endpoints
- [ ] **Configure CORS properly** — restrict origins in production
- [ ] **Unify JWT expiration** — use consistent `expiresIn` value
- [ ] **Remove duplicate guard file** — keep only one `JwtAuthGuard`
- [ ] **Clean up unused imports** across all controllers
- [ ] **Clean up `votingCompletedPlayers` Map** — remove entries on disconnect

### 9.3 Long-Term

- [ ] **Replace manual `jsonwebtoken` with `@nestjs/jwt`'s `JwtService`** in guards for consistency
- [ ] **Separate token secrets** — use different JWT secrets for user auth vs player/guest tokens
- [ ] **Add request logging** via NestJS Logger instead of raw `console.log`
- [ ] **Add health check with dependencies** — verify MongoDB + Cloudinary + Flask API connectivity
- [ ] **Add proper error filters** — global exception filter with consistent error response format
- [ ] **Add request ID tracking** — correlate logs across requests
- [ ] **Set up CI/CD pipeline** — lint + test + build on every PR
- [ ] **Add file size limits** to Multer upload interceptor
- [ ] **Write integration tests** for critical flows (auth, game lifecycle, chat)

### 9.4 Code Health Metrics

| Metric | Current State | Target |
|---|---|---|
| Missing `await` keywords | 4 locations | 0 |
| DTO validation active | ❌ No global ValidationPipe | ✅ Enabled |
| Unused imports | ~15 files | 0 |
| `.env` in git | ✅ Committed | ❌ Removed |
| Test coverage | ~0% (specs exist, mostly boilerplate) | ≥60% |
| Identical duplicate files | 2 JwtAuthGuard files, 1 duplicate decorator | 0 |
| Security headers | None | Helmet middleware |
| Rate limiting | None | @nestjs/throttler |
