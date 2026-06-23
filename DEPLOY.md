# 🚀 Deploying Star Snooker Academy

Three free services: **MongoDB Atlas** (database) → **Railway** (backend) → **Vercel** (frontend).
Do them in this order.

---

## 1. Database — MongoDB Atlas (~5 min)
1. Sign up at https://www.mongodb.com/cloud/atlas → create a **free (M0)** cluster.
2. **Database Access** → Add a database user (username + password). Save them.
3. **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere — needed for Railway).
4. **Connect → Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxx.mongodb.net/starsnooker?retryWrites=true&w=majority
   ```
   Replace `USER`/`PASSWORD`, and keep `/starsnooker` as the DB name. This is your `MONGODB_URI`.

---

## 2. Backend — Railway (~5 min)
1. Sign up at https://railway.app → **New Project → Deploy from GitHub repo** → pick `Star-Snooker`.
2. Open the service → **Settings → Root Directory** → set to `backend`.
3. **Variables** → add:
   ```
   MONGODB_URI = (the Atlas string from step 1)
   JWT_SECRET  = (a long random string — e.g. run: openssl rand -hex 32)
   FRONTEND_URL = http://localhost:3100   (update after step 3)
   NODE_ENV = production
   ```
   (`PORT` is provided by Railway automatically — the server already uses it.)
4. **Settings → Networking → Generate Domain.** Copy it, e.g. `https://star-snooker-production.up.railway.app`.
   Your API base is that URL **+ `/api`**.
5. Test it: open `https://<your-railway-domain>/api/health` → should say `Star Snooker Academy API running!`

### Seed the first admin/staff accounts
Easiest from your PC (points at Atlas, runs once):
```bash
cd C:\Users\trupa\star-snooker\backend
npm install
# create backend/.env with: MONGODB_URI=...   JWT_SECRET=...
npm run seed
```
Creates **admin 9601818268 / staff 9106005507 (PIN 1234)**. Change the PINs after first login.

---

## 3. Frontend — Vercel (~3 min)
1. Sign up at https://vercel.com → **Add New → Project** → import `Star-Snooker`.
2. Framework preset: **Next.js** (auto). Root Directory: **`./`** (default).
3. **Environment Variables** → add:
   ```
   NEXT_PUBLIC_API_URL = https://<your-railway-domain>/api
   ```
4. **Deploy.** You'll get a URL like `https://star-snooker.vercel.app`.

---

## 4. Connect the two (CORS)
Back in **Railway → Variables**, set:
```
FRONTEND_URL = https://<your-vercel-domain>
```
Redeploy the backend. Done — the dashboards now talk to the live API.

---

## Logo
Save the real logo as `public/images/logo.png` (transparent PNG), then:
```bash
git add public/images/logo.png && git commit -m "Add logo" && git push
```
Vercel redeploys automatically.

## After it's live
- Visit `/login` → sign in as admin (9601818268 / 1234) → change PIN.
- Staff run the counter at `/staff`; admin at `/admin`; members at `/customer`.
- Whenever you push to `main`, Vercel (frontend) and Railway (backend) auto-redeploy.
