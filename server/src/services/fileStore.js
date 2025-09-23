import fs from 'fs'
import path from 'path'

const dataDir = path.resolve(process.cwd(), 'server', 'data')

function ensureDir() {
    try { fs.mkdirSync(dataDir, { recursive: true }) } catch { }
}

export function readJson(file) {
    try {
        ensureDir()
        const p = path.join(dataDir, file)
        if (!fs.existsSync(p)) return null
        const raw = fs.readFileSync(p, 'utf8')
        return JSON.parse(raw)
    } catch { return null }
}

export function writeJson(file, value) {
    ensureDir()
    const p = path.join(dataDir, file)
    fs.writeFileSync(p, JSON.stringify(value, null, 2))
}


