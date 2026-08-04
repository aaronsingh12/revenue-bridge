import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import leadsRouter from './routes/leads.js'
import contentRouter from './routes/content.js'
import { describeMailer } from './utils/mailer.js'

const app = express()
const PORT = process.env.PORT || 5000

app.set('trust proxy', 1)
app.use(cors())
app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'revenue-bridge', time: new Date().toISOString() }))
app.use('/api', contentRouter)
app.use('/api', leadsRouter)

app.use('/api', (_req, res) => res.status(404).json({ ok: false, error: 'Not found' }))

connectDB().finally(() => {
  app.listen(PORT, async () => {
    console.log(`[server] Revenue Bridge API running on http://localhost:${PORT}`)
    // State the delivery mode up front so nobody has to guess where leads go.
    const mail = await describeMailer()
    console.log(`[mail] Delivering form submissions to: ${mail.to || '(CONTACT_EMAIL not set in server/.env)'}`)
    console.log(`[mail] Transport: ${mail.mode}`)
    if (String(mail.mode).startsWith('ethereal')) {
      console.log('[mail] Demo mode — each submission prints a preview link here. Add SMTP_* in server/.env for real delivery.')
    }
  })
})
