import express from 'express'
import { uploadToIPFS, registerBatchOnChain } from '../services/ipfsService.js'

const router = express.Router()

// Write verified batch to IPFS + Blockchain
router.post('/register-batch-onchain', async (req, res) => {
    try {
        const { batchId, batchData } = req.body
        if (!batchId || !batchData) {
            return res.status(400).json({ success: false, message: 'Batch ID and data required' })
        }

        // Upload metadata to IPFS
        const ipfsHash = await uploadToIPFS(batchData)

        // Write to blockchain (Arbitrum Sepolia)
        const txReceipt = await registerBatchOnChain(batchId, ipfsHash)

        res.json({ success: true, batchId, ipfsHash, txReceipt })
    } catch (e) {
        res.status(500).json({ success: false, message: 'On-chain registration failed', error: e?.message || String(e) })
    }
})

export default router
