# FaceHunter — Frontend Analysis

## Overview

React Native 0.81 + Expo SDK 54 mobile app using Expo Router (file-based routing), Zustand for state, and Socket.IO for real-time. Targets iOS and Android.

**26 source files across 4 layers:** 10 screens, 15+ components, 12 services, 7 hooks, 4 interface files.

---

## Architecture

```
app/ (routes)
  ├── _layout.tsx          Root stack navigator
  ├── index.tsx            Home (auth + feed)
  ├── create/index.tsx     Create game
  ├── join/index.tsx       Join game (QR + camera)
  ├── game/[gameId].tsx    Active game (camera + voting)
  ├── facehunt/[facehuntId].tsx  Post detail + comments
  ├── chat/[chatId].tsx    Direct messages
  ├── friends/index.tsx    Friends list
  ├── account/index.tsx    Account settings
  ├── settings/index.tsx   App settings
  └── +not-found.tsx       404

hooks/          Custom hooks (useChat, useGame, useGameLobby, useSocketSetup)
services/       API calls + WebSocket clients (auth, game, chat, facehunt, etc.)
stores/         Zustand store (usePlayerStore)
interfaces/     TypeScript types (shared with /types but duplicated)
constants/      Colors + API URL
components/
  ├── layout/   Screen-level components (Feed, Authentication, RoundUI, etc.)
  └── ui/       Reusable primitives (Button, DeepButton, FriendCard, etc.)
```

### Communication Flow

```
Frontend ──REST──→ NestJS Backend (auth, CRUD, game creation)
Frontend ──WS────→ NestJS Socket.IO (game state, chat)
Frontend ──WS────→ Express (BLE localization — optional)
Frontend ──camera─→ Local → REST → Backend → Flask API (face recognition)
```

---

## Assessment by Layer

### 1. Routing (`app/`)

| Aspect | Rating | Notes |
|--------|--------|-------|
| Structure | Good | Expo Router file-based routing, standard layout |
| Navigation | Fair | `gestureEnabled: false` in root layout disables all swipe-back gestures |
| Auth guards | Poor | No route-level auth protection — pages check session manually in `useEffect` |

**Issues:**
- `_layout.tsx:8-9` — `gestureEnabled: false` and `headerBackVisible: false` on ALL routes means users can't swipe back or use the back button anywhere
- No route middleware / guards — unauthenticated users can navigate to any route (they'll see loading then get redirected, but there's a flash)
- `/game/[gameId].tsx` is a massive 340-line single screen — should be split

---

### 2. State Management (`stores/` + `hooks/`)

| Store | File | Lines | Quality |
|-------|------|-------|---------|
| `usePlayerStore` | `stores/usePlayerStore.ts` | 13 | Typed with `any` — defeats TS |

**Hooks:**
- `useChat` — Socket.IO lifecycle for chat, reconnection handling. Good cleanup.
- `useGame` — Full game lifecycle (shoot, vote, state). Mixed concerns (HTTP + WS in one hook).
- `useGameLobby` — Join + ready lifecycle. Solid.
- `useSocketSetup` — Global WS listener. Never actually used in any screen (dead code).

**Issues:**
- `usePlayerStore.ts:4` — `player: any` completely untyped
- `useGame.ts` — imports `screenOrientation` from `expo-screen-orientation` but module is `expo-screen-orientation` (actual package name) — may fail
- `useSocketSetup.ts` is never imported anywhere — dead code
- `useChat.ts:8` — destructures `user` and `otherUserId` as positional params but they come from a single `user` object and a string — the function signature `(user, otherUserId)` works but the destructuring inside is confusing (`userId = user?.id`)

---

### 3. Services (`services/`)

