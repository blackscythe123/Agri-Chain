import express from 'express'
import multer from 'multer'
import { uploadBatchData, getBatchData, uploadFile } from '../services/ipfsService.js'
import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { AGRI_TRUTH_CHAIN_ABI, AGRI_TRUTH_CHAIN_ADDRESS } from '../contract.js'
import { addToQueue } from '../services/moderationStore.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

const client = createPublicClient({ chain: arbitrumSepolia, transport: http(process.env.ARB_SEPOLIA_RPC_URL) })

router.post('/register-batch', upload.array('photos', 5), async (req, res) => {
    try {
        const {
            farmerAadhaar,
            cropType,
            estimatedQuantity,
            landSize,
            harvestDate,
            location,
            verificationCenterId,
            qualityGrade,
            isOrganic,
            moistureContent,
            farmerName,
            farmerPhone,
            village,
            district,
            seedVariety,
            fertilizersUsed,
            pesticidesUsed,
            irrigationType,
            soilType
        } = req.body

        const batchId = `OD2025-${String(farmerAadhaar || '').slice(-4)}-${String(cropType || '').substring(0, 3).toUpperCase()}-${Date.now()}`

        let photoHashes = []
        if (req.files?.length) {
            for (const file of req.files) {
                const ipfs = await uploadFile(file.buffer, file.originalname)
                photoHashes.push({ filename: file.originalname, ipfsHash: ipfs, size: file.size })
            }
        }

        const detailed = {
            batchId,
            farmerDetails: {
                name: farmerName,
                aadhaar: farmerAadhaar,
                phone: farmerPhone,
                location: { village, district, coordinates: location },
                landSize: parseFloat(landSize || '0')
            },
            cropDetails: {
                type: cropType,
                variety: seedVariety,
                harvestDate,
                estimatedQuantity: parseInt(estimatedQuantity || '0'),
                irrigationType,
                soilType
            },
            inputsUsed: {
                fertilizers: fertilizersUsed ? String(fertilizersUsed).split(',') : [],
                pesticides: pesticidesUsed ? String(pesticidesUsed).split(',') : [],
                organicCertified: String(isOrganic) === 'true'
            },
            qualityMetrics: {
                grade: qualityGrade,
                moistureContent: moistureContent ? parseFloat(moistureContent) : null,
                testingDate: new Date().toISOString(),
                testingCenter: verificationCenterId
            },
            verificationData: {
                centerId: verificationCenterId,
                timestamp: new Date().toISOString(),
                photos: photoHashes,
                verificationStatus: 'verified'
            },
            supplyChainHistory: [],
            metadata: { version: '1.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        }

        const ipfsHash = await uploadBatchData(detailed)

        // enqueue for moderation (verification pending)
        addToQueue({ batchId, farmerAadhaar: detailed.farmerDetails.aadhaar, summary: `New batch ${cropType} ${estimatedQuantity}q` })

        res.json({ success: true, message: 'Batch registered successfully', data: { batchId, ipfsHash, status: 'pending_verification' } })
    } catch (e) {
        console.error('register-batch failed', e)
        res.status(500).json({ success: false, message: 'Batch registration failed', error: e?.message || String(e) })
    }
})

router.get('/batch/:batchId', async (req, res) => {
    try {
        const { batchId } = req.params
        const { fullDetails } = req.query
        // Note: Without on-chain mapping to IPFS, this route expects the frontend to carry IPFS CID, or would require an index DB.
        // To align with docs, we accept a query ipfsHash when fullDetails requested.
        const ipfsHash = req.query.ipfsHash
        const basicInfo = { id: batchId, ipfsHash: ipfsHash || null }
        const data = { batchId, basicInfo, fullDetailsAvailable: !!ipfsHash }
        if (fullDetails === 'true' && ipfsHash) {
            try { data.fullDetails = await getBatchData(ipfsHash) } catch { data.ipfsError = 'Detailed data temporarily unavailable' }
        }
        res.json({ success: true, data })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Batch retrieval failed', error: e?.message || String(e) })
    }
})

export default router


