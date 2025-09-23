import express from 'express'
import { addToQueue, listQueue, setDecision } from '../services/moderationStore.js'

const router = express.Router()

// Submit an item for verification (from verification center or system)
router.post('/queue', async (req, res) => {
    try {
        const { batchId, farmerAadhaar, summary } = req.body || {}
        const item = addToQueue({ batchId, farmerAadhaar, summary })
        res.json({ success: true, item })
    } catch (e) {
        res.status(500).json({ success: false, message: 'queue_failed', error: e?.message || String(e) })
    }
})

// List queue
router.get('/queue', async (req, res) => {
    try {
        const items = listQueue({ status: req.query?.status })
        res.json({ success: true, items })
    } catch (e) {
        res.status(500).json({ success: false, message: 'list_failed', error: e?.message || String(e) })
    }
})

// Decide
router.post('/queue/:id/decide', async (req, res) => {
    try {
        const { id } = req.params
        const { decision, notes } = req.body || {}
        if (!['approved', 'rejected', 'pending'].includes(decision)) return res.status(400).json({ success: false, message: 'invalid_decision' })
        const updated = setDecision(id, decision, notes)
        if (!updated) return res.status(404).json({ success: false, message: 'not_found' })
        res.json({ success: true, item: updated })
    } catch (e) {
        res.status(500).json({ success: false, message: 'decide_failed', error: e?.message || String(e) })
    }
})

export default router


