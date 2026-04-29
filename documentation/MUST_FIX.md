# FaceHunter — MUST FIX Before Production

## Priority Key

| Tag | Meaning |
|-----|---------|
| 🔴 CRITICAL | Will break in production or cause data loss |
| 🟡 HIGH | Security/privacy risk or major performance issue |
| 🟢 MEDIUM | Code quality, maintainability, minor perf |
| ⚪ LOW | Nice-to-have, polish |

---

## 🔴 CRITICAL

### 1. JWT_SECRET env var casing inconsistency

**Files:** `backend/src/app.module.ts:39`, `backend/src/common/guards/jwt-auth.guard.ts`, `backend/src/endpoints/auth/jwt-auth.guard.ts`

**Problem:** Three files read `process.env.Jwt_SECRET` (camelCase), but `auth.service.ts:47,57` and `message.gateway.ts:48` read `process.env.JWT_SECRET` (ALL-CAPS). On Linux (case-sensitive) these are **different variables**. Auth will fail in production.

**Fix:** Unify to `JWT_SECRET` everywhere. The NestJS ConfigModule lowercases by default, so be explicit.

**Files to change:**
- `app.module.ts:39` — `Jwt_SECRET` → `JWT_SECRET`
- `backend/src/common/guards/jwt-auth.guard.ts:12` — same
- `backend/src/endpoints/auth/jwt-auth.guard.ts:12` — same

### 2. Hardcoded Flask API URL

**File:** `backend/src/endpoints/player/player.controller.ts:88-89, 133-134`

**Problem:** The backend calls `http://127.0.0.1:5000/identify-face` and `http://127.0.0.1:5000/check-face` — hardcoded. In production these services run on separate containers with different URLs.

**Fix:**
```ts
const API_URL = process.env.FACEHUNTER_API_URL || 'http://127.0.0.1:5000';
const res = await axios.post(`${API_URL}/identify-face`, ...);
```

### 3. No backend Dockerfile (NOW FIXED)

**File:** `backend/Dockerfile` — was missing, now created in this session. Railway has no way to deploy without it.

**Verify:** Ensure `backend/Dockerfile` is pushed to GitHub and Railway sets **Root Directory** → `backend`.

### 4. No health check endpoint

Neither service has a `/health` or `/ready` endpoint. Railway uses this for monitoring and restart decisions.

