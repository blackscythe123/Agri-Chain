import express from 'express'
import { addToQueue } from '../services/moderationStore.js'

const router = express.Router()

function maskAadhaar(a) { return String(a || '').replace(/\d(?=\d{4})/g, 'X') }

router.post('/verify-batch', async (req, res) => {
    try {
        const { farmerAadhaar, estimatedQuantity, sampleWeight, qualityGrade, moistureContent, verificationCenterId, verifierPhoto, testingNotes } = req.body || {}
        if (!farmerAadhaar || !estimatedQuantity || !sampleWeight || !qualityGrade) return res.status(400).json({ success: false, message: 'Missing required verification data' })
        const verificationData = {
            farmerAadhaar: maskAadhaar(farmerAadhaar),
            estimatedQuantity: parseInt(estimatedQuantity),
            sampleWeight: parseFloat(sampleWeight),
            qualityGrade,
            moistureContent: moistureContent ? parseFloat(moistureContent) : null,
            verificationCenterId,
            timestamp: new Date().toISOString(),
            verifierPhoto,
            testingNotes,
            status: 'verified'
        }
        const batchId = `OD2025-${String(farmerAadhaar).slice(-4)}-${Date.now()}`
        // enqueue for verifier moderation
        addToQueue({ batchId, farmerAadhaar: verificationData.farmerAadhaar, summary: `Grade ${qualityGrade}, Qty ${estimatedQuantity}` })
        res.json({ success: true, message: 'Batch verified successfully', batchId, verificationData })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Batch verification failed', error: e?.message || String(e) })
    }
})

export default router


