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
CONTACT_EMAIL=jasmine@revenuebridge.co.in,harneet.singh@revenuebridge.co.in  # demo. Replace at launch.
```

Two things are deliberately separate:

| What | Set in | Currently |
| --- | --- | --- |
| Where submissions are **delivered** | `CONTACT_EMAIL` in `server/.env` | the two demo addresses |
| The addresses **displayed** on the site (Contact page + footer) | `contact.email` in `server/data/content.json`, mirrored in `client/src/lib/fallbackContent.json` | the two demo addresses |

### Checking it right now (no credentials needed)

With the `SMTP_*` values empty, the server opens an [Ethereal](https://ethereal.email) capture inbox at
boot. Every submission is really sent, and you get a link to read it:

- in the server console: `[mail] ► Read it here: https://ethereal.email/message/…`
- on the page itself, under the form's "Received." confirmation
- or without touching the site at all: `npm run mail:test`

Nothing reaches a real person in this mode, so test as much as you like.

### Legacy SMTP instructions (removed)

> This SMTP configuration is no longer used by the application. Use the Resend
> configuration below; the legacy notes will be removed in a documentation-only cleanup.

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

### Zoho Mail on Render

Use the exact SMTP host supplied by the Zoho data centre for the account. For this account, the existing
`smtp.zoho.in` host should be retained because it already works locally. Zoho's standard alternative is
`smtp.zoho.com`; do not swap hosts unless Zoho's account settings identify that host for the account.

For STARTTLS (the normal choice):

```dotenv
SMTP_HOST=smtp.zoho.in
SMTP_PORT=587
SMTP_TLS_MODE=starttls
SMTP_CONNECTION_TIMEOUT=15000
SMTP_GREETING_TIMEOUT=15000
SMTP_SOCKET_TIMEOUT=30000
SMTP_USER=your-full-zoho-address
SMTP_PASS=your-zoho-app-password
MAIL_FROM="Revenue Bridge <your-full-zoho-address>"
```

For implicit TLS instead, use `SMTP_PORT=465` and `SMTP_TLS_MODE=ssl`. Use one mode at a time; this
is a deliberate configuration choice, not an automatic retry. The startup `SMTP verify` log tests DNS,
TCP, TLS and authentication without sending a lead email. It never prints passwords. Leave
`SMTP_FAMILY` unset initially; set `SMTP_FAMILY=4` only if the startup DNS log shows dual-stack records
and the Render-specific connection failure implicates IPv6.

Render free web services block outbound SMTP traffic on ports 25, 465 and 587. If the service is free,
the only SMTP-side fix is moving it to a paid instance; switching between 465 and 587 cannot bypass that
restriction. For a provider-agnostic production route, use an email HTTP API (Resend, Brevo, SendGrid,
or Zoho ZeptoMail) rather than raw SMTP.

### Production email with Resend

1. Create a [Resend](https://resend.com) account, open **API Keys**, create a sending key, and copy it once.
2. Add that value to Render as `RESEND_API_KEY`.
3. Initially set `MAIL_FROM="Revenue Bridge <onboarding@resend.dev>"`. This temporary sender can deliver
   only to the email address associated with the Resend account.
4. In Resend, open **Domains**, add `revenuebridge.co.in`, and copy its SPF and DKIM records exactly.
5. In GoDaddy, open **My Products → Domains → revenuebridge.co.in → DNS → Add**. Add each record Resend
   lists (same type, host/name, and value). Do not change Zoho's existing MX records.
6. When Resend marks the domain verified, change Render to
   `MAIL_FROM="Revenue Bridge <hello@revenuebridge.co.in>"` and redeploy.

Resend sends over HTTPS, so it avoids Render's blocked SMTP ports. The existing Reply-To continues to point
to the lead's submitted address.

## Environment (server/.env)

| Var | Purpose |
| --- | --- |
| `CONTACT_EMAIL` | **Where every form notification is sent.** Configurable only here — never hardcoded. |
| `MONGO_URI` | MongoDB connection. Required in production; empty falls back to a JSON file with a warning. |
| `RESEND_API_KEY` | Resend API key. Required for email delivery. |
| `MAIL_FROM` | Verified Resend sender, e.g. `Revenue Bridge <hello@revenuebridge.co.in>`. |

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