| Service | File | Lines | Real API or Mock? |
|---------|------|-------|-------------------|
| `authService` | `services/authService.ts` | 78 | ✅ Real (register, login, session) |
| `gameService` | `services/gameService.ts` | 177 | ❌ Mostly hardcoded mock data |
| `facehuntService` | `services/facehuntService.ts` | 188 | ❌ 100% hardcoded mock data |
| `postService` | `services/postService.ts` | 33 | ✅ Real (topPosts) |
| `chatService` | ❓ | — | Referenced but never read |
| `friendService` | ❓ | — | Referenced but never read |
| `playerService` | 🔍 | — | Referenced but never fully read |
| `chatSocket` | `services/chatSocket.ts` | 25 | ✅ Real Socket.IO client |
| `gameSocket` | `services/gameSocket.ts` | 27 | ✅ Real Socket.IO client |
| `shotService` | 🔍 | — | Referenced |
| `gamemodeService` | 🔍 | — | Referenced |

**Issues:**
- **`facehuntService.ts`** — all functions return hardcoded arrays. `getComments()` returns 19 hardcoded lorem-ipsum comments with picsum.photos URLs. `getLikes()` returns 9 hardcoded items. `getFacehunt()` returns a hardcoded picsum URL. **Zero real API calls.**
- **`gameService.ts`** — `getPlayerOptions()`, `getWaitingPlayers()`, `getGameStatus()`, `getShotMessages()`, `getHighlightCandidates()`, `getTopHighlights()` all return hardcoded mock data with picsum.photos URLs. Only `createGame()` and `joinGame()` make real API calls.
- **`postService.ts`** — `topPosts()` makes real API call. `likePost()` only logs to console, never calls the API.
- **`facehuntService.ts`** — `likeFacehunt()` and `postComment()` only log to console, never call the API.
- `authService.ts:12` — `let token: string | null = null` is a module-level variable never used (the token is stored in AsyncStorage)
- `authService.ts:12` — `API_BASE = API+'/auth'` — the backend routes are at `/auth/register`, `/auth/login`, `/auth/session`
- `createGame()` returns `res.text()` but the backend returns JSON (`{ identifier: "uuid", ... }`)
- `gameSocket.ts:6` — uses `let socket` (mutable module singleton) — `initSocket` doesn't check for existing connection before creating a new one

---

### 4. Interfaces (`interfaces/`)

| File | Types |
|------|-------|
| `interfaces/index.ts` | `UserType`, `FacehuntType`, `RegisterType`, `LoginType` |
| `interfaces/game.ts` | `playerType`, `bulletType`, `weaponType`, `shotMessageType`, `gamemodeType`, `highlightType`, `highlightCandidateType` |
| `interfaces/chat.ts` | `messageType` |
| `interfaces/create.ts` | 🔍 (not fully read) |
| `interfaces/friends.ts` | 🔍 (not fully read) |
| `interfaces/join.ts` | 🔍 (not fully read) |
| `interfaces/facehunt.ts` | 🔍 (not fully read) |

**Issues:**
- **Duplicated from `/types`**: The project has `/types/` (shared types package) and `/frontend/interfaces/` (separate, local copies). They are completely independent and WILL drift. For example, `/types/UserType.ts` has `{ name?, email, username, credits, friends, ... }` while `frontend/interfaces/index.ts` has `{ name, profilePic?, id }` — different shapes entirely.
- `facehuntType` from `interfaces/facehunt.ts` has `{ hunt, author, time }` but `FacehuntType` from `interfaces/index.ts` has `{ id, imageUrl, likes, comments }` — both used across the app, inconsistent.
- `messageType` from `interfaces/chat.ts` has `{ content, image, link, id, senderID, receiverID, status, timestamp }` but the backend Mongoose model has `{ sender, receipt, content, status }` — field names don't match (`receipt` vs `receiverID`, `sender` vs `senderID`).
- `userType` (lowercase) vs `UserType` (capital) — some pages import `userType`, others import `UserType`. Both exist in different interface files and have **different shapes**. This causes type mismatches across the app.

---

### 5. Components (`components/layout/` + `components/ui/`)

| Component | Quality | Notes |
|-----------|---------|-------|
| `Authentication.tsx` | Good | Clean form, proper prop typing |
| `Feed.tsx` | Good | FlatList with loadMore, no major issues |
| `Taskbar.tsx` | Good | Simple, works |
| `RoundUI.tsx` | Fair | `RoundUIProps` declares `setPhase` but the actual usage in `game/[gameId].tsx` passes `shotMessages`, `setDead`, `dead` which are not in the interface — TypeScript should flag this |
| `LoadingScreen.tsx` | Good | Simple |
| `MessagesList.tsx` | 🔍 | Not fully read |
| `ChatHeader.tsx` | 🔍 | Not fully read |
| `Keyboard.tsx` | 🔍 | Not fully read |

