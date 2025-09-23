import fs from 'fs'
import path from 'path'

const dataDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../data')
const file = path.join(dataDir, 'verification.json')

function ensure() {
  try { if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true }) } catch {}
  try { if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}), 'utf-8') } catch {}
}

export function readAll() {
  ensure()
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')) } catch { return {} }
}

export function writeFor(batchId, entry) {
  ensure()
  const all = readAll()
  all[String(batchId)] = entry
  fs.writeFileSync(file, JSON.stringify(all, null, 2), 'utf-8')
}
