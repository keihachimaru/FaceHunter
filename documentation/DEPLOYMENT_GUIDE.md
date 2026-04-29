# FaceHunter — Deployment Guide

## Architecture on Railway

```
┌─────────────────────────────────────────────────────┐
│                    Railway                          │
│                                                     │
│  Service 1: api (Flask/InsightFace)                 │
│  Dockerfile: api/Dockerfile                         │
│  Port: 5000                                         │
│  Env: FACEHUNTER_API_KEY                            │
├─────────────────────────────────────────────────────┤
│  Service 2: backend (NestJS)                        │
│  Dockerfile: backend/Dockerfile                     │
│  Port: 3000                                         │
│  Env: MONGODB_URI, JWT_SECRET, Cloudinary vars      │
├─────────────────────────────────────────────────────┤
│  External: MongoDB Atlas (free tier M0)             │
│  External: Cloudinary (free tier)                   │
└─────────────────────────────────────────────────────┘
```

---

## Prerequisites

- GitHub repo pushed with latest code
- [Railway account](https://railway.app) (GitHub login)
- [MongoDB Atlas](https://www.mongodb.com/atlas) free tier cluster
- [Cloudinary](https://cloudinary.com) free account

---

## Step 1 — MongoDB Atlas Setup

1. Go to https://www.mongodb.com/atlas → Create a free M0 cluster
2. Create a database user (username + password)
3. Under **Network Access** → Add IP `0.0.0.0/0` (allow all, Railway IPs are dynamic)
4. Click **Connect** → **Drivers** → Copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/facehunterdb?retryWrites=true&w=majority
   ```

---

## Step 2 — Railway Project Setup

1. Open https://railway.app → **New Project** → **Deploy from GitHub repo**
2. Select your FaceHunter repo
3. Railway will detect both `api/Dockerfile` and `backend/Dockerfile`
4. **Do NOT let it auto-deploy yet** — configure variables first

---

## Step 3 — Deploy the API Service (Flask)

1. In Railway dashboard, select the **api** service
2. Go to **Variables** tab and add:

   | Variable | Value |
   |----------|-------|
   | `FACEHUNTER_API_KEY` | Generate a random 64-char hex key: `openssl rand -hex 32` |
   | `FLASK_DEBUG` | `0` |

3. Go to **Settings** → **Deploy** → set **Root Directory** to `api`
4. Railway auto-detects `api/Dockerfile` as the build file
5. Click **Deploy**
6. After deploy finishes, copy the **public URL** (e.g., `https://api-production-xxxx.up.railway.app`)

---

## Step 4 — Deploy the Backend Service (NestJS)

1. In Railway dashboard, add a **New Service** → select backend
2. Go to **Variables** tab and add:

   | Variable | Value | Notes |
   |----------|-------|-------|
   | `MONGODB_URI` | Your Atlas connection string (see Step 1) | |
   | `JWT_SECRET` | `openssl rand -hex 32` | Use ALL-CAPS, this is what `auth.service.ts` reads |
   | `Jwt_SECRET` | **Same value as above** | Workaround: both casings needed until the typo is fixed |
   | `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard | |
   | `CLOUDINARY_API_KEY` | From Cloudinary dashboard | |
   | `CLOUDINARY_API_SECRET` | From Cloudinary dashboard | |
   | `PORT` | `3000` | (optional, default) |

3. Go to **Settings** → **Deploy** → set **Root Directory** to `backend`
4. Railway auto-detects `backend/Dockerfile`
5. Click **Deploy**
6. After deploy finishes, copy the **public URL** (e.g., `https://backend-production-xxxx.up.railway.app`)

---

## Step 5 — Wire Services Together

The backend needs to know where the API (face recognition) lives.

Currently the Flask URL is hardcoded in `backend/src/endpoints/player/player.controller.ts`:
```ts
const res = await axios.post(
    'http://127.0.0.1:5000/identify-face',
```

**Fix before deploying** — add an env var:

In `player.controller.ts`, replace:
```ts
'http://127.0.0.1:5000/identify-face',
```
with:
```ts
`${process.env.FACEHUNTER_API_URL || 'http://127.0.0.1:5000'}/identify-face`,
```

Then add this variable to the backend service on Railway:

| Variable | Value |
|----------|-------|
| `FACEHUNTER_API_URL` | `https://api-production-xxxx.up.railway.app` |

---

## Step 6 — Verify

```bash
# Check face
curl -X POST https://api-production-xxxx.up.railway.app/check-face \
  -H "X-API-Key: your-key" \
  -F "file=@api/assets/kei.jpg"

# Check backend health (add a /health endpoint first)
curl https://backend-production-xxxx.up.railway.app/
```

---

## Step 7 — Optional: Connect a Custom Domain

1. Railway Settings → **Generate Domain** → or **Custom Domain** with your own DNS
2. Useful for production so URLs don't change on redeploy

---

## Checklist

### Pre-deployment

- [ ] Fix `Jwt_SECRET` → `JWT_SECRET` casing in `app.module.ts` and guards
- [ ] Replace hardcoded Flask URL in `player.controller.ts` with `process.env.FACEHUNTER_API_URL`
- [ ] Remove `mongodb-memory-server` from `dependencies` (move to `devDependencies`)
- [ ] Add `FACEHUNTER_API_URL` env var to `backend/.env.example`
- [ ] Delete duplicate `src/common/guards/jwt-auth.guard.ts` (keep one)
- [ ] Restrict CORS in production (replace `*` with frontend domain)
- [ ] Run `npm run build` locally to verify no compile errors
- [ ] Run `npm test` to verify backend tests pass
- [ ] Push latest code to GitHub

### Railway Setup

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Cloudinary account created and API keys ready
- [ ] `FACEHUNTER_API_KEY` generated (`openssl rand -hex 32`)
- [ ] `JWT_SECRET` generated (`openssl rand -hex 32`)
- [ ] API service deployed and public URL noted
- [ ] Backend service deployed and public URL noted
- [ ] `FACEHUNTER_API_URL` set in backend env vars (pointing to API service)

### Post-deployment

- [ ] Test `/check-face` endpoint via curl
- [ ] Test backend health endpoint
- [ ] Test full auth flow: register → login → create game → join
- [ ] Set Railway **Restart Policy** → **Always**
- [ ] Enable Railway **Autoscaling** if on paid plan
- [ ] Monitor Railway logs for errors
- [ ] Set up Railway **Deploy Webhook** for auto-deploy from main branch

---

## Costs

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Railway | Starter ($5) + 2 services | ~$10 |
| MongoDB Atlas | M0 Free | $0 |
| Cloudinary | Free | $0 |
| **Total** | | **~$10/mo** |

---

## Redeploying After Changes

```bash
git add .
git commit -m "fix: description"
git push
```

Railway auto-deploys from the main branch. No manual steps needed.
