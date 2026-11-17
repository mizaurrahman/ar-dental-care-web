# AR Dental Care — Web

React + Vite + Tailwind SPA for AR Dental Care (doctor dashboard + public appointment / prescription pages).

## Setup

```bash
cp .env.example .env
npm ci
npm run dev
```

Default API: `VITE_API_URL=http://127.0.0.1:8000/api`

Pair with the **ar-dental-care-api** repository. Full install: see that repo’s `HowToSetup.md`.

## Demo

- Login: `doctor@ardental.local` / `password`
- Public appointment: `/appointment/ar-dental-care`

## Free deploy — Cloudflare Pages

1. Open [Cloudflare Pages](https://pages.cloudflare.com) → **Create** → connect GitHub repo `mizaurrahman/ar-dental-care-web`.
2. Build settings:
   - **Framework preset:** Vite (or None)
   - **Build command:** `npm ci && npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (repo root)
3. Environment variable (Production):
   - `VITE_API_URL` = `https://YOUR-API-SERVICE.onrender.com/api`  
     (must match the Render API URL from `ar-dental-care-api`)
4. Deploy. You get a free URL like `https://ar-dental-care-web.pages.dev`.
5. In the Render API dashboard, set:
   - `FRONTEND_URL` = your Pages URL (no trailing slash)
   - `APP_URL` = your Render API URL  
   Then **Manual Deploy** the API once so appointment/Rx share links use the Pages host.

SPA routing is handled by [`public/_redirects`](public/_redirects).

### Notes

- `VITE_*` vars are baked in at **build** time — change API URL → rebuild Pages.
- First API hit after idle may be slow (Render free sleep).
