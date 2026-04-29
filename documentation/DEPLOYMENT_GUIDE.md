# FaceHunter — Deployment Guide

## Architecture on Railway

```
┌──────────────────────────────────────────────────────────┐
│                      Railway                             │
│                                                          │
│  ┌─────────────────────────────────┐                     │
│  │ Service 1: api (Flask/InsightFace)                   │
│  │ Dockerfile: api/Dockerfile       Port: 5000           │
│  │ Env: FACEHUNTER_API_KEY, FLASK_DEBUG                 │
│  └──────────────┬──────────────────┘                     │
│                 │ HTTP (internal)                        │
│  ┌──────────────▼──────────────────┐                     │
│  │ Service 2: backend (NestJS)                          │
│  │ Dockerfile: backend/Dockerfile   Port: 3000           │
│  │ Env: MONGODB_URI, JWT_SECRET, Jwt_SECRET,            │
│  │      CLOUDINARY_*, FACEHUNTER_API_URL                │
│  └─────────────────────────────────┘                     │
│                                                          │
│  External: MongoDB Atlas (free M0)                       │
│  External: Cloudinary (free)                             │
└──────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- GitHub repo pushed with all latest code
- [Railway account](https://railway.app) (login with GitHub)
- [MongoDB Atlas](https://www.mongodb.com/atlas) free tier M0 cluster
- [Cloudinary](https://cloudinary.com) free account

---

## Step 1 — MongoDB Atlas

1. Go to https://www.mongodb.com/atlas → **Create** → **M0 Free** cluster
2. Create a **Database User** (username + password — save these)
3. Under **Network Access** → **Add IP Address** → `0.0.0.0/0` (Railway egress IPs are dynamic)
4. Click **Connect** → **Drivers** → copy the connection string:

```
mongodb+srv://Kei:<db_password>@facehunter.mjiycqm.mongodb.net/?appName=FaceHunter
```

---

## Step 2 — Environment Files (local dev)

Two `.env` files have been generated with secure tokens:

### `backend/.env` (gitignored, for local dev)

Contents and what each variable maps to in code:

| Variable | Value | Code usage (file:line) |
|----------|-------|-----------------------|
| `PORT` | `3000` | `main.ts:11` — `process.env.PORT ?? 3000` |
| `MONGODB_URI` | `mongodb://localhost:27017/facehunterdb` | `app.module.ts:23` — `process.env.MONGODB_URI` |
| `JWT_SECRET` | `5eb8a16c...` (generated) | `auth.service.ts:47,57`, `message.gateway.ts:48`, `message.module.ts:15` |
| `Jwt_SECRET` | `5eb8a16c...` (same value) | `app.module.ts:39`, `common/guards/jwt-auth.guard.ts:12`, `endpoints/auth/jwt-auth.guard.ts:12` |
| `CLOUDINARY_CLOUD_NAME` | _(set yours)_ | `cloudinary.module.ts:15` |
| `CLOUDINARY_API_KEY` | _(set yours)_ | `cloudinary.module.ts:16` |
| `CLOUDINARY_API_SECRET` | _(set yours)_ | `cloudinary.module.ts:17` |

