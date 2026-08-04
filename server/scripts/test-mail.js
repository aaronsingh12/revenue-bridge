import 'dotenv/config'
import { sendLeadNotification, describeMailer } from '../utils/mailer.js'

/**
 * Verifies the whole mail path without touching the website.
 *
 *   npm run mail:test --prefix server
 *
 * Prints the resolved recipient (CONTACT_EMAIL from server/.env), the transport
 * that was chosen, and — in demo mode — a link to read the delivered message.
 */

const info = await describeMailer()

console.log('\n─── Revenue Bridge · mail check ─────────────────────────────')
console.log(`  Recipient (CONTACT_EMAIL) : ${info.to || 'NOT SET — edit server/.env'}`)
console.log(`  Transport                 : ${info.mode}`)
console.log('─────────────────────────────────────────────────────────────\n')

if (!info.to) {
  console.error('CONTACT_EMAIL is missing. Open server/.env and set it, then run this again.')
  process.exit(1)
}

const result = await sendLeadNotification({
  type: 'contact',
  name: 'Mail Path Test',
  email: 'test-sender@example.com',
  company: 'Revenue Bridge (self-test)',
  phone: '+00 000 000 0000',
  message:
    'If you are reading this, the contact pipeline works end to end: form → API → validation → storage → email.',
  source: 'npm run mail:test'
})

if (result.ok) {
  console.log('\n✔ Mail path OK.')
  if (result.previewUrl) {
    console.log(`  Open this to read the message: ${result.previewUrl}`)
    console.log('  (Demo transport — nothing reached a real inbox. Add SMTP_* in server/.env for real delivery.)')
  } else {
    console.log(`  Delivered to ${info.to}. Check that inbox (and its spam folder).`)
  }
} else {
  console.error('\n✖ Mail path failed:', result.error || result.mode)
  process.exit(1)
}
