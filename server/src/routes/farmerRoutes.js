import express from 'express'

const router = express.Router()

function maskAadhaar(a) { return String(a || '').replace(/\d(?=\d{4})/g, 'X') }

router.get('/search', async (req, res) => {
    try {
        const { aadhaar } = req.query
        if (!aadhaar || String(aadhaar).length < 4) return res.status(400).json({ success: false, message: 'Valid Aadhaar number required' })
        // Placeholder demo response
        const farmerData = { name: 'Demo Farmer', location: 'Village, District', landSize: 2.5, crops: ['rice'], isVerified: true }
        return res.json({ success: true, farmer: { name: farmerData.name, aadhaar: maskAadhaar(aadhaar), location: farmerData.location, landSize: farmerData.landSize, registeredCrops: farmerData.crops, verificationStatus: farmerData.isVerified } })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Database search failed', error: e?.message || String(e) })
    }
})

router.post('/register', async (req, res) => {
    try {
        const { aadhaar, name, phone, village, district, landSize, bankAccount } = req.body || {}
        if (!aadhaar || !name || !village) return res.status(400).json({ success: false, message: 'Aadhaar, name, and village are required' })
        const farmer = { aadhaar: maskAadhaar(aadhaar), name, phone, location: `${village}, ${district || ''}`.trim(), landSize: parseFloat(landSize || '0'), bankAccount, registrationDate: new Date().toISOString(), status: 'pending_verification' }
        res.json({ success: true, message: 'Farmer registered successfully', farmer })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Registration failed', error: e?.message || String(e) })
    }
})

export default router


