import nodemailer from 'nodemailer'
import { lookup } from 'node:dns/promises'

/* ============================================================================
 *  ►►►  WHERE FORM SUBMISSIONS GET DELIVERED  ◄◄◄
 *
 *  The recipient address is NEVER hardcoded in this file. It is read from
 *  CONTACT_EMAIL in:
 *
 *        server/.env          <-- THIS IS THE FILE YOU EDIT
 *
 *  Right now it is set to the demo inbox (jasmine@revenuebridge.co.in).
 *  TO GO LIVE: open server/.env, change CONTACT_EMAIL to the real business
 *  inbox, and restart the server. No code changes are needed anywhere.
 *
 *  Delivery mode is picked automatically, in this order:
 *    1. SMTP_HOST + SMTP_USER + SMTP_PASS  → real SMTP server        (production)
 *    2. SMTP_SERVICE + SMTP_USER + SMTP_PASS → Gmail/Outlook/etc.    (production)
 *    3. nothing configured                → Ethereal capture inbox   (dev/demo)
 *       Mail is really sent, to a throwaway inbox, and the server logs a
 *       "preview URL" you can open in the browser to read the message.
 *    4. MAIL_TRANSPORT=console            → log the message, send nothing
 * ==========================================================================*/

const LABELS = {
  contact: 'Contact form',
  'book-call': 'Book a call',
  'work-with-us': 'Work with us'
}

const FIELD_LABELS = {
  type: 'Form',
  name: 'Name',
  email: 'Email',
  company: 'Company',
  role: 'Role',
  phone: 'Phone',
  preferredTime: 'Preferred time',
  linkedin: 'LinkedIn / portfolio',
  message: 'Message',
  source: 'Source'
}
const FIELD_ORDER = Object.keys(FIELD_LABELS)

let transportPromise = null
let mode = 'unconfigured'
let transportConfig = null

const DEFAULT_CONNECTION_TIMEOUT = 15_000
const DEFAULT_GREETING_TIMEOUT = 15_000
const DEFAULT_SOCKET_TIMEOUT = 30_000

function numberFromEnv(name, fallback) {
  const value = Number(process.env[name])
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function smtpConfig() {
  const port = numberFromEnv('SMTP_PORT', 587)
  const tlsMode = String(process.env.SMTP_TLS_MODE || (port === 465 ? 'ssl' : 'starttls')).toLowerCase()
  // Preserve Node's normal address selection unless the deployment explicitly
  // requires IPv4 or IPv6. Render users can set SMTP_FAMILY=4 after the DNS
  // diagnostic shows dual-stack resolution.
  const family = Number(process.env.SMTP_FAMILY || 0)

  if (!['ssl', 'starttls'].includes(tlsMode)) {
    throw new Error('SMTP_TLS_MODE must be "ssl" (port 465) or "starttls" (port 587).')
  }
  if (![0, 4, 6].includes(family)) {
    throw new Error('SMTP_FAMILY must be 0, 4, or 6.')
  }

  return {
    host: process.env.SMTP_HOST,
    port,
    secure: tlsMode === 'ssl',
    requireTLS: tlsMode === 'starttls',
    family,
    connectionTimeout: numberFromEnv('SMTP_CONNECTION_TIMEOUT', DEFAULT_CONNECTION_TIMEOUT),
    greetingTimeout: numberFromEnv('SMTP_GREETING_TIMEOUT', DEFAULT_GREETING_TIMEOUT),
    socketTimeout: numberFromEnv('SMTP_SOCKET_TIMEOUT', DEFAULT_SOCKET_TIMEOUT),
    // Do not disable certificate validation in production. If this fails, fix
    // the hostname/certificate chain instead of setting it to false.
    tls: { servername: process.env.SMTP_HOST, rejectUnauthorized: true }
  }
}

function smtpLogger(info) {
  const prefix = `[mail][smtp][${info.level || 'debug'}]`
  // Nodemailer never needs credentials in application logs; its logger object
  // contains only protocol metadata and the message.
  console.log(`${prefix} ${info.src || 'nodemailer'}: ${info.msg}`)
}

function logMailError(context, err) {
  console.error(`[mail] ${context}: ${err.message}`)
  console.error('[mail] Error details:', {
    name: err.name,
    code: err.code,
    command: err.command,
    response: err.response,
    responseCode: err.responseCode,
    errno: err.errno,
    syscall: err.syscall,
    address: err.address,
    port: err.port,
    stack: err.stack
  })
}

async function logDnsResolution(host, family) {
  try {
    const addresses = await lookup(host, { all: true, verbatim: true, family })
    console.log(`[mail] DNS ${host} (family=${family || 'auto'}): ${addresses.map((entry) => `${entry.address}/IPv${entry.family}`).join(', ')}`)
  } catch (err) {
    logMailError(`DNS lookup failed for ${host}`, err)
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function resolveTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SERVICE, MAIL_TRANSPORT } = process.env

  if (MAIL_TRANSPORT === 'console') {
    mode = 'console'
    return null
  }

  if (SMTP_USER && SMTP_PASS && (SMTP_HOST || SMTP_SERVICE)) {
    mode = SMTP_HOST ? `smtp (${SMTP_HOST})` : `service (${SMTP_SERVICE})`
    const base = SMTP_HOST ? smtpConfig() : { service: SMTP_SERVICE }
    transportConfig = base
    if (SMTP_HOST) {
      await logDnsResolution(base.host, base.family)
      console.log('[mail] SMTP configuration:', {
        host: base.host,
        port: base.port,
        tlsMode: base.secure ? 'ssl' : 'starttls',
        family: base.family || 'auto',
        connectionTimeout: base.connectionTimeout,
        greetingTimeout: base.greetingTimeout,
        socketTimeout: base.socketTimeout,
        smtpUserConfigured: Boolean(SMTP_USER),
        smtpPasswordConfigured: Boolean(SMTP_PASS),
        mailFromConfigured: Boolean(process.env.MAIL_FROM),
        contactEmailConfigured: Boolean(process.env.CONTACT_EMAIL)
      })
    }
    return nodemailer.createTransport({
      ...base,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      debug: true,
      logger: { debug: smtpLogger, info: smtpLogger, warn: smtpLogger, error: smtpLogger }
    })
  }

  // No credentials: spin up a throwaway Ethereal inbox so mail can still be
  // *sent and read* during development. Nothing reaches a real person.
  try {
    const account = await nodemailer.createTestAccount()
    mode = 'ethereal (capture inbox — preview links in this console)'
    return nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass }
    })
  } catch (err) {
    mode = 'console (Ethereal unreachable: ' + err.message + ')'
    return null
  }
}

