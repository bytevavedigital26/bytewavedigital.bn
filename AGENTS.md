# AGENTS.md

Context file for AI coding agents (OpenCode, Claude Code, etc.) working in this repo.

## What this is

A static marketing landing page for **ByteWave Digital Enterprise**, a Brunei-based
startup with two products: **SideQuest.BN** (gig-work app) and **SideQuest Tourism**
(tourism/discovery app). No backend, no build step — plain HTML/CSS/JS.

## Stack

- Plain HTML5, CSS3 (custom properties, no framework), vanilla JS (no framework)
- [Three.js](https://threejs.org) r128, loaded from cdnjs, for the 3D hero animation
- Google Fonts: Space Grotesk (display), Inter (body), IBM Plex Mono (labels/eyebrows)
- No package.json, no bundler. Open `index.html` directly, or serve the folder with
  any static server (e.g. `npx serve .`) if you need clean relative-path behavior.

## File structure

```
index.html        All markup, in section order (nav → hero → about → founder →
                   SideQuest.BN → SideQuest Tourism → problem/solution →
                   how-it-works → dual CTA → footer)
css/style.css      All styles. Design tokens are CSS custom properties at the
                   top of the file (:root) — start here for any color/type change.
js/main.js         All behavior: splash screen, sticky nav + mobile menu, scroll
                   progress bar ("the current"), scroll-reveal animations,
                   how-it-works tab toggle, 3D hero scene (Three.js), 3D tilt
                   on hover for the founder card and product mockups.
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
- **Mailto CTAs:** both product "Sign Up" buttons are `mailto:` links to
  `Aziq.bytewavedigital@gmail.com` with a pre-filled subject line — there is no
  real form/backend yet. If asked to wire up an actual signup form, that's new
  functionality, not a bug fix.
- **Known placeholders to eventually replace:**
  - Founder avatar is initials ("MA") on a gradient, not a real photo
  - Email/phone in the footer and founder section are real values already
    provided by the founder — don't treat these as placeholders
  - Product mockups (`.p-visual` SVGs) are illustrative, not real app screenshots

## Running / previewing

No install needed. Either:
```bash
open index.html          # macOS, quick preview
# or
npx serve .               # local server at http://localhost:3000
```

## Git

This repo is initialized with an initial commit containing the full site as
handed off. Commit your AGENTS.md changes and any meaningful edits with normal
git commits so history stays useful.
