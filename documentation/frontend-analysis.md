# Frontend Analysis — FaceHunter

> Generated: 2026-05-02
> Last Updated: 2026-05-02 (fixes applied)
> Tech Stack: React Native 0.81.5 / Expo SDK 54 / TypeScript 5.9 / Expo Router 6

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Tech Stack](#2-tech-stack)
3. [Directory Structure](#3-directory-structure)
4. [Must Fixes — To Launch](#4-must-fixes--to-launch)
5. [Must Fixes — Production](#5-must-fixes--production)
6. [Recommendations](#6-recommendations)

---

## 1. Overview & Architecture

FaceHunter is a **real-time multiplayer face-hunting game** built with React Native (Expo). Players take photos of each other in real-time rounds, vote on the best shots, and climb a leaderboard. Communication uses **Socket.IO** WebSockets for game state and chat, with a REST API backend for user management and posts.

### Key Architectural Decisions

| Decision | Choice | Notes |
|---|---|---|
| Navigation | **Expo Router** (file-based) | Routes map 1:1 to files in `app/` |
| State Management | **Zustand** | Single store for current player |
| Real-time | **Socket.IO** | Separate sockets for game + chat |
| Backend Comm | Raw `fetch` API | Axios installed but unused |
| Styling | **StyleSheet** (no CSS-in-JS) | Static styles, theme via `Colors.ts` |
| Bundler | **Metro** | Default Expo bundler |
| JS Engine | **Hermes** | Enabled for Android/iOS |
| New Architecture | **Fabric** | Enabled |

---

## 2. Tech Stack

### Production Dependencies

| Package | Version | Purpose |
|---|---|---|
| `expo` | ~54.0.20 | Core SDK |
| `expo-router` | ~6.0.13 | File-based navigation |
| `react` | 19.1.0 | UI framework |
| `react-native` | 0.81.5 | Native rendering |
| `react-native-web` | ^0.21.0 | Web support |
| `zustand` | ^5.0.8 | State management |
| `socket.io-client` | ^4.8.1 | WebSocket client |
| `dayjs` | ^1.11.13 | Date formatting |
| `expo-camera` | ^17.0.8 | Camera (QR scan, gameplay) |
| `react-native-reanimated` | ^4.1.3 | Animations |
| `react-native-gesture-handler` | ~2.28.0 | Gestures |
| `react-native-qrcode-svg` | ^6.3.15 | QR code rendering |
| `react-native-svg` | 15.12.1 | SVG rendering |
| `@react-native-async-storage/async-storage` | ^2.2.0 | Token storage |
| `react-native-safe-area-context` | ~5.6.0 | Safe area insets |
| `react-native-screens` | ~4.16.0 | Native screen containers |
| `react-native-image-picker` | ^8.2.1 | Image picker (unused) |
| `axios` | ^1.11.0 | HTTP client (unused) |

### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `typescript` | ~5.9.2 | Type checking |
| `eslint` | ^9.25.0 | Linting |
| `eslint-config-expo` | ~10.0.0 | Expo ESLint preset |
| `@babel/core` | ^7.25.2 | Transpilation |
| `@types/react` | ~19.1.10 | React types |

---

## 3. Directory Structure

```
frontend/
├── app/                          # Expo Router pages
│   ├── _layout.tsx               # Root layout (Stack navigator)
│   ├── +not-found.tsx            # 404 fallback
│   ├── index.tsx                 # Home (auth + feed)
│   ├── account/index.tsx         # Account settings
│   ├── chat/[chatId].tsx         # Chat screen
│   ├── create/index.tsx          # Create game
│   ├── facehunt/[facehuntId].tsx # Post detail
│   ├── friends/index.tsx         # Friends list
│   ├── game/[gameId].tsx         # Active game (camera, voting, leaderboard)
│   ├── join/index.tsx            # Join game (QR scan)
│   └── settings/index.tsx        # Settings
├── components/
│   ├── layout/                   # Screen-level composite components
│   └── ui/                       # Reusable primitives
├── constants/
│   ├── API.ts                    # Backend URL from env
│   └── Colors.ts                 # Theme (light/dark)
├── hooks/
│   ├── useChat.ts                # Chat socket + messaging
│   ├── useColorScheme.ts         # Theme detection
│   ├── useGame.ts                # Game socket (shoot, vote)
│   ├── useGameLobby.ts           # Lobby socket (join, ready)
│   ├── useSocketSetup.ts         # Chat alert sockets
│   └── useThemeColor.ts          # Theme color utility
├── interfaces/
│   ├── index.ts                  # Re-exports (partial)
│   ├── chat.ts                   # messageType
│   ├── create.ts                 # gamemodeOptionsType, gameType
│   ├── facehunt.ts               # facehuntType, likeType, commentType
│   ├── friends.ts                # friendType, gameType (duplicate name!)
│   ├── game.ts                   # playerType, bulletType, etc.
│   └── join.ts                   # classType, weaponType, etc.
├── services/
│   ├── authService.ts            # register, login, getSession, logout
│   ├── chatService.ts            # getOtherUserData
│   ├── chatSocket.ts             # Socket.IO init (chat)
│   ├── facehuntService.ts        # MOCK data only
│   ├── friendService.ts          # getFriends, blockFriend
│   ├── gamemodeService.ts        # getGamemodeOptions, getGamemodeInfo
│   ├── gameService.ts            # createGame, joinGame, MOCK helpers
│   ├── gameSocket.ts             # Socket.IO init (game)
│   ├── messageService.ts         # MOCK data only
│   ├── playerService.ts          # uploadPicture, MOCK player data
│   ├── postService.ts            # topPosts (paginated), likePost
│   └── shotService.ts            # evalShot (placeholder)
├── stores/
│   └── usePlayerStore.ts         # Zustand store
└── assets/                       # Fonts, icons, images
```

---

## 4. Must Fixes — To Launch

These are **blocking issues** that will prevent the app from building or running.

### 4.1 Critical Compilation Errors

| # | File | Issue | Status |
|---|---|---|---|
| 1 | `components/ui/RoundInfo.tsx` | Imports `GiPistolBullet` from **`react-icons/gi`** — a web-only ESM library. Metro bundler will crash on React Native. | ✅ FIXED — Removed import |
| 2 | `components/layout/Comments.tsx` | Uses `useRef` **without importing it** from React. Throws `ReferenceError`. | ✅ FIXED — Added `useRef` to import |
| 3 | `services/gamemodeService.ts:17` | Typo: `concole.error(...)` instead of `console.error(...)`. Will crash at runtime. | ❌ Still open |
| 4 | `app/chat/[chatId].tsx:57` | Typo: `setSesion(null)` should be `setSession(null)`. | ✅ FIXED |

### 4.2 TypeScript / Import Errors

| # | File | Issue | Status |
|---|---|---|---|
| 5 | `app/index.tsx` | Uses `userType` (lowercase) but only `UserType` (capital U) exported. Also undefined `Post` type. | ✅ FIXED — Added `userType` alias + all missing types |
| 6 | Multiple files | `userType` vs `UserType` mismatch. | ✅ FIXED — Added `type userType = UserType` alias |
| 7 | `app/chat/[chatId].tsx` | `messageType` not re-exported from barrel. | ✅ FIXED — Added to `interfaces/index.ts` |
| 8 | `app/create/index.tsx` | `gameType`, `gamemodeOptionsType` not re-exported. | ✅ FIXED — Added to `interfaces/index.ts` |
| 9 | `app/friends/index.tsx` | `Post` not defined. | ✅ FIXED — Added `Post` interface |
| 10 | `app/join/index.tsx` | `waitingPlayersType` doesn't exist. | ✅ FIXED — Added type |
| 11 | `app/account/index.tsx`, `app/settings/index.tsx` | Import `getUserData` — not exported from `authService.ts`. | ✅ FIXED — Removed import |
| 12 | `app/facehunt/[facehuntId].tsx:43` | Calls `getSession()` with no args (requires `token`). | ✅ FIXED — Rewrote to use proper auth pattern |
| 13 | `app/facehunt/[facehuntId].tsx:84` | `comment.author = user.name` — type mismatch. | ✅ FIXED — Changed to `user.id` |

### 4.3 Missing Configuration

| # | Issue | Status |
|---|---|---|
| 14 | **No `.env` file** — Falls back to hardcoded ngrok URL. | ❌ Still open — copy `.env.example` → `.env` |
| 15 | **No `babel.config.js`** — Expo Router may not work without it. | ❌ Still open |

### 4.4 Runtime Logic Bugs

| # | File | Issue | Status |
|---|---|---|---|
| 16 | Multiple files | Dark mode always returns light theme. | ❌ Still open |
| 17 | `components/layout/CreateAfter.tsx:29` | Calls `notifyFriendsService(gameID)` with string, expects object. | ❌ Still open |
| 18 | `components/layout/JoinOptions.tsx:53` | `waitingPlayers` used as array but typed as object. | ❌ Still open |
| 19 | `components/ui/GameActionBar.tsx:42` | `player.remainingHP` should be `player.health`. | ❌ Still open |
| 20 | `components/ui/GameActionBar.tsx`, `FriendCard.tsx` | `borderRadius: '50%'` unsupported on RN. | ❌ Still open |
| 21 | `components/ui/PlayersList.tsx:26` | `colors.error` should be `Colors.light.error`. | ❌ Still open |
| 22 | `components/layout/FacehuntContainer.tsx` | `setHasLiked` type mismatch. | ✅ FIXED |

Also fixed:
- `session` type from `number | null` → `string | null` in 6 files
- `app/friends/index.tsx`: Fixed `contententContainerStyle` typo, `null` state, `id` type
- `app/facehunt/[facehuntId].tsx`: Fixed `facehuntType` import, `null` safety, style reference
- `app/index.tsx`: Fixed `LoginType` field (`username` → `email`)
- Added `types/globals.d.ts` — declaration for `react-native-immersive`

---

## 5. Must Fixes — Production

### 5.1 Reliability (High Priority)

| # | Issue |
|---|---|
| 1 | **No error boundaries** anywhere. Any uncaught JS error causes a white-screen crash of the entire app. Wrap root layout + key screens with `ErrorBoundary`. |
| 2 | **Socket connections lack reconnection logic.** If WebSocket drops mid-game, game state becomes permanently stale. Socket.IO supports `reconnection: true` by default — ensure it is enabled and add user-facing reconnection feedback. |
| 3 | **Services return mock data silently.** `facehuntService.ts`, `messageService.ts`, `playerService.ts`, `gameService.ts` all return hardcoded mock data. Users will see fake data with no indication it's not real. These need real API integration or at minimum a warning/fallback state. |

### 5.2 Security (Medium Priority)

| # | Issue |
|---|---|
| 4 | Hardcoded ngrok URL fallback in `constants/API.ts` exposes the backend endpoint if `.env` is missing. Remove the fallback and fail explicitly. |
| 5 | Session tokens stored in `AsyncStorage` with no encryption. Consider using `expo-secure-store` for token storage. |
| 6 | No input sanitization on login/register forms. Add validation and sanitization. |

### 5.3 Performance (Medium Priority)

| # | Issue |
|---|---|
| 7 | `React.memo(CameraContainer)` defined **inside** the render function in `app/game/[gameId].tsx:161-177`. This creates a new component on every render, completely defeating memoization. Extract to module scope. |
| 8 | **No image optimization.** `expo-image` is installed but unused. All `<Image>` components use raw React Native `Image` with no caching, lazy loading, or placeholders. Migrate to `expo-image` for automatic caching and performance. |
| 9 | **Unused dependencies bloat bundle.** `axios`, `@react-navigation/*` (3 packages), `react-native-image-picker` are installed but never used. |

### 5.4 User Experience (Medium Priority)

| # | Issue |
|---|---|
| 10 | Dark mode is broken — the ternary always selects `Colors.light` in 4 separate files. |
| 11 | No loading indicators for most async operations. Users see blank screens during data fetches. |
| 12 | `Alert.alert()` used extensively for feedback. Replace with in-app toast/snackbar for better UX. |
| 13 | `borderRadius: '50%'` on several circular elements — will render as squares on RN. |

---

## 6. Recommendations

### 6.1 Immediate (Pre-Launch)

- [x] **Replace `react-icons` in `RoundInfo.tsx`** — Removed import
- [x] **Add `useRef` import** to `Comments.tsx`
- [x] **Fix `setSesion` typo** in `chat/[chatId].tsx`
- [x] **Add `userType` alias** + all missing types to `interfaces/index.ts`
- [x] **Remove `getUserData` imports** from screens where it doesn't exist
- [x] **Fix `getSession()` calls** — now passes token correctly
- [x] **Fix `session` types** — changed from `number | null` to `string | null` in 6 files
- [x] **Add type declarations** for `react-native-immersive`
- [ ] **Create `babel.config.js`** with `expo-router/babel` plugin
- [ ] **Copy `.env.example` → `.env`** with a valid API URL
- [ ] **Run `npx tsc --noEmit`** and fix remaining type errors (mostly in `game/[gameId].tsx` and `chat/[chatId].tsx`)
- [ ] **Fix `concole.error` typo** in `gamemodeService.ts`
- [ ] **Fix dark mode ternary** (`Colors.light : Colors.light` → `Colors.dark : Colors.light`)
- [ ] **Fix percentage `borderRadius`** values to numeric

### 6.2 Short-Term

- [ ] **Re-export all interfaces** from `interfaces/index.ts` to fix barrel imports
- [ ] **Move `CameraContainer`** outside the render function in `game/[gameId].tsx`
- [ ] **Replace mock services** with real API calls (at minimum `facehuntService`, `messageService`, `playerService`)
- [ ] **Add error boundaries** at the root layout level
- [ ] **Remove unused deps:** `axios`, `@react-navigation/*`, `react-native-image-picker`
- [ ] **Standardize imports** — pick either `@/` aliases or relative paths, don't mix

### 6.3 Long-Term

- [ ] **Migrate to `expo-secure-store`** for session token storage
- [ ] **Add toast/snackbar system** to replace `Alert.alert()`
- [ ] **Add image caching** via `expo-image`
- [ ] **Implement socket reconnection UI** (reconnection banner, retry button)
- [ ] **Add proper loading and error states** to every screen
- [ ] **Eliminate `any` types** throughout the codebase
- [ ] **Write E2E tests** with Detox or Maestro for critical flows (auth, game lifecycle)
- [ ] **Replace `fetch` with `axios`** or remove axios — pick one pattern
- [ ] **Remove or implement** empty component files (`VotingUI.tsx`, `LeaderboardUI.tsx`)
- [ ] **Resolve duplicate `gameType` interface** — both `interfaces/create.ts` and `interfaces/friends.ts` export a `gameType` with different shapes

### 6.4 Code Health Metrics

| Metric | Current State | Target |
|---|---|---|
| TypeScript strict | Enabled | ✅ Keep |
| `any` usage | ~30+ instances | 0 |
| Test coverage | 0% | ≥60% |
| Unused deps | 5 packages | 0 |
| Mock services | 6 of 12 services | 0 |
| Error boundaries | 0 | ≥5 (root + key screens) |