---

### 6. UI Components (`components/ui/`)

| Component | Quality | Notes |
|-----------|---------|-------|
| `Button.tsx` | Good | Simple |
| `DeepButton.tsx` | Good | Animated button |
| `GoBackButton.tsx` | Good | Works |
| `PlainButton.tsx` | Good | Works |
| `FriendCard.tsx` | Good | Simple |
| `LikeButton.tsx` | Good | Works |
| `GameOverlay.tsx` | Fair | Uses `player.weapon` but the store stores `player.player.weapon` — nesting mismatch |
| `PlayersList.tsx` | Fair | Same nesting issue |
| `RoundInfo.tsx` | Fair | Same |
| `GameActionBar.tsx` | Fair | Same |
| `ScanQR.tsx` | 🔍 | Uses `qrcode` package, not fully read |
| `Comment.tsx` | 🔍 | Not fully read |
| `MessageBubble.tsx` | 🔍 | Not fully read |

---

## Issues by Severity

### 🔴 Critical (will cause crashes)

| # | Issue | File |
|---|-------|------|
| 1 | `facehuntService.ts` — ALL functions return hardcoded data. Likes, comments, facehunts don't actually call the API. The app appears to work but no data is persisted. | `services/facehuntService.ts` (entire file) |
| 2 | `gameService.ts` — 6/8 functions return hardcoded mock data (`getPlayerOptions`, `getWaitingPlayers`, `getGameStatus`, `getShotMessages`, `getHighlightCandidates`, `getTopHighlights`). Game lobby status, shot history, and highlight candidates will never reflect real game state. | `services/gameService.ts` |
| 3 | `postService.likePost()` and `facehuntService.likeFacehunt()` only `console.log` — likes are never sent to the backend. | `services/postService.ts:30`, `facehuntService.ts:5` |
| 4 | `facehuntService.postComment()` only `console.log` — comments are never saved. | `services/facehuntService.ts:8` |
| 5 | `useGame.ts` imports `expo-screen-orientation` but actual package is `expo-screen-orientation` — correct name but export may differ. | `hooks/useGame.ts:5` |

### 🟡 High (incorrect behavior)

| # | Issue | File |
|---|-------|------|
| 6 | `userType` vs `UserType` — both exist with different shapes. Pages import one or the other inconsistently. `index.tsx:26` uses `userType` (not imported), `account/index.tsx:22` uses `userType` (not imported). | 10+ files |
| 7 | `chat/[chatId].tsx:57` — typo `setSesion(null)` instead of `setSession(null)` — when token validation fails, this throws a runtime error instead of clearing session. | `app/chat/[chatId].tsx:57` |
| 8 | `facehunt/[facehuntId].tsx:43` — `getSession()` called without arguments but signature requires `token: string`. Will throw "No session token found". | `app/facehunt/[facehuntId].tsx:43` |
| 9 | `create/index.tsx` — `notifyFriends(gameID)` calls the function with a string but its signature expects `(user: userType)`. | `app/create/index.tsx:107` |
| 10 | `feed.tsx:30` — accesses `item._id` but `FacehuntType` interface has `id` not `_id`. | `components/layout/Feed.tsx:30` |
| 11 | `feed.tsx:34,36` — accesses `item.image`, `item.likes`, `item.commentsCount` but `FacehuntType` interface has `{ id, imageUrl, likes, comments }`. | `components/layout/Feed.tsx:34,36` |

### 🟢 Medium (code quality)