**Fix — Backend:**
```ts
// backend/src/main.ts or a new health.controller.ts
@Get('/health')
health() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

**Fix — API:** Already has `GET /`, rename to `/health` or add a dedicated health endpoint that returns a JSON response (Railway prefers JSON health checks).

---

## 🟡 HIGH — Security

### 5. CORS wide open in production

**Files:**
- `backend/src/main.ts:6` — `app.enableCors()` (allows all origins)
- `backend/src/endpoints/game/game.gateway.ts:29` — `cors: { origin: '*' }`
- `backend/src/endpoints/message/message.gateway.ts:26` — `cors: { origin: '*' }`

**Fix:**
```ts
// main.ts — restrict to your frontend domain
app.enableCors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
});
```

### 6. No rate limiting

**Problem:** The `voteShot` and `shoot` WebSocket events have no rate limiting. A malicious client can spam votes/shots.

**Fix:** Add `@nestjs/throttler` to backend:
```bash
npm install @nestjs/throttler
```
Then apply `@Throttle()` decorator to sensitive endpoints.

### 7. Face encodings stored in MongoDB (biometric data)

**Problem:** Face encodings (biometric data) are stored unencrypted in MongoDB. Depending on jurisdiction (GDPR in EU, PDPL in Mexico, CCPA in California), this requires:

- **Explicit user consent** before storing
- **Encryption at rest** (MongoDB Atlas provides this)
- **Data deletion mechanism** when user requests it
- **Data breach notification** plan

**Fix:**
1. Enable encryption at rest in MongoDB Atlas (built-in, just toggle it on)
2. Encrypt the `embedding` field in the User/Player model before storing
3. Add a user-facing privacy policy explaining how face data is used
4. Add a `DELETE /user/:id/data` endpoint that purges all face data

**Encryption example (AES-GCM before DB write):**
```ts
// In the Player model, encrypt the picture/encoding field
import * as crypto from 'crypto';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  // ...
}
```

**Legal note:** Even with encryption, you still need user consent. This is not optional — collecting biometric data without consent can result in fines (GDPR: up to 4% of revenue).

### 8. No Helmet / security headers

**Fix:** Add `helmet` middleware to the backend:
```bash
npm install helmet
```
```ts
import helmet from 'helmet';
app.use(helmet());
```

### 9. Express server port conflict

**File:** `express/server.js:6`

**Problem:** The Express BLE server runs on port `3000` — same as the NestJS backend default. In development this creates a conflict. In production, if both are deployed, one will fail.

**Fix:** Change Express to port `3001` or make it configurable via `PORT`.

---

## 🟡 HIGH — Performance

### 10. N+1 queries in game gateway

**Files:** `backend/src/endpoints/game/game.gateway.ts` — `handleJoin`, `handleReady`, `handleShoot`, `handleVotingDone`

**Problem:** These handlers fetch `game.players` (array of IDs), then call `playerService.findById()` individually for each player. This is N queries instead of 1.

**Fix:** Add a batch method to `PlayerService`:
```ts
async findByIds(ids: string[]) {
  const objectIds = ids.filter(isValidObjectId).map(id => new Types.ObjectId(id));
  return this.playerModel.find({ _id: { $in: objectIds } }).exec();
}
```

### 11. No pagination on list endpoints

**Files:** All `getAll()` methods in services (game, player, shot, user, bullet, etc.)

**Problem:** `return this.gameModel.find().exec()` returns ALL documents. With thousands of users/shots, this will crash the server or cost excessive bandwidth.

**Fix:** Add pagination params to every list endpoint:
```ts
async getAll(page = 1, limit = 20) {
  return this.gameModel.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
}
```

---

## 🟢 MEDIUM — Code Quality

### 12. Duplicate JwtAuthGuard files

**Files:**
- `backend/src/common/guards/jwt-auth.guard.ts`
- `backend/src/endpoints/auth/jwt-auth.guard.ts`

Both are identical. Delete one and update all imports to point to the remaining one.

### 13. mongodb-memory-server in production dependencies

**File:** `backend/package.json`

**Problem:** `mongodb-memory-server` downloads ~200MB of MongoDB binaries on `npm install`. It's only used for tests.

**Fix:** Move to `devDependencies`:
```json
"devDependencies": {
  "mongodb-memory-server": "^10.1.4",
  ...
}
```

### 14. Legacy unused `lib/mongodb.ts`

**File:** `backend/src/lib/mongodb.ts`

**Problem:** Implements a manual MongoDB connection with caching logic. Only used by tests. The NestJS MongooseModule handles this properly. Confusing to have both.

**Fix:** Either delete it, or keep it only for the test helper.

### 15. Console.log instead of proper logger

**File:** `backend/src/main.ts:7-9`, various services

**Problem:** Uses `console.log()` for request logging. No log levels, no structured output, no production monitoring.

**Fix:** Use NestJS's built-in `Logger`:
```ts
import { Logger } from '@nestjs/common';
const logger = new Logger('HTTP');
app.use((req, res, next) => {
  logger.log(`${req.method} ${req.url}`);
  next();
});
```

Or integrate **Winston** / **Pino** for structured JSON logs (better for log aggregation).

### 16. `any` types in frontend store

**File:** `frontend/stores/usePlayerStore.ts`

```ts
interface PlayerStore {
    player: any;  // should be typed
    setPlayer: (player: any) => void;  // should be typed
}
```

**Fix:** Import from shared types and use proper typing:
```ts
import type { Player } from '@facehunter/types';
```

Or at minimum define the interface locally.

---

## ⚪ LOW — Polish

### 17. No .dockerignore files

Both `/api` and `/backend` should have `.dockerignore` to exclude `node_modules`, `.git`, `.venv`, etc. from the Docker build context.

### 18. No structured error responses

Errors return raw NestJS exception objects. Consider implementing a consistent error response format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": { "field": "email" }
  }
}
```

### 19. Frontend ngrok URL

**File:** `frontend/constants/API.ts`

```ts
export const API = "https://ae77c72ebff1.ngrok-free.app"
```

This is a development tunnel. Move to an env var (`EXPO_PUBLIC_API_URL`).

### 20. No test for face recognition service

**File:** `backend/src/endpoints/player/player.service.spec.ts`

The player service tests likely don't mock the Flask API calls. Add integration test coverage.

---

## Summary

| Priority | Count | Action Needed |
|----------|-------|--------------|
| 🔴 CRITICAL | 4 | Fix NOW before any deployment attempt |
| 🟡 HIGH | 7 | Fix before announcing the app publicly |
| 🟢 MEDIUM | 5 | Fix within first month of production |
| ⚪ LOW | 4 | Fix when you have time |

**Immediate launch blockers:** Items 1, 2, 3, 4 (CRITICAL) — without these the app will not function in production.
