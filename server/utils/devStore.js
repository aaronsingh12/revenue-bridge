import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FILE = path.join(__dirname, '..', 'data', 'leads.dev.json')

export async function appendDevLead(lead) {
  let all = []
  try {
    all = JSON.parse(await fs.readFile(FILE, 'utf8'))
  } catch {
    all = []
  }
  all.push(lead)
  await fs.writeFile(FILE, JSON.stringify(all, null, 2))
  return lead
}
