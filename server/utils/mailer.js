import { Resend } from 'resend'

const LABELS = {
  contact: 'Contact form',
  'book-call': 'Book a call',
  'work-with-us': 'Work with us'
}

const FIELD_LABELS = {
  type: 'Form', name: 'Name', email: 'Email', company: 'Company', role: 'Role', phone: 'Phone',
  preferredTime: 'Preferred time', linkedin: 'LinkedIn / portfolio', message: 'Message', source: 'Source'
}
const FIELD_ORDER = Object.keys(FIELD_LABELS)

let client = null
let mode = 'unconfigured'

function logMailError(context, err) {
  console.error(`[mail] ${context}: ${err.message}`)
  console.error('[mail] Error details:', {
    name: err.name, code: err.code, statusCode: err.statusCode, type: err.type, stack: err.stack
  })
}

function getClient() {
  if (client) return client
  if (!process.env.RESEND_API_KEY) {
    // Keeps forms and lead storage usable locally without external credentials.
    mode = 'console (RESEND_API_KEY not set)'
    return null
  }
  mode = 'Resend'
  client = new Resend(process.env.RESEND_API_KEY)
  return client
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function renderText(lead) {
  return FIELD_ORDER.filter((k) => lead[k]).map((k) => `${FIELD_LABELS[k]}: ${lead[k]}`).join('\n')
}

// This provider-neutral template is unchanged from the Nodemailer version.
function renderHtml(lead) {
  const rows = FIELD_ORDER.filter((k) => lead[k]).map((k) => `<tr>
        <td style="padding:10px 16px;border-bottom:1px solid #e3dccc;font:600 11px/1.4 ui-monospace,Menlo,monospace;letter-spacing:.12em;text-transform:uppercase;color:#6b6255;white-space:nowrap;vertical-align:top">${FIELD_LABELS[k]}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e3dccc;font:400 14px/1.6 Arial,Helvetica,sans-serif;color:#171d22">${escapeHtml(lead[k]).replace(/\n/g, '<br>')}</td>
      </tr>`).join('')

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

/** Sends a notification without allowing email failure to lose a lead. */
export async function sendLeadNotification(lead) {
  const to = process.env.CONTACT_EMAIL
  const subject = `[Revenue Bridge] ${LABELS[lead.type] || 'New lead'} — ${lead.name}${lead.company ? ` (${lead.company})` : ''}`
  if (!to) {
    console.warn('[mail] CONTACT_EMAIL is not set — notification skipped.')
    return { ok: false, mode: 'unconfigured' }
  }

  const resend = getClient()
  const text = renderText(lead)
  if (!resend) {
    console.log(`[mail] ${mode} — would deliver to ${to}\n  ${subject}\n${text.replace(/^/gm, '  ')}`)
    return { ok: true, mode, previewUrl: null }
  }

  try {
    const from = process.env.MAIL_FROM || 'Revenue Bridge <onboarding@resend.dev>'
    const { data, error } = await resend.emails.send({
      from, to, replyTo: lead.email || undefined, subject, text, html: renderHtml(lead)
    })
    if (error) throw Object.assign(new Error(error.message || 'Resend rejected the email.'), error)

    console.log(`[mail] Sent to ${to} via Resend (id: ${data?.id || 'unknown'})`)
    return { ok: true, mode, previewUrl: null }
  } catch (err) {
    logMailError('Resend send failed', err)
    console.error(`[mail] Lead was still saved. Payload:\n${text.replace(/^/gm, '  ')}`)
    return { ok: false, mode, error: err.message }
  }
}

export async function describeMailer() {
  getClient()
  return { mode, to: process.env.CONTACT_EMAIL || null }
}

export function mailerMode() {
  return mode
}
