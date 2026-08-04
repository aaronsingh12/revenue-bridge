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
    const mail = await describeMailer()
    console.log(`[mail] Provider: ${mail.mode}`)
    console.log(`[mail] Destination: ${mail.to || '(CONTACT_EMAIL not set)'}`)
  })
})
