# ByteWave Digital Enterprise — Landing Page

Marketing landing page for ByteWave Digital Enterprise and its two products,
**SideQuest.BN** and **SideQuest Tourism**.

## Open it

Just double-click `index.html`, or drag it into a browser. No build step, no
install required.

If you want a local server instead (recommended once you start editing, so
relative paths behave exactly like they will on a real host):

```bash
npx serve .
```

## Edit it with OpenCode

This project is set up so an AI coding agent (like [OpenCode](https://opencode.ai))
can work in it directly:

```bash
cd bytewave-landing
opencode
```

OpenCode will pick up `AGENTS.md` in this folder automatically — it explains the
file structure, the color/type system, and the branding rules (e.g. always
"ByteWave Digital Enterprise" / "ByteWave Digital," never just "ByteWave") so the
agent doesn't have to guess. Just describe what you want changed, e.g.:

> "Replace the founder avatar initials with a real photo at assets/founder.jpg"

> "Add a testimonials section between How It Works and the sign-up CTA"

> "Wire the sign-up buttons to a real form instead of mailto links"

## Project structure

```
index.html      Page markup
css/style.css   All styling + design tokens (colors, fonts) at the top
js/main.js      Splash screen, nav, scroll effects, 3D hero animation, tilt effects
assets/         Empty — drop a real founder photo / favicon / screenshots here
AGENTS.md       Context file for AI coding agents (OpenCode, Claude Code, etc.)
```

## Before this goes live, still needs

- [ ] Real founder photo (currently initials on a gradient circle)
- [ ] A real sign-up form/backend if you want submissions captured somewhere
      other than email (currently both "Sign Up" buttons open a pre-filled email)
- [ ] A favicon
- [ ] Hosting — this is a static site, so any static host works (Netlify,
      Vercel, GitHub Pages, or your own server)

## Credits / stack

Vanilla HTML/CSS/JS. 3D hero animation built with [Three.js](https://threejs.org)
r128 (loaded via CDN). Fonts: Space Grotesk, Inter, IBM Plex Mono (Google Fonts).
