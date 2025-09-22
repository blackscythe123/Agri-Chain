import express from 'express'

const router = express.Router()

function getStageNumber(stage) {
    const m = { 'farmer_to_distributor': 1, 'distributor_to_retailer': 2, 'retailer_to_consumer': 3 }
    return m[stage] || 0
}

router.post('/update-quantity', async (req, res) => {
    try {
        const { batchId, actualQuantity, stage } = req.body || {}
        const validStages = ['farmer_to_distributor', 'distributor_to_retailer', 'retailer_to_consumer']
        if (!validStages.includes(stage)) return res.status(400).json({ success: false, message: 'Invalid supply chain stage' })
        const updateData = { batchId, actualQuantity: parseInt(actualQuantity || '0'), stage: getStageNumber(stage), timestamp: new Date().toISOString(), verifier: req.body?.verifierAddress }
        res.json({ success: true, message: 'Quantity updated successfully', transactionHash: '0xmock', supplyChainRecord: { ...updateData } })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Quantity update failed', error: e?.message || String(e) })
    }
})

router.post('/distributor/receive', async (req, res) => {
    try {
        const { batchId, expectedQuantity, actualQuantity } = req.body || {}
        const eq = Number(expectedQuantity || 0), aq = Number(actualQuantity || 0)
        const quantityVariance = eq > 0 ? ((aq - eq) / eq) * 100 : 0
        if (Math.abs(quantityVariance) > 10) return res.status(400).json({ success: false, message: `Quantity variance ${quantityVariance.toFixed(1)}% requires explanation`, requiresExplanation: true })
        res.json({ success: true, message: 'Distributor verification completed', verification: { batchId, stage: 'distributor_receiving', expectedQuantity: eq, actualQuantity: aq, quantityVariance, timestamp: new Date().toISOString() } })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Distributor verification failed', error: e?.message || String(e) })
    }
})

router.post('/retailer/inventory', async (req, res) => {
    try {
        const { batchId, receivedQuantity, displayLocation, shelfLife, displayConditions, sellByDate } = req.body || {}
        const inv = { batchId, stage: 'retailer_inventory', receivedQuantity: parseInt(receivedQuantity || '0'), displayLocation, shelfLife: parseInt(shelfLife || '0'), displayConditions, sellByDate: new Date(sellByDate).toISOString(), status: 'available', timestamp: new Date().toISOString(), retailerId: req.body?.retailerId }
        res.json({ success: true, message: 'Retailer inventory updated', inventory: inv })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Retailer inventory update failed', error: e?.message || String(e) })
    }
})

export default router


