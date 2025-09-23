// Simple in-memory moderation queue; replace with DB later
import { readJson, writeJson } from './fileStore.js'
const FILE = 'verifier-queue.json'
let queue = readJson(FILE) || []

export function addToQueue(record) {
    const item = { id: `VERI-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, status: 'pending', createdAt: new Date().toISOString(), ...record }
    queue.push(item)
    writeJson(FILE, queue)
    return item
}

export function listQueue(filter = {}) {
    const { status } = filter
    return queue.filter(q => !status || q.status === status)
}

export function getItem(id) {
    return queue.find(q => q.id === id)
}

export function setDecision(id, decision, notes) {
    const item = getItem(id)
    if (!item) return null
    item.status = decision // 'approved' | 'rejected' | 'pending'
    item.notes = notes || item.notes
    item.decidedAt = new Date().toISOString()
    writeJson(FILE, queue)
    return item
}


