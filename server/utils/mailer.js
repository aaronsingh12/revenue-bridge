const LABELS = {
  contact: 'Contact form',
  'book-call': 'Book a call',
  'work-with-us': 'Work with us'
}

let mode = 'EmailJS (client-side)'

export async function sendLeadNotification(lead) {
  const to = process.env.CONTACT_EMAIL
  const subject = `[Revenue Bridge] ${LABELS[lead.type] || 'New lead'} — ${lead.name}${lead.company ? ` (${lead.company})` : ''}`

  if (!to) {
    console.warn('[mail] CONTACT_EMAIL is not set — notification skipped.')
    return { ok: false, mode: 'unconfigured' }
  }

  console.log(`[mail] Email delivery is handled client-side via EmailJS. To: ${to.split(',').join(', ')} | Subject: ${subject}`)
  return { ok: true, mode, previewUrl: null }
}

export async function describeMailer() {
  return { mode, to: process.env.CONTACT_EMAIL || null }
}

export function mailerMode() {
  return mode
}
