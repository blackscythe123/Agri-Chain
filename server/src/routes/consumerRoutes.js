import express from 'express'
import multer from 'multer'
import { uploadFile } from '../services/ipfsService.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

function maskPhone(phone) { return String(phone || '').replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }

router.post('/complaint', upload.array('photos', 5), async (req, res) => {
    try {
        const { batchId, consumerPhone, issueType, description, location, purchaseDate } = req.body || {}
        const photos = []
        if (req.files?.length) {
            for (const f of req.files) {
                const h = await uploadFile(f.buffer, f.originalname)
                photos.push({ filename: f.originalname, ipfsHash: h, size: f.size })
            }
        }
        const complaint = { id: `COMPLAINT-${Date.now()}`, batchId, consumerPhone: maskPhone(consumerPhone), issueType, description, location, purchaseDate: new Date(purchaseDate).toISOString(), photos, status: 'submitted', timestamp: new Date().toISOString(), resolution: null }
        res.json({ success: true, message: 'Complaint submitted successfully', complaintId: complaint.id, expectedResolution: '48 hours' })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Complaint submission failed', error: e?.message || String(e) })
    }
})

router.post('/rating', async (req, res) => {
    try {
        const { batchId, rating, review, categories } = req.body || {}
        const r = Number(rating)
        if (r < 1 || r > 5) return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' })
        const ratingData = { id: `RATING-${Date.now()}`, batchId, rating: r, review: review || '', categories: categories || {}, timestamp: new Date().toISOString(), verified: true }
        res.json({ success: true, message: 'Rating submitted successfully', rating: ratingData })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Rating submission failed', error: e?.message || String(e) })
    }
})

export default router