> ⚠️ **Both `JWT_SECRET` and `Jwt_SECRET` must be set to the same value.** The code uses both casings (see `MUST_FIX.md` item #1 — this is a known bug tracked for fix).

### `api/.env.example` (committed, copy to `api/.env`)

| Variable | Value | Code usage |
|----------|-------|-----------|
| `FACEHUNTER_API_KEY` | `5058f2e1...` (generated) | `app.py:15` — `os.environ.get("FACEHUNTER_API_KEY")` |
| `FLASK_DEBUG` | `0` | `app.py:112` |

> 🔑 Generate your own keys: `openssl rand -hex 32`

---

## Step 3 — Railway Project

1. https://railway.app → **New Project** → **Deploy from GitHub repo**
2. Select your FaceHunter repository
3. Railway detects both `api/Dockerfile` and `backend/Dockerfile` automatically
4. **Cancel the auto-deploy** — configure variables first

---

## Step 4 — Deploy the API Service

1. In the Railway dashboard select the **api** service
2. **Settings** → **Root Directory** → set to `api`
3. **Variables** → add these exact key-value pairs:

   | Variable | Value |
   |----------|-------|
   | `FACEHUNTER_API_KEY` | `5058f2e10ad9961e93f676362a7f1703e06b357e7748ce5e076f246889245cea` |
   | `FLASK_DEBUG` | `0` |

4. Railway auto-detects `api/Dockerfile` and builds
5. Click **Deploy**
6. After deploy finishes, copy the **public URL**:
   ```
   https://api-production-xxxx.up.railway.app
   ```

---

## Step 5 — Deploy the Backend Service

1. In Railway dashboard → **New Service** → select the **backend** directory
2. **Settings** → **Root Directory** → set to `backend`
3. **Variables** → add these exact key-value pairs:

   | Variable | Value | Notes |
   |----------|-------|-------|
   | `MONGODB_URI` | `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/facehunterdb?retryWrites=true&w=majority` | From Step 1 |
   | `JWT_SECRET` | `5eb8a16c87118c685f7dd281210ee85d8ff558cfa81128c466f2c090ee4c219a` | Used by `auth.service.ts` |
   | `Jwt_SECRET` | _(same value)_ `5eb8a16c87118c685f7dd281210ee85d8ff558cfa81128c466f2c090ee4c219a` | Used by `app.module.ts` + guards |
   | `CLOUDINARY_CLOUD_NAME` | _(from Cloudinary dashboard)_ | |
   | `CLOUDINARY_API_KEY` | _(from Cloudinary dashboard)_ | |
   | `CLOUDINARY_API_SECRET` | _(from Cloudinary dashboard)_ | |
   | `FACEHUNTER_API_URL` | `https://api-production-xxxx.up.railway.app` | From Step 4 — see note below |

4. Railway auto-detects `backend/Dockerfile` (multi-stage build: `build` stage compiles TypeScript, `production` stage runs `node dist/main`)
5. Click **Deploy**

> ⚠️ **`FACEHUNTER_API_URL` requires a code change.** Currently `player.controller.ts:88` hardcodes `http://127.0.0.1:5000/identify-face`. You must edit this file first:
>
> **File:** `backend/src/endpoints/player/player.controller.ts`  
> **Line 88 — replace:**
> ```ts
> 'http://127.0.0.1:5000/identify-face',
> ```
> **with:**
> ```ts
> `${process.env.FACEHUNTER_API_URL || 'http://127.0.0.1:5000'}/identify-face`,
> ```
>
> **Same fix on line 133** for the `/check-face` call.

---

## Step 6 — Verify Deployment

```bash
# 1. Flask API — face detection
curl -X POST https://api-production-xxxx.up.railway.app/check-face \
  -H "X-API-Key: 5058f2e10ad9961e93f676362a7f1703e06b357e7748ce5e076f246889245cea" \
  -F "file=@api/assets/kei.jpg"
# Expected: {"valid": true}

# 2. Flask API — face identification
curl -X POST https://api-production-xxxx.up.railway.app/identify-face \
  -H "X-API-Key: 5058f2e10ad9961e93f676362a7f1703e06b357e7748ce5e076f246889245cea" \
  -F "file=@api/assets/kei.jpg" \
  -F 'faces=[{"url":"https://api-production-xxxx.up.railway.app/kei.jpg","playerId":"kei"}]'

# 3. NestJS backend — health
curl https://backend-production-xxxx.up.railway.app/
# Expected: returns something (HTML or JSON)
```

---

## Step 7 — Custom Domain (Recommended)

1. Railway → service → **Settings** → **Domains**
2. Either:
   - **Generate Domain** — get a `*.up.railway.app` subdomain (free, persists across deploys)
   - **Custom Domain** — point your own DNS (CNAME to Railway)

---

## Complete .env Reference

### `backend/.env` (for local dev)

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/facehunterdb
JWT_SECRET=5eb8a16c87118c685f7dd281210ee85d8ff558cfa81128c466f2c090ee4c219a
Jwt_SECRET=5eb8a16c87118c685f7dd281210ee85d8ff558cfa81128c466f2c090ee4c219a
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### `api/.env` (for local dev)

```env
FACEHUNTER_API_KEY=5058f2e10ad9961e93f676362a7f1703e06b357e7748ce5e076f246889245cea
FLASK_DEBUG=0
```

---

## Checklist

### Pre-deployment (code changes)

- [ ] Fix `Jwt_SECRET` → `JWT_SECRET` in 3 files:
  - `backend/src/app.module.ts:39`
  - `backend/src/common/guards/jwt-auth.guard.ts:12`
  - `backend/src/endpoints/auth/jwt-auth.guard.ts:12`
- [ ] Replace hardcoded `127.0.0.1:5000` with `process.env.FACEHUNTER_API_URL` in:
  - `backend/src/endpoints/player/player.controller.ts:88` (identify-face)
  - `backend/src/endpoints/player/player.controller.ts:133` (check-face)
- [ ] Move `mongodb-memory-server` from `dependencies` → `devDependencies` in `backend/package.json`
- [ ] Delete duplicate `backend/src/common/guards/jwt-auth.guard.ts` (keep the one in `endpoints/auth/`)
- [ ] Restrict CORS in production (replace `*` with frontend domain):
  - `backend/src/main.ts:6`
  - `backend/src/endpoints/game/game.gateway.ts:29`
  - `backend/src/endpoints/message/message.gateway.ts:26`
- [ ] Run `npm run build` in `backend/` — verify zero errors
- [ ] Run `npm test` in `backend/` — verify all pass
- [ ] Commit and push all changes to GitHub

### Railway Setup

- [ ] MongoDB Atlas cluster created, user whitelisted, connection string copied
- [ ] Cloudinary account created, API keys copied
- [ ] API service deployed with `FACEHUNTER_API_KEY` + `FLASK_DEBUG=0`
- [ ] API public URL noted (`https://api-production-xxxx.up.railway.app`)
- [ ] Backend service deployed with all 7 env vars
- [ ] Backend public URL noted (`https://backend-production-xxxx.up.railway.app`)

### Post-deployment

- [ ] `curl` test — check-face works
- [ ] `curl` test — identify-face works
- [ ] Backend health endpoint responds
- [ ] Full auth flow: register → login → create game → join
- [ ] Railway **Restart Policy** set to **Always**
- [ ] Railway **Autoscaling** enabled (if on paid plan)
- [ ] Railway logs monitored for errors

---

## Costs

| Service | Plan | Monthly |
|---------|------|---------|
| Railway | Starter ($5) × 2 services | ~$10 |
| MongoDB Atlas | M0 Free | $0 |
| Cloudinary | Free | $0 |
| **Total** | | **~$10/mo** |

---

## Redeploying

```bash
git add .
git commit -m "fix: description"
git push
```

Railway auto-deploys from the default branch. No manual steps.
