import { Router } from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const router = Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONTENT_FILE = path.join(__dirname, '..', 'data', 'content.json')

let cache = null
async function loadContent() {
  if (cache) return cache
  const raw = await fs.readFile(CONTENT_FILE, 'utf8')
  cache = JSON.parse(raw)
  return cache
}

router.get('/content', async (_req, res) => {
  try {
    const content = await loadContent()
    res.json({ ok: true, content })
  } catch (err) {
    console.error('[content] load failed:', err.message)
    res.status(500).json({ ok: false, error: 'Content unavailable.' })
  }
})

export default router
