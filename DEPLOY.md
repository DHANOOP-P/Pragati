# Deploy Pragati (Vercel + Render + Atlas)

The React site goes on **Vercel** (free). The Express API goes on **Render** (free). MongoDB stays on **Atlas**.

Do not put Atlas passwords, JWT secrets, Razorpay keys, or Cloudinary secrets in git or in chat. Paste them only in the Vercel and Render dashboards.

Locally, leave `VITE_API_URL` empty. Vite still proxies `/api` to `http://localhost:5000`.

## 1. Push to GitHub

1. Create a GitHub repository for this project (public or private).
2. Confirm `backend/.env` is not committed (it is listed in `backend/.gitignore`).
3. Push `frontend/` and `backend/` together.

## 2. Render — API

1. Sign in at [render.com](https://render.com) with GitHub.
2. **New → Web Service** → select repo `DHANOOP-P/Pragati`.
3. Fill the form:

   | Field | Value |
   | --- | --- |
   | Name | `pragati-api` |
   | Language | Node |
   | Branch | `main` |
   | Region | Singapore or Ohio is fine |
   | Root Directory | `backend` |
   | Build command | `npm install` |
   | Start command | `npm start` |
   | Instance type | Free |

4. Environment variables (copy values from your local `backend/.env`, not from this file):

   | Key | Notes |
   | --- | --- |
   | `MONGO_URI` | Atlas URI with database `pragati` |
   | `JWT_SECRET` | Same secret as local |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin login |
   | `CLIENT_URL` | Exact Vercel origin, e.g. `https://pragati-ten-azure.vercel.app` (no trailing slash). `https://*.vercel.app` is also allowed in code. |
   | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | From `.env` |
   | `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Posters |
   | `SMTP_*` | Gmail SMTP for tickets and the contact form. `CONTACT_TO` defaults to `pragati2024lead@gmail.com`. |

   Do not set `PORT`. Render sets it. Express already reads `process.env.PORT` and listens on `0.0.0.0`.

5. Deploy. Copy the URL, e.g. `https://pragati-api.onrender.com`.
6. Check `https://your-api.onrender.com/api/health` — it should return `{ ok: true, name: "Pragati API" }`. The free tier sleeps when idle; the first request can take 30–60 seconds.

## 3. MongoDB Atlas

1. Keep database name **pragati**.
2. **Network Access:** allow Render. For a fest site, `0.0.0.0/0` is the simple option.
3. Use a database user whose password is only stored in Render’s `MONGO_URI`.

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
   VITE_API_URL=https://your-api.onrender.com/api
   ```

   Replace with your real Render URL. Include `/api`. No trailing slash.

5. Deploy. Copy the origin (`https://your-app.vercel.app`).
6. On Render, set `CLIENT_URL` to that origin, then save so the API restarts.
7. If you added `VITE_API_URL` after the first frontend build, **Redeploy** the Vercel project. Vite bakes env into the build.

`frontend/vercel.json` rewrites unknown paths to `index.html` so React Router URLs (`/events/...`, `/admin`) work on refresh.

## 5. After both URLs exist

1. Open the Vercel site.
2. In DevTools → Network, catalog/login requests should go to `*.onrender.com`, not to Vercel.
3. Smoke-check: home, login, arts register (GECW mail), workshop/proshow pay, admin gates, point table, ticket PDF download.

## Caveats

- Render’s free web service spins down after idle; the first API call after sleep is slow.
- Files written only to `/uploads` on Render disappear on restart. Use Cloudinary URLs for images.
- Do not host this Express API as a Vercel serverless function without a larger rewrite.
