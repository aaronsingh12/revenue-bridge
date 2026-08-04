import 'dotenv/config'
import { sendLeadNotification, describeMailer } from '../utils/mailer.js'

const info = await describeMailer()

console.log('\n--- Revenue Bridge · Resend mail check ---')
console.log(`  Destination (CONTACT_EMAIL): ${info.to || 'NOT SET — edit server/.env'}`)
console.log(`  Provider: ${info.mode}`)

if (!info.to) {
  console.error('CONTACT_EMAIL is missing. Set it and run this again.')
  process.exit(1)
}

const result = await sendLeadNotification({
  type: 'contact',
  name: 'Mail Path Test',
  email: 'test-sender@example.com',
  company: 'Revenue Bridge (self-test)',
  phone: '+00 000 000 0000',
  message: 'If you are reading this, the contact pipeline works end to end.',
  source: 'npm run mail:test'
})

if (!result.ok) {
  console.error('\nMail path failed:', result.error || result.mode)
  process.exit(1)
}

if (String(result.mode).startsWith('console')) {
  console.log('\nMail path ran in local console mode. Add RESEND_API_KEY to send a real message.')
} else {
  console.log(`\nMail path accepted by Resend. Check ${info.to} and the Resend Emails dashboard.`)
}