function getTransport() {
  if (!transportPromise) transportPromise = resolveTransport()
  return transportPromise
}

function renderText(lead) {
  return FIELD_ORDER.filter((k) => lead[k])
    .map((k) => `${FIELD_LABELS[k]}: ${lead[k]}`)
    .join('\n')
}

function renderHtml(lead) {
  const rows = FIELD_ORDER.filter((k) => lead[k])
    .map(
      (k) => `<tr>
        <td style="padding:10px 16px;border-bottom:1px solid #e3dccc;font:600 11px/1.4 ui-monospace,Menlo,monospace;letter-spacing:.12em;text-transform:uppercase;color:#6b6255;white-space:nowrap;vertical-align:top">${FIELD_LABELS[k]}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e3dccc;font:400 14px/1.6 Arial,Helvetica,sans-serif;color:#171d22">${escapeHtml(lead[k]).replace(/\n/g, '<br>')}</td>
      </tr>`
    )
    .join('')

  return `<!doctype html><html><body style="margin:0;background:#ece6d9;padding:24px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #b4883b">
    <tr><td style="background:#10171d;padding:20px 16px">
      <div style="font:800 18px/1 Arial,Helvetica,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#ece6d9">
        <span style="display:inline-block;width:9px;height:9px;background:#b4883b;margin-right:8px"></span>Revenue Bridge
      </div>
      <div style="margin-top:8px;font:400 11px/1.4 ui-monospace,Menlo,monospace;letter-spacing:.16em;text-transform:uppercase;color:#b4883b">
        ${escapeHtml(LABELS[lead.type] || 'New lead')} — new submission
      </div>
    </td></tr>
    <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr>
    <tr><td style="padding:16px;background:#f7f3ea;font:400 12px/1.6 Arial,Helvetica,sans-serif;color:#6b6255">
      Reply directly to this email to reach ${escapeHtml(lead.name || 'the sender')}${lead.email ? ` at ${escapeHtml(lead.email)}` : ''}.
    </td></tr>
  </table></body></html>`
}

/**
 * Sends the notification. Never throws — a mail failure must not lose a lead.
 * Returns { ok, mode, previewUrl }.
 */
export async function sendLeadNotification(lead) {
  const to = process.env.CONTACT_EMAIL
  const subject = `[Revenue Bridge] ${LABELS[lead.type] || 'New lead'} — ${lead.name}${lead.company ? ` (${lead.company})` : ''}`

  if (!to) {
    console.warn('[mail] CONTACT_EMAIL is not set in server/.env — notification skipped.')
    return { ok: false, mode: 'unconfigured' }
  }

  const transport = await getTransport()
  const text = renderText(lead)

  if (!transport) {
    console.log(`[mail] ${mode} — would deliver to ${to}\n  ${subject}\n${text.replace(/^/gm, '  ')}`)
    return { ok: true, mode }
  }

  try {
    const from = process.env.MAIL_FROM || `Revenue Bridge <${process.env.SMTP_USER || 'no-reply@revenuebridge.local'}>`
    const info = await transport.sendMail({
      from,
      to,
      replyTo: lead.email ? { name: lead.name, address: lead.email } : undefined,
      subject,
      text,
      html: renderHtml(lead)
    })
    const previewUrl = nodemailer.getTestMessageUrl(info) || null
    console.log(`[mail] Sent to ${to} via ${mode}`)
    if (previewUrl) console.log(`[mail] ► Read it here: ${previewUrl}`)
    return { ok: true, mode, previewUrl }
  } catch (err) {
    logMailError('Send failed', err)
    console.error(`[mail] Lead was still saved. Payload:\n${text.replace(/^/gm, '  ')}`)
    return { ok: false, mode, error: err.message }
  }
}

/** Warms the transport at boot so the console states the delivery mode up front. */
export async function describeMailer() {
  await getTransport()
  return { mode, to: process.env.CONTACT_EMAIL || null, config: transportConfig }
}

/**
 * Opens an SMTP connection and completes TLS + authentication without sending
 * a message. It makes failures visible at deploy time while leaving the HTTP
 * service and lead-saving flow available if the mail provider is unavailable.
 */
export async function verifyMailer() {
  const transport = await getTransport()
  if (!transport) return { ok: true, skipped: true, mode }

  try {
    await transport.verify()
    console.log(`[mail] SMTP verify succeeded via ${mode}. DNS, TCP, TLS, greeting, and authentication completed.`)
    return { ok: true, mode }
  } catch (err) {
    logMailError('SMTP verify failed', err)
    return { ok: false, mode, error: err.message, code: err.code, command: err.command }
  }
}

export function mailerMode() {
  return mode
}
