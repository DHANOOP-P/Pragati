# Deploy Pragati (Vercel + Fly.io + Atlas)

The React site goes on **Vercel** (free). The Express API goes on **Fly.io**. MongoDB stays on **Atlas**.

Do not put Atlas passwords, JWT secrets, Razorpay keys, or Cloudinary secrets in git or in chat. Set them with `fly secrets` and in the Vercel dashboard.

Locally, leave `VITE_API_URL` empty. Vite still proxies `/api` to `http://localhost:5000`.

## 1. Push to GitHub

1. Create a GitHub repository for this project (public or private).
2. Confirm `backend/.env` is not committed (it is listed in `backend/.gitignore`).
3. Push `frontend/` and `backend/` together.

## 2. Fly.io — API

1. Create an account at [fly.io](https://fly.io) and install the CLI: [flyctl](https://fly.io/docs/flyctl/install/).
2. Sign in:

   ```
   fly auth login
   ```

3. From the **backend** folder:

   ```
   cd backend
   fly launch --no-deploy
   ```

   Accept the existing `Dockerfile` and `fly.toml`. If the app name `pragati-api` is taken, pick another. Region `bom` (Mumbai) is a good default for this project.

4. Set secrets (paste values from your local `backend/.env`, not into git):

   ```
   fly secrets set MONGO_URI="your-atlas-uri" JWT_SECRET="your-jwt-secret" ADMIN_EMAIL="admin@pragati.fest" ADMIN_PASSWORD="your-admin-password" CLIENT_URL="https://your-app.vercel.app" RAZORPAY_KEY_ID="rzp_..." RAZORPAY_KEY_SECRET="..." CLOUDINARY_CLOUD_NAME="..." CLOUDINARY_API_KEY="..." CLOUDINARY_API_SECRET="..."
   ```

   Optional ticket email:

   ```
   fly secrets set SMTP_HOST="..." SMTP_PORT="587" SMTP_USER="..." SMTP_PASS="..." SMTP_FROM="Pragati <noreply@pragati.fest>"
   ```

   `CLIENT_URL` must be the exact Vercel origin (no trailing slash). You can set it after the Vercel URL exists.

   Fly sets `PORT`. Express already reads `process.env.PORT` and listens on `0.0.0.0`.

5. Deploy:

   ```
   fly deploy
   ```

6. Copy the hostname (`https://your-app.fly.dev`). Check `https://your-app.fly.dev/api/health` — it should return `{ ok: true, name: "Pragati API" }`.

   `fly.toml` uses auto-stop (`min_machines_running = 0`). The machine sleeps when idle and starts on the next request (usually a few seconds, not a full minute).

## 3. MongoDB Atlas

1. Keep database name **pragati**.
2. **Network Access:** allow Fly. For a fest site, `0.0.0.0/0` is the simple option.
3. Use a database user whose password is only stored in Fly’s `MONGO_URI` secret.

## 4. Vercel — frontend

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New → Project** → import this repo.
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Vite (auto-detected)
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Environment variable (Production):

   ```
   VITE_API_URL=https://your-app.fly.dev/api
   ```

   Replace with your real Fly hostname. Include `/api`. No trailing slash.

5. Deploy. Copy the origin (`https://your-app.vercel.app`).
6. Set Fly `CLIENT_URL` to that origin if you have not already:

   ```
   fly secrets set CLIENT_URL="https://your-app.vercel.app"
   ```

7. If you added `VITE_API_URL` after the first frontend build, **Redeploy** the Vercel project. Vite bakes env into the build.

`frontend/vercel.json` rewrites unknown paths to `index.html` so React Router URLs (`/events/...`, `/admin`) work on refresh.

## 5. After both URLs exist

1. Open the Vercel site.
2. In DevTools → Network, catalog/login requests should go to `*.fly.dev`, not to Vercel.
3. Smoke-check: home, login, arts register (GECW mail), workshop/proshow pay, admin gates, point table, ticket PDF download.

## Caveats

- Fly’s smallest machine plus auto-stop usually stays cheap; they may still ask for a payment method. Check current [Fly pricing](https://fly.io/docs/about/pricing/).
- Files written only to `/uploads` on the Fly machine disappear when it stops. Use Cloudinary URLs for images.
- Do not host this Express API as a Vercel serverless function without a larger rewrite.
