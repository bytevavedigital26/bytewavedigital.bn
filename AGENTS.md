# AGENTS.md

Context file for AI coding agents (OpenCode, Claude Code, etc.) working in this repo.

## What this is

A marketing landing page for **ByteWave Digital Enterprise**, a Brunei-based
startup with two products: **SideQuest.BN** (gig-work app) and **SideQuest Tourism**
(tourism/discovery app). The frontend is plain HTML/CSS/JS. Early-access form
submissions are handled by a small Node serverless endpoint for Resend.

## Stack

- Plain HTML5, CSS3 (custom properties, no framework), vanilla JS (no framework)
- [Three.js](https://threejs.org) r128, loaded from cdnjs, for the 3D hero animation
- Google Fonts: Space Grotesk (display), Inter (body), IBM Plex Mono (labels/eyebrows)
- Vercel-style Node serverless function at `api/early-access.js` for Resend email delivery
- No bundler. `package.json` only provides local dev and syntax-check scripts.

## File structure

```
index.html        All markup, in section order (nav → hero → about → founder →
                   SideQuest.BN → SideQuest Tourism → problem/solution →
                   how-it-works → dual CTA → footer)
css/style.css      All styles. Design tokens are CSS custom properties at the
                   top of the file (:root) — start here for any color/type change.
js/main.js         All behavior: splash screen, sticky nav + mobile menu, scroll
                   progress bar ("the current"), scroll-reveal animations,
                   how-it-works tab toggle, early-access forms, 3D hero scene
                   (Three.js), 3D tilt on hover for the founder card and product mockups.
api/early-access.js Server-side Resend email endpoint for early-access forms.
scripts/dev-server.js Local static/API dev server for testing the full flow.
.env.example       Safe template for required Resend env vars.
package.json       Scripts only; no frontend framework or bundler.
assets/            Empty — reserved for a real founder photo, product screenshots,
                   or a favicon if/when they're added.
```

## Design tokens (css/style.css `:root`)

- `--ink` — ByteWave navy (primary brand color, dark sections/text)
- `--emerald` / `--marigold` — SideQuest.BN brand colors (green + gold)
- `--orchid` / `--blush` — SideQuest Tourism brand colors (purple + mauve)
- `--cloud` — off-white section background
- Type: `--display` (Space Grotesk, headings), `--body` (Inter), `--mono` (IBM Plex Mono, eyebrows/labels/step numbers)

Keep new UI within this palette — SideQuest.BN content should stay emerald/gold,
SideQuest Tourism content should stay orchid/blush, company-level content stays navy.

## Conventions / things to know before editing

- **Branding:** the company is "ByteWave Digital Enterprise." Compact contexts
  (nav, splash) use "ByteWave Digital." Never shorten to just "ByteWave" anywhere.
- **Signature element:** the vertical "current" bar (`#current-track` /
  `#current-fill`) on the left edge is a scroll-progress indicator that also
  functions as a brand motif (navy → emerald → orchid → navy). It's fixed-position
  and hidden below 900px width — keep both behaviors if you touch it.
- **Reduced motion:** `js/main.js` checks `prefers-reduced-motion` once
  (`reducedMotionGlobal`) and uses it to skip the splash animation, the 3D
  wave animation (renders one static frame instead), and the tilt-on-hover
  effect. Any new animation should respect this flag too.
- **Resend early-access forms:** product "Sign Up" buttons scroll to real forms
  in the dual CTA section. The forms post to `/api/early-access`, which sends
  founder notifications via Resend. Keep `RESEND_API_KEY` server-side only.
  Required env vars are documented in `.env.example`.
- **Founder contact links:** email and phone links remain direct `mailto:`/`tel:`
  links and should stay usable even if the form endpoint is unavailable.
- **Known placeholders to eventually replace:**
  - Founder avatar is initials ("MA") on a gradient, not a real photo
  - Email/phone in the footer and founder section are real values already
    provided by the founder — don't treat these as placeholders
  - Product mockups (`.p-visual` SVGs) are illustrative, not real app screenshots

## Running / previewing

For the full form flow:
```bash
npm run dev
```

Open the printed local URL. You can still open `index.html` directly for visual
checks, but form submissions require the local dev server or a live host with
the serverless endpoint.

## Git

This repo is initialized with an initial commit containing the full site as
handed off. Commit your AGENTS.md changes and any meaningful edits with normal
git commits so history stays useful.
