# ByteWave Digital Enterprise Landing Page

Marketing landing page for ByteWave Digital Enterprise, covering its product
platforms, IT consulting, software solutions for startups/MSMEs, and
CSR/community engagement. Its first two products are **SideQuest.BN** and
**SideQuest Tourism**.

## Run locally

Use the local dev server when testing the signup forms:

```bash
npm run dev
```

Open the printed URL, usually `http://localhost:3000`.

You can still open `index.html` directly for a quick visual check, but form
submissions need the dev server or a live host because Resend must run
server-side.

## Resend setup

The early-access forms post to `api/early-access.js`, which sends a notification
email through Resend. Create a `.env.local` file using `.env.example` as the
template:

```bash
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL="ByteWave Digital <hello@your-verified-domain.com>"
RESEND_TO_EMAIL="Aziq.bytewavedigital@gmail.com"
PORT=3000
```

For production, add the same env vars in your hosting dashboard. Use a verified
Resend domain for `RESEND_FROM_EMAIL`; `onboarding@resend.dev` is only a testing
fallback.

## Deploy

This repo is ready for Vercel:

1. Import the repo into Vercel or deploy with the Vercel CLI.
2. Add `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `RESEND_TO_EMAIL` in Project
   Settings -> Environment Variables.
3. Deploy. The static site is served normally and `/api/early-access` becomes
   the serverless email endpoint.

Other static hosts can serve the page, but they also need an equivalent
server-side function for `/api/early-access`. GitHub Pages alone will not run
the Resend integration.

## Checks

```bash
npm run check
```

This validates the JavaScript syntax for the frontend, API endpoint, and local
dev server.

## Project structure

```text
index.html              Page markup
css/style.css           All styling and design tokens
js/main.js              Splash, nav, scroll effects, tabs, forms, 3D hero
api/early-access.js     Server-side Resend email endpoint
scripts/dev-server.js   Local static/API dev server
assets/                 Founder photo, favicon, screenshots, etc.
AGENTS.md               Context file for AI coding agents
```

## Before this goes live

- Add a favicon.
- Verify the Resend sending domain.
- Set the production environment variables on the host.

## Stack

Vanilla HTML/CSS/JS. 3D hero animation built with Three.js r128 from cdnjs.
Fonts: Space Grotesk, Inter, IBM Plex Mono from Google Fonts. The email
integration uses Resend's HTTPS API from a server-side function.
