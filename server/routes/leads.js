import { Router } from 'express'
import Lead from '../models/Lead.js'
import { isMongoConnected } from '../config/db.js'
import { appendDevLead } from '../utils/devStore.js'
import { sendLeadNotification } from '../utils/mailer.js'

const router = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Small in-memory rate limit: max 8 POSTs / 10 min per IP
const hits = new Map()
function rateLimited(ip) {
  const now = Date.now()
  const windowMs = 10 * 60 * 1000
  const entry = hits.get(ip) || []
  const recent = entry.filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > 8
}

function clean(str, max = 500) {
  if (typeof str !== 'string') return ''
  return str.trim().slice(0, max)
}

function makeHandler(type) {
  return async (req, res) => {
    try {
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown'
      if (rateLimited(ip)) {
        return res.status(429).json({ ok: false, error: 'Too many submissions. Please try again in a few minutes.' })
      }

      // Honeypot: real users never fill this hidden field
      if (clean(req.body.website)) {
        return res.json({ ok: true })
      }

      const payload = {
        type,
        name: clean(req.body.name, 120),
        email: clean(req.body.email, 200).toLowerCase(),
        company: clean(req.body.company, 160),
        role: clean(req.body.role, 160),
        phone: clean(req.body.phone, 40),
        message: clean(req.body.message, 4000),
        preferredTime: clean(req.body.preferredTime, 200),
        linkedin: clean(req.body.linkedin, 300),
        source: clean(req.body.source, 200) || 'website'
      }

      if (!payload.name) {
        return res.status(400).json({ ok: false, error: 'Please tell us your name.' })
      }
      if (!EMAIL_RE.test(payload.email)) {
        return res.status(400).json({ ok: false, error: 'That email address does not look right.' })
      }

      let saved
      if (isMongoConnected()) {
        saved = (await Lead.create(payload)).toObject()
      } else {
        saved = await appendDevLead({ ...payload, createdAt: new Date().toISOString() })
      }

      // Production: fire-and-forget, the visitor must never wait on SMTP.
      // Development: wait briefly so the response can carry the Ethereal
      // preview link, which makes the whole flow checkable from the browser.
      if (process.env.NODE_ENV === 'production') {
        sendLeadNotification(payload).catch(() => {})
        return res.status(201).json({ ok: true, message: 'Received. We will get back to you shortly.' })
      }

      const mail = await Promise.race([
        sendLeadNotification(payload).catch(() => null),
        new Promise((resolve) => setTimeout(() => resolve(null), 8000))
      ])

      return res.status(201).json({
        ok: true,
        message: 'Received. We will get back to you shortly.',
        previewUrl: mail?.previewUrl || null
      })
    } catch (err) {
      console.error(`[leads] ${type} failed:`, err.message)
      return res.status(500).json({ ok: false, error: 'Something went wrong on our side. Please try again.' })
    }
  }
}

router.post('/contact', makeHandler('contact'))
router.post('/book-call', makeHandler('book-call'))
router.post('/work-with-us', makeHandler('work-with-us'))

export default router
