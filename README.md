# Revenue Bridge — B2B Pipeline Engineering

Full-stack site: **React 18 + Vite + React Router** frontend, **Node/Express + MongoDB (Mongoose)** backend.
Structurally modeled on the belkins.io conversion flow (hero → pain points → process → solutions → proof → FAQ → CTA),
with an original Revenue Bridge identity: drafting-sheet layout, ink + vellum + brass palette, and a scroll-driven
suspension-bridge diagram for the seven-stage journey.

## Quick start

```bash
npm install            # root tooling (concurrently)
npm run install:all    # installs server + client deps
npm run dev            # API on :5000, site on :5173 (proxied /api)
npm run mail:test      # optional: verify the mail path without opening the site
```

Works out of the box with **no database and no SMTP**: leads fall back to `server/data/leads.dev.json`,
and email is delivered to a throwaway capture inbox whose preview link is printed in the console
(and shown in the form's success state). `server/.env` ships ready to run.

## ✉ Email — where leads land, and the one file to change

**The file you edit is [`server/.env`](server/.env), the line `CONTACT_EMAIL=`.**
Change it, restart the server, done — the address is never hardcoded anywhere in the source.

```
CONTACT_EMAIL=jasmine@revenuebridge.co.in  # ← demo. Replace at launch.
```

Two things are deliberately separate:

| What | Set in | Currently |
| --- | --- | --- |
| Where submissions are **delivered** | `CONTACT_EMAIL` in `server/.env` | the demo address |
| The address **displayed** on the site (Contact page + footer) | `contact.email` in `server/data/content.json`, mirrored in `client/src/lib/fallbackContent.json` | the demo address |

### Checking it right now (no credentials needed)

With the `SMTP_*` values empty, the server opens an [Ethereal](https://ethereal.email) capture inbox at
boot. Every submission is really sent, and you get a link to read it:

- in the server console: `[mail] ► Read it here: https://ethereal.email/message/…`
- on the page itself, under the form's "Received." confirmation
- or without touching the site at all: `npm run mail:test`

Nothing reaches a real person in this mode, so test as much as you like.

### Switching on real delivery

Fill these in `server/.env` and restart — Gmail needs a 16-character
**App Password** (Google Account → Security → 2-Step Verification → App passwords), not your login password:

```
SMTP_SERVICE=gmail
SMTP_USER=yourname@gmail.com
SMTP_PASS=abcdefghijklmnop
```

Any other provider works via `SMTP_HOST` / `SMTP_PORT` instead of `SMTP_SERVICE`. On boot the server
prints the recipient and the transport it chose, so there is never any doubt about where mail is going.
Notifications carry the sender in `Reply-To`, so replying from the inbox reaches the lead directly.

## Environment (server/.env)

| Var | Purpose |
| --- | --- |
| `CONTACT_EMAIL` | **Where every form notification is sent.** Configurable only here — never hardcoded. |
| `MONGO_URI` | MongoDB connection. Required in production; empty falls back to a JSON file with a warning. |
| `SMTP_SERVICE` | Provider shortcut (`gmail`, `outlook`, …). Use instead of `SMTP_HOST`. |
| `SMTP_HOST/PORT/USER/PASS` | Explicit SMTP server. If all are empty, the Ethereal capture inbox is used. |
| `MAIL_FROM` | Envelope "From". Most providers require it to match `SMTP_USER`. |
| `MAIL_TRANSPORT` | Set to `console` to log submissions and send nothing. |

## API

- `GET  /api/health` — liveness
- `GET  /api/content` — all site copy (stages, solutions, challenges, FAQs, placeholders) from `server/data/content.json`
- `POST /api/contact` · `POST /api/book-call` · `POST /api/work-with-us` — validated, rate-limited (8/10min/IP),
  honeypot-protected; persists to Mongo (or dev file) and notifies `CONTACT_EMAIL`

The frontend fetches `/api/content` at load (bundled fallback in `client/src/lib/fallbackContent.json` if the API
is down). Edit `server/data/content.json` to change site copy without touching components.

## Pages & structure

Home (hero, marquee, challenges, **seven-stage bridge**, solutions, differentiators, proof placeholders, Facto teaser,
FAQ, CTA) · /solutions · /facto-technology (modular, content drops in later) · /about · /work-with-us · /contact.
"Book a call" opens a global modal from any page.

## The seven-stage bridge (`client/src/components/BridgeDiagram.jsx`)

The section heading scrolls normally; `.bridge-track` is the scroll runway and `.bridge-sticky` pins one
screenful inside it. The pinned pane is a three-row grid — stage panel / drawing / progress — where the
drawing row is `minmax(0, 1fr)`, so the SVG shrinks into whatever height is left instead of overflowing
and being clipped. The `viewBox` is cropped tight to the artwork (3.5:1), which keeps the span and its
labels full-size even in a short browser window. Hanger positions are sampled from the real cable path
with `getPointAtLength` rather than hardcoded, so they always land on the curve.

## Animation layer (dependency-free)

Preloader, magnetic CTAs, scroll-progress hairline in the nav, staggered hero entrance (eyebrow → headline
→ sub → CTAs → scroll hint) with a rotating word and a parallax drafting-grid backdrop, infinite masked
marquee, IntersectionObserver scroll reveals, section rules that draw themselves in, 3D tilt cards,
**scroll-linked SVG bridge that draws itself** — deck, cable, rising hangers, sonar-pulsing live node,
travelling load and a percent-crossed readout (narrow/short screens fall back to an animated timeline) —
FAQ accordion, form loading/success states with a drawn check, page transitions, footer hover word. All
effects respect `prefers-reduced-motion`, and hover/tilt effects are neutralised on touch pointers. No
animation libraries — GSAP/Framer/R3F can be layered on later without conflicts.

## Responsive behaviour

Fluid `clamp()` type and spacing throughout, with a shared `--gutter` and safe-area insets for notched
phones. Breakpoints: nav collapses to a burger + full-screen drawer at **1080px**; the SVG bridge switches
to a vertical timeline below **900px wide or 560px tall** (it needs both axes to stay legible); grids step
3→2→1 columns at 1020/860/640px; extra tiers at **400px** for small phones, a **landscape** tier for
phones held sideways, and wider containers above **1600px** and **1920px**. Form field pairs use auto-fit
so they stack on their own. On touch pointers inputs render at 16px (prevents iOS focus-zoom) and tap
targets are ≥44px. Verified in headless Chrome with **zero horizontal overflow** on every route at
320×568, 390×844, 768×1024, 844×390 (landscape), 1024×600, 1280×720, 1366×635, 1440×900, 1920×1080 and
2560×1440 — and with the bridge drawing measured to fit inside its pin at every desktop size.

## Ground rules encoded in the build

No invented statistics, client logos, awards, or testimonials — the proof section renders clearly labeled
placeholder frames until real, verifiable results exist. Swap them by editing `proofPlaceholders` in
`server/data/content.json`.