| # | Issue | File |
|---|-------|------|
| 12 | Dark mode is non-functional — all pages default to `Colors.light` when `colorScheme === 'dark'`. Every page uses `colorScheme === 'dark' ? Colors.light : Colors.light`. | All pages |
| 13 | `useSocketSetup.ts` is never imported anywhere — dead code | `hooks/useSocketSetup.ts` |
| 14 | `VotingUI.tsx` is an empty file (0 lines) but `game/[gameId].tsx` defines `VotingUI` inline | `components/layout/VotingUI.tsx` |
| 15 | Multiple unused imports across all pages — `Image`, `TextInput`, `FlatList`, `TouchableOpacity`, `Pressable`, etc. | All page files |
| 16 | `interfaces/` duplicates `/types/` — completely separate, will drift | `interfaces/` vs `/types/` |
| 17 | `API.ts` hardcoded ngrok URL — now fixed with env var fallback | `constants/API.ts` |
| 18 | `gameSocket.ts` and `chatSocket.ts` use mutable `let socket` singletons — `initSocket` never checks for existing connections | `services/gameSocket.ts:5`, `chatSocket.ts:5` |

### ⚪ Low (polish)

| # | Issue | File |
|---|-------|------|
| 19 | `axios` in package.json but all API calls use `fetch` | `package.json` |
| 20 | `react-icons` in package.json — only `GiPistolBullet` imported but never rendered | `package.json`, `components/ui/RoundInfo.tsx` |
| 21 | `expo` appears in both `dependencies` and `devDependencies` with different version specifiers | `package.json` |
| 22 | `@react-native-community/cli: "latest"` — bad practice, should pin | `package.json` |
| 23 | Button title typo: "Create aGame" | `app/create/index.tsx:158` |
| 24 | `game/[gameId].tsx` is 340 lines — should be split into smaller components | `app/game/[gameId].tsx` |
| 25 | Large empty comment block about websockets in `facehunt/[facehuntId].tsx:68-74` | `app/facehunt/[facehuntId].tsx` |
| 26 | `friendService.ts` and `shotService.ts` referenced but never read | Multiple files |

---

## Performance Assessment

| Aspect | Rating | Notes |
|--------|--------|-------|
| Bundle size | Good | Expo managed workflow, tree-shakeable |
| Re-renders | Fair | No `React.memo` usage outside `game/[gameId].tsx` (only `CameraContainer`) |
| Image loading | Fair | Uses `expo-image` only in some places, `Image` from RN in others |
| List performance | Good | `FlatList` with `keyExtractor` (mostly correct keys) |
| Animation | Good | `react-native-reanimated` 4.x included |
| Network calls | Poor | Many services return hardcoded data — no actual network calls to measure |

---

## Security Assessment

| Aspect | Rating | Notes |
|--------|--------|-------|
| Token storage | Fair | JWT in AsyncStorage (unencrypted on Android) |
| API key exposure | Good | Now env var based |
| Input validation | Poor | No sanitization on text inputs |
| Deep linking | Fair | `expo-linking` included, no validation of incoming links |

**Issues:**
- AsyncStorage stores JWT tokens without encryption — on Android, any app with root access can read them
- No certificate pinning — HTTPS but no `ssl-pinning`
- `socket.io-client` uses websocket transport — no token refresh mechanism

---

## Testing

| Aspect | Rating | Notes |
|--------|--------|-------|
| Unit tests | **None** | Zero test files in the entire frontend |
| E2E tests | **None** | No Detox, no Maestro, no Appium |
| Manual testing | Assumed | Relies on developer manual testing |

---

## Scores

```
Architecture:       6/10  (clean routing, but service layer is full of mocks)
Code Quality:       5/10  (type mismatches, dead code, unused imports)
Performance:        6/10  (RN Reanimated + FlatList, but no memoization)
Security:           4/10  (JWT in AsyncStorage, no pinning, no route guards)
Testing:            0/10  (zero tests in entire frontend)
v1.0 Readiness:     4/10  (core UI works, but most backend integrations are mocked)
```

### V1.0 Blockers

The biggest risk is **items 1-4 (Critical)** — the `facehuntService`, `gameService`, `postService` all return hardcoded data. The app will appear to work in demo mode but likes, comments, game status, shot history, and highlights will never persist or reflect real gameplay. These need real API calls before the app can be shipped as v1.0.
