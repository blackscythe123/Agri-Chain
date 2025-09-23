import express from 'express'
import { addToQueue } from '../services/moderationStore.js'

const router = express.Router()

function maskAadhaar(a) {
    return String(a || '').replace(/\d(?=\d{4})/g, 'X')
}

// Farmer registers batch (off-chain)
router.post('/register-batch', async (req, res) => {
    try {
        const { aadhaar, name, phone, village, district, landSize, bankAccount, crops } = req.body || {}
        if (!aadhaar || !name || !village) {
            return res.status(400).json({ success: false, message: 'Aadhaar, name, and village are required' })
        }

        const batch = {
            id: Date.now().toString(),
            farmer: {
                aadhaar: maskAadhaar(aadhaar),
                name,
                phone,
                location: `${village}, ${district || ''}`.trim(),
                landSize: parseFloat(landSize || '0'),
                bankAccount,
                registeredCrops: crops || []
            },
            status: 'pending_verification',
            registrationDate: new Date().toISOString()
        }

        // enqueue for verifier moderation
        addToQueue(batch)

        res.json({ success: true, message: 'Batch registered off-chain successfully', batch })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Registration failed', error: e?.message || String(e) })
    }
})

export default router
