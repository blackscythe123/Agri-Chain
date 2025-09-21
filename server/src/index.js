import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import Stripe from 'stripe'
import bodyParser from 'body-parser'
import { createPublicClient, createWalletClient, decodeEventLog, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrumSepolia } from 'viem/chains'
import { AGRI_TRUTH_CHAIN_ABI, AGRI_TRUTH_CHAIN_ADDRESS } from './contract.js'

// Import route files
import farmerRoutes from './routes/farmerRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import supplyChainRoutes from './routes/supplyChainRoutes.js';
import consumerRoutes from './routes/consumerRoutes.js';

// Default EOAs for testing when inputs are missing
const DEFAULT_ADDRESSES = {
  FARMER: '0x1111111111111111111111111111111111111111',
  DISTRIBUTOR: '0x2222222222222222222222222222222222222222',
  RETAILER: '0x3333333333333333333333333333333333333333',
  CONSUMER: '0x4444444444444444444444444444444444444444',
}

// In-memory idempotency guards for Stripe sessions to avoid duplicate writes
const processedSessions = new Set()
const processingSessions = new Set()

// Load env from server/.env explicitly
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Load env from server/.env explicitly (must be before reading process.env values below)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const port = process.env.PORT || 3001
const rpcUrl = process.env.ARB_SEPOLIA_RPC_URL
const transport = rpcUrl ? http(rpcUrl) : http()
const client = createPublicClient({ chain: arbitrumSepolia, transport })
const relayerKey = process.env.RELAYER_PRIVATE_KEY
const account = relayerKey ? privateKeyToAccount(relayerKey.startsWith('0x') ? relayerKey : ('0x' + relayerKey)) : undefined
const wallet = account ? createWalletClient({ account, chain: arbitrumSepolia, transport }) : undefined
const ownerKey = process.env.OWNER_PRIVATE_KEY
const ownerAccount = ownerKey ? privateKeyToAccount(ownerKey.startsWith('0x') ? ownerKey : ('0x' + ownerKey)) : undefined
const ownerWallet = ownerAccount ? createWalletClient({ account: ownerAccount, chain: arbitrumSepolia, transport }) : undefined
const CONTRACT_ADDRESS = (process.env.AGRI_TRUTH_CHAIN_ADDRESS || AGRI_TRUTH_CHAIN_ADDRESS)
const isValidAddress = (addr) => typeof addr === 'string' && /^0x[0-9a-fA-F]{40}$/.test(addr)
const isSameAddress = (a, b) => (a && b) ? a.toLowerCase() === b.toLowerCase() : false
// All pricing is INR on-chain now; Stripe expects amounts in INR paise (minor units)

// Tiny cache for contract bytecode presence to avoid repeated RPC calls per request
let contractHasCode = null
let contractCodeCheckedAt = 0
const CONTRACT_CODE_TTL_MS = 30_000
async function hasContractCode() {
  if (!isValidAddress(CONTRACT_ADDRESS)) return false
  const now = Date.now()
  if (contractHasCode !== null && (now - contractCodeCheckedAt) < CONTRACT_CODE_TTL_MS) return contractHasCode
  const code = await client.getBytecode({ address: CONTRACT_ADDRESS }).catch(() => null)
  contractHasCode = !!code
  contractCodeCheckedAt = now
  return contractHasCode
}

// Log relayer status
if (account) {
  console.log(`[server] Relayer configured: ${account.address}`)
} else {
  console.warn('[server] Relayer not configured. Set RELAYER_PRIVATE_KEY in server/.env')
}
console.log(`[server] Contract address: ${CONTRACT_ADDRESS}`)
console.log(`[server] Chain: arbitrum-sepolia (id=${arbitrumSepolia.id})`)
console.log(`[server] RPC: ${rpcUrl || 'default provider'}`)
if (account && isValidAddress(CONTRACT_ADDRESS) && isSameAddress(CONTRACT_ADDRESS, account.address)) {
  console.warn('[server] WARNING: Contract address equals relayer address (EOA). This is not a contract. Update AGRI_TRUTH_CHAIN_ADDRESS in server/.env to your deployed contract address.')
}

// Add API routes
app.use('/api/farmers', farmerRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/supply-chain', supplyChainRoutes);
app.use('/api/consumer', consumerRoutes);

// Raw body is required for Stripe signature verification
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event
  try {
    event = Stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    const session = event.data.object
    // Idempotency: skip if this session already processed
    if (session?.id) {
      if (processedSessions.has(session.id)) {
        return res.json({ received: true, skipped: true })
      }
      if (processingSessions.has(session.id)) {
        return res.json({ received: true, inProgress: true })
      }
      processingSessions.add(session.id)
    }
    const meta = (session && session.metadata) || {}
    const batchIdStr = meta.batchId
    const batchId = batchIdStr && /^[0-9]+$/.test(batchIdStr) ? BigInt(batchIdStr) : null

    if (event.type === 'checkout.session.completed' && batchId) {
      if (!wallet || !account) {
        console.warn('[webhook] relayer not configured; skipping on-chain log')
      } else if (!isValidAddress(CONTRACT_ADDRESS)) {
        console.warn('[webhook] invalid contract address; skipping on-chain log')
      } else {
        const code = await client.getBytecode({ address: CONTRACT_ADDRESS })
        if (!code) throw new Error('not_a_contract')
        // Payments are not stored on-chain anymore; directly transfer via verifier
        // Determine destination address based on role (fallback to defaults)
        const role = meta.role
        let defaultTo = DEFAULT_ADDRESSES.DISTRIBUTOR
        if (role === 'retailer') defaultTo = DEFAULT_ADDRESSES.RETAILER
        else if (role === 'consumer') defaultTo = DEFAULT_ADDRESSES.CONSUMER
        const toAddress = meta.toAddress || defaultTo
        if (toAddress && /^0x[0-9a-fA-F]{40}$/.test(toAddress)) {
          try {
            // Only finalize if not already owned by destination
            const latest = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'batches', args: [batchId] })
            const alreadyOwner = (latest?.[1] || '').toLowerCase?.() === toAddress.toLowerCase?.()
            if (!alreadyOwner) {
              const tx = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'transferOwnershipByVerifier', args: [batchId, toAddress] })
              await client.waitForTransactionReceipt({ hash: tx })
            }
          } catch (e) { console.warn('[webhook] transferOwnership failed', e?.message || e) }
        } else {
          console.warn('[webhook] toAddress missing or invalid; skipping ownership transfer')
        }
        // Optional downstream price updates based on role
        try {
          if (role === 'distributor') {
            const pInrMeta = meta?.distributorPriceINR
            const pInr = pInrMeta != null && String(pInrMeta).trim() !== '' ? BigInt(String(pInrMeta)) : 0n
            if (pInr > 0n) {
              // Only set if different from current
              const latest = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'batches', args: [batchId] })
              const current = latest?.[14]
              const same = (current?.toString?.() || '') === pInr.toString()
              if (!same) {
                const setTx = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'setPriceByDistributorInr', args: [batchId, pInr] })
                await client.waitForTransactionReceipt({ hash: setTx })
              }
            }
          } else if (role === 'retailer') {
            const pInrMeta = meta?.consumerPriceINR
            const pInr = pInrMeta != null && String(pInrMeta).trim() !== '' ? BigInt(String(pInrMeta)) : 0n
            if (pInr > 0n) {
              const latest = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'batches', args: [batchId] })
              const current = latest?.[15]
              const same = (current?.toString?.() || '') === pInr.toString()
              if (!same) {
                const setTx = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'setPriceByRetailerInr', args: [batchId, pInr] })
                await client.waitForTransactionReceipt({ hash: setTx })
              }
            }
          }
        } catch (e) { console.warn('[webhook] optional downstream price update failed', e?.message || e) }
      }
      console.log('Checkout complete for session', session.id)
    } else if ((event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') && batchId) {
      // No on-chain action for failed sessions in INR-only model
      console.log('Checkout failed/expired for session', session.id)
    }
    res.json({ received: true })
  } catch (e) {
    console.error('[webhook] handler error', e)
    res.json({ received: true })
  } finally {
    // Mark processed and clear in-progress flag
    try {
      const id = event?.data?.object?.id
      if (id && processingSessions.has(id)) {
        processingSessions.delete(id)
        processedSessions.add(id)
      }
    } catch { }
  }
})

// Note: duplicate webhook route removed to prevent double handling

app.use(express.json())

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { lineItems, successUrl, cancelUrl, metadata } = req.body
    // Expect unit_amount already in INR paise; enforce currency and minimal amount
    const STRIPE_MAX = 999_999_999_999
    const safeLineItems = (Array.isArray(lineItems) ? lineItems : []).map((item) => {
      const src = item?.price_data || {}
      let amount = Number(src.unit_amount ?? 0)
      if (!Number.isFinite(amount) || amount <= 0) amount = 100 // ₹1.00
      amount = Math.min(Math.max(100, Math.floor(amount)), STRIPE_MAX)
      return {
        price_data: {
          currency: 'inr',
          product_data: src.product_data || { name: 'Agri batch' },
          unit_amount: amount
        },
        quantity: Number(item?.quantity ?? 1)
      }
    })
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: safeLineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata
    })
    res.json({ id: session.id, url: session.url })
  } catch (e) {
    console.error('create-checkout-session failed', e)
    res.status(500).json({ error: 'failed_to_create_session' })
  }
})

// Health/status: check relayer config (dev only; do not expose in prod)
app.get('/api/relayer-status', (req, res) => {
  res.json({ configured: !!(wallet && account), address: account?.address || null })
})

// Write: register a new batch on-chain using relayer key (test only)
app.post('/api/register-batch', async (req, res) => {
  try {
    if (!wallet || !account) return res.status(500).json({ error: 'relayer_not_configured' })
    if (!isValidAddress(CONTRACT_ADDRESS)) return res.status(400).json({ error: 'invalid_contract_address', address: CONTRACT_ADDRESS })
    const { cropType, quantityKg, basePriceINR, harvestDate, metadataCID, minPriceINR, farmerAddress } = req.body || {}
    if (!cropType || String(cropType).trim() === '') return res.status(400).json({ error: 'missing_crop_type' })
    if (quantityKg == null || Number(quantityKg) <= 0) return res.status(400).json({ error: 'invalid_quantity' })
    if (!harvestDate || Number(harvestDate) <= 0) return res.status(400).json({ error: 'invalid_harvest_date' })
    const baseInr = BigInt(basePriceINR ?? 0)
    if (baseInr <= 0n) return res.status(400).json({ error: 'invalid_base_price' })

    // send registerBatch
    const wantsFor = farmerAddress && /^0x[0-9a-fA-F]{40}$/.test(farmerAddress)
    const metaCID = (metadataCID && String(metadataCID).trim() !== '') ? metadataCID : ('meta:' + JSON.stringify({
      kind: 'registration', cropType, quantityKg: Number(quantityKg), basePriceINR: baseInr.toString(), harvestDate: Number(harvestDate), minPriceINR: (minPriceINR != null) ? BigInt(minPriceINR).toString() : undefined
    }))
    const argsFor = [farmerAddress, cropType, BigInt(quantityKg), baseInr, BigInt(harvestDate), metaCID]
    const argsSimple = [cropType, BigInt(quantityKg), baseInr, BigInt(harvestDate), metaCID]
    let hash
    let receipt
    let usedFallback = false
    try {
      const fn = wantsFor ? 'registerBatchFor' : 'registerBatch'
      const args = wantsFor ? argsFor : argsSimple
      hash = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: fn, args })
      receipt = await client.waitForTransactionReceipt({ hash })
    } catch (e) {
      // Fallback path: some older deployments may not allow registerBatchFor.
      if (wantsFor) {
        try {
          usedFallback = true
          hash = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'registerBatch', args: argsSimple })
          receipt = await client.waitForTransactionReceipt({ hash })
        } catch (e2) {
          throw e2
        }
      } else {
        throw e
      }
    }
    // Robustly decode batchId from logs using viem.decodeEventLog
    let batchId
    for (const log of receipt.logs) {
      try {
        // Only consider logs from our contract
        if ((log.address || '').toLowerCase() !== (CONTRACT_ADDRESS || '').toLowerCase()) continue
        const decoded = decodeEventLog({ abi: AGRI_TRUTH_CHAIN_ABI, data: log.data, topics: log.topics })
        if (decoded.eventName === 'BatchRegistered' && decoded.args?.batchId != null) {
          batchId = BigInt(decoded.args.batchId)
          break
        }
      } catch (_) { /* skip non-matching logs */ }
    }

    // set min price if provided
    const minInrComputed = (minPriceINR != null) ? BigInt(minPriceINR) : null
    if (minInrComputed != null && batchId != null) {
      await wallet.writeContract({
        address: CONTRACT_ADDRESS,
        abi: AGRI_TRUTH_CHAIN_ABI,
        functionName: 'setMinPriceInr',
        args: [batchId, BigInt(minInrComputed)]
      })
    }
    // Metadata mirroring via payments/shipments removed in INR-only model
    // If we used fallback registerBatch, ensure the farmer is the owner
    if (usedFallback && wantsFor && batchId != null) {
      try {
        const tx2 = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'transferOwnership', args: [batchId, farmerAddress] })
        await client.waitForTransactionReceipt({ hash: tx2 })
      } catch (e) {
        console.warn('[register-batch] fallback transferOwnership failed', e?.message || e)
      }
    }
    res.json({ ok: true, batchId: batchId ? batchId.toString() : null, tx: hash, usedFallback })
  } catch (e) {
    console.error('register-batch failed', e)
    res.status(500).json({ error: 'register_failed', message: e?.message || String(e) })
  }
})

// Read: list all batches from chain (id + summary)
app.get('/api/batches', async (req, res) => {
  try {
    if (!isValidAddress(CONTRACT_ADDRESS)) {
      return res.status(400).json({ error: 'invalid_contract_address', address: CONTRACT_ADDRESS })
    }
    if (account && isSameAddress(CONTRACT_ADDRESS, account.address)) {
      return res.status(400).json({ error: 'address_matches_relayer', address: CONTRACT_ADDRESS })
    }
    // quick sanity: ensure address has code
    const code = await client.getBytecode({ address: CONTRACT_ADDRESS })
    if (!code) {
      return res.status(400).json({ error: 'not_a_contract', address: CONTRACT_ADDRESS })
    }
    let ids
    try {
      ids = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'getAllBatchIds' })
    } catch (e) {
      // Fallback: derive from events if getAllBatchIds is not available
      const logs = await client.getLogs({
        address: CONTRACT_ADDRESS,
        abi: AGRI_TRUTH_CHAIN_ABI,
        eventName: 'BatchRegistered',
        fromBlock: 0n
      })
      const seen = new Set()
      ids = []
      for (const log of logs) {
        const id = log.args?.batchId
        if (typeof id !== 'bigint') continue
        if (!seen.has(id)) { seen.add(id); ids.push(id) }
      }
    }
    const results = await Promise.all(ids.map(async (id) => {
      let b
      try {
        b = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'batches', args: [id] })
      } catch {
        b = null
      }
      let record
      if (b) {
        record = {
          id: Number(b[0]),
          currentOwner: b[1],
          farmer: b[2],
          distributor: b[3],
          retailer: b[4],
          consumer: b[5],
          cropType: b[6],
          quantityKg: Number(b[7]),
          basePriceINR: b[8]?.toString?.() ?? '0',
          harvestDate: Number(b[9] || 0n),
          metadataCID: b[10] || '',
          createdAt: Number(b[11] || 0n),
          exists: !!b[12],
          minPriceINR: b[13]?.toString?.() ?? '0',
          priceByDistributorINR: b[14]?.toString?.() ?? '0',
          priceByRetailerINR: b[15]?.toString?.() ?? '0',
          boughtByDistributorAt: Number(b[16] || 0n),
          boughtByRetailerAt: Number(b[17] || 0n),
          boughtByConsumerAt: Number(b[18] || 0n)
        }
        // Fallback: if minPrice is zero but base exists, use base as min
        if ((record.minPriceINR === '0' || record.minPriceINR === 0) && (record.basePriceINR && record.basePriceINR !== '0')) {
          record.minPriceINR = record.basePriceINR.toString()
        }
        // Overlay from BatchRegistered event if tuple seems sparse
        try {
          if (!record.cropType || record.cropType === '' || !record.quantityKg || record.basePriceINR === '0' || !record.harvestDate) {
            const logs = await client.getLogs({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, eventName: 'BatchRegistered', fromBlock: 0n, args: { batchId: id } })
            const last = logs[logs.length - 1]
            if (last) {
              if ((!record.cropType || record.cropType === '') && last.args?.cropType) record.cropType = last.args.cropType
              if ((!record.quantityKg || record.quantityKg === 0) && last.args?.quantityKg) record.quantityKg = Number(last.args.quantityKg)
              if ((record.basePriceINR === '0' || !record.basePriceINR) && last.args?.basePriceINR) record.basePriceINR = String(last.args.basePriceINR)
              if ((!record.harvestDate || record.harvestDate === 0) && last.args?.harvestDate) record.harvestDate = Number(last.args.harvestDate)
              if ((!record.metadataCID || record.metadataCID === '') && last.args?.metadataCID) record.metadataCID = last.args.metadataCID
              if (!record.createdAt && last.blockNumber) {
                try { const blk = await client.getBlock({ blockNumber: last.blockNumber }); record.createdAt = blk?.timestamp ? Number(blk.timestamp) : record.createdAt }
                catch { }
              }
            }
          }
        } catch { }
      } else {
        // Legacy fallback via event log
        const logs = await client.getLogs({
          address: CONTRACT_ADDRESS,
          abi: AGRI_TRUTH_CHAIN_ABI,
          eventName: 'BatchRegistered',
          fromBlock: 0n,
          args: { batchId: id }
        })
        const last = logs[logs.length - 1]
        let createdAt = 0
        if (last?.blockNumber) {
          try {
            const blk = await client.getBlock({ blockNumber: last.blockNumber })
            createdAt = blk?.timestamp ? Number(blk.timestamp) : 0
          } catch { }
        }
        const farmer = last?.args?.farmer || DEFAULT_ADDRESSES.FARMER
        const cropType = last?.args?.cropType || ''
        const quantityKg = Number(last?.args?.quantityKg || 0n)
        const basePriceINR = (last?.args?.basePriceINR || 0n).toString()
        const harvestDate = Number(last?.args?.harvestDate || 0n)
        const metadataCID = last?.args?.metadataCID || ''
        record = {
          id: Number(id),
          currentOwner: farmer,
          farmer,
          distributor: '0x0000000000000000000000000000000000000000',
          retailer: '0x0000000000000000000000000000000000000000',
          consumer: '0x0000000000000000000000000000000000000000',
          cropType,
          quantityKg,
          basePriceINR,
          harvestDate,
          metadataCID,
          createdAt,
          exists: true,
          minPriceINR: '0',
          priceByDistributorINR: '0',
          priceByRetailerINR: '0',
          boughtByDistributorAt: 0,
          boughtByRetailerAt: 0,
          boughtByConsumerAt: 0
        }
        if ((record.minPriceINR === '0' || record.minPriceINR === 0) && (record.basePriceINR && record.basePriceINR !== '0')) {
          record.minPriceINR = record.basePriceINR.toString()
        }
      }

      // Enriched aliases
      const role = record.currentOwner?.toLowerCase?.() === record.farmer?.toLowerCase?.() ? 'farmer'
        : record.currentOwner?.toLowerCase?.() === record.distributor?.toLowerCase?.() ? 'distributor'
          : record.currentOwner?.toLowerCase?.() === record.retailer?.toLowerCase?.() ? 'retailer'
            : record.currentOwner?.toLowerCase?.() === record.consumer?.toLowerCase?.() ? 'consumer'
              : 'unknown'
      // Keep raw epoch seconds in the response; UI can format if needed
      const dates = {
        harvest: record.harvestDate,
        created: record.createdAt,
        boughtByDistributor: record.boughtByDistributorAt,
        boughtByRetailer: record.boughtByRetailerAt,
        boughtByConsumer: record.boughtByConsumerAt
      }
      const prices = {
        baseINR: record.basePriceINR,
        minINR: record.minPriceINR,
        byDistributorINR: record.priceByDistributorINR,
        byRetailerINR: record.priceByRetailerINR
      }

      // Removed enrichment from payments/shipments; rely on direct tuple + BatchRegistered event only

      // Normalize role addresses: if missing or zero, use defaults; avoid accidentally equating consumer to distributor unless set
      if (!record.distributor || record.distributor === '0x0000000000000000000000000000000000000000') record.distributor = DEFAULT_ADDRESSES.DISTRIBUTOR
      if (!record.retailer || record.retailer === '0x0000000000000000000000000000000000000000') record.retailer = DEFAULT_ADDRESSES.RETAILER
      if (!record.consumer || record.consumer === '0x0000000000000000000000000000000000000000') record.consumer = DEFAULT_ADDRESSES.CONSUMER
      return {
        ...record,
        currentHolder: record.currentOwner,
        'current-holder': record.currentOwner,
        current_holder: record.currentOwner,
        currentHolderRole: role,
        dates,
        prices
      }
    }))
    res.json({ batches: results })
  } catch (e) {
    console.error('batches read failed', e)
    res.status(500).json({ error: 'read_failed' })
  }
})

// Read: single batch with shipments & payments
app.get('/api/batch/:id', async (req, res) => {
  try {
    if (!isValidAddress(CONTRACT_ADDRESS)) return res.status(400).json({ error: 'invalid_contract_address', address: CONTRACT_ADDRESS })
    if (account && isSameAddress(CONTRACT_ADDRESS, account.address)) {
      return res.status(400).json({ error: 'address_matches_relayer', address: CONTRACT_ADDRESS })
    }
    const idStr = req.params.id
    if (!/^[0-9]+$/.test(idStr)) return res.status(400).json({ error: 'invalid_id' })
    const id = BigInt(idStr)
    if (!(await hasContractCode())) return res.status(400).json({ error: 'not_a_contract', address: CONTRACT_ADDRESS })
    let b
    try {
      b = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'batches', args: [id] })
    } catch { }
    let batch
    if (b) {
      const exists = b[12]
      if (!exists) return res.status(404).json({ error: 'not_found' })
      batch = {
        id: Number(b[0]),
        currentOwner: b[1],
        farmer: b[2],
        distributor: b[3],
        retailer: b[4],
        consumer: b[5],
        cropType: b[6],
        quantityKg: Number(b[7]),
        basePriceINR: b[8]?.toString?.() ?? '0',
        harvestDate: Number(b[9]),
        metadataCID: b[10],
        createdAt: Number(b[11]),
        minPriceINR: b[13]?.toString?.() ?? '0',
        priceByDistributorINR: b[14]?.toString?.() ?? '0',
        priceByRetailerINR: b[15]?.toString?.() ?? '0',
        boughtByDistributorAt: Number(b[16] || 0n),
        boughtByRetailerAt: Number(b[17] || 0n),
        boughtByConsumerAt: Number(b[18] || 0n)
      }
      if ((batch.minPriceINR === '0' || batch.minPriceINR === 0) && (batch.basePriceINR && batch.basePriceINR !== '0')) {
        batch.minPriceINR = batch.basePriceINR.toString()
      }
      // Removed slow event-log overlays to speed up response
      // Patch from metadataCID if it contains embedded meta JSON
      try {
        if (typeof batch.metadataCID === 'string' && batch.metadataCID.startsWith('meta:')) {
          const m = JSON.parse(batch.metadataCID.slice(5))
          if (m?.cropType && (!batch.cropType || batch.cropType === '')) batch.cropType = m.cropType
          if (m?.quantityKg && (!batch.quantityKg || batch.quantityKg === 0)) batch.quantityKg = Number(m.quantityKg)
          if (m?.basePriceINR && (batch.basePriceINR === '0' || !batch.basePriceINR)) batch.basePriceINR = String(m.basePriceINR)
          if (m?.harvestDate && (!batch.harvestDate || batch.harvestDate === 0)) batch.harvestDate = Number(m.harvestDate)
          if (m?.minPriceINR && (batch.minPriceINR === '0' || !batch.minPriceINR)) batch.minPriceINR = String(m.minPriceINR)
        }
      } catch { }
    } else {
      // Fast-fail instead of scanning events across the chain
      return res.status(404).json({ error: 'not_found' })
    }
    // Enriched aliases
    const currentHolderRole = batch.currentOwner?.toLowerCase?.() === batch.farmer?.toLowerCase?.() ? 'farmer'
      : batch.currentOwner?.toLowerCase?.() === batch.distributor?.toLowerCase?.() ? 'distributor'
        : batch.currentOwner?.toLowerCase?.() === batch.retailer?.toLowerCase?.() ? 'retailer'
          : batch.currentOwner?.toLowerCase?.() === batch.consumer?.toLowerCase?.() ? 'consumer'
            : 'unknown'
    const dates = {
      harvest: batch.harvestDate,
      created: batch.createdAt,
      boughtByDistributor: batch.boughtByDistributorAt,
      boughtByRetailer: batch.boughtByRetailerAt,
      boughtByConsumer: batch.boughtByConsumerAt
    }
    const prices = {
      baseINR: batch.basePriceINR,
      minINR: batch.minPriceINR,
      byDistributorINR: batch.priceByDistributorINR,
      byRetailerINR: batch.priceByRetailerINR
    }
    res.json({
      batch: {
        ...batch,
        currentHolder: batch.currentOwner,
        'current-holder': batch.currentOwner,
        current_holder: batch.currentOwner,
        currentHolderRole,
        dates,
        prices
      }
    })
  } catch (e) {
    console.error('batch read failed', e)
    res.status(500).json({ error: 'read_failed' })
  }
})

// Diagnostics: show chain, rpc, and contract bytecode presence
app.get('/api/chain-info', async (req, res) => {
  try {
    const code = isValidAddress(CONTRACT_ADDRESS) ? await client.getBytecode({ address: CONTRACT_ADDRESS }) : null
    const blockNumber = await client.getBlockNumber().catch(() => null)
    let isRelayerVerifier = null
    try {
      if (account && isValidAddress(CONTRACT_ADDRESS)) {
        isRelayerVerifier = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'verifiers', args: [account.address] })
      }
    } catch { }
    res.json({
      chain: 'arbitrum-sepolia',
      chainId: arbitrumSepolia.id,
      rpcUrl: rpcUrl || null,
      contractAddress: CONTRACT_ADDRESS,
      relayerAddress: account?.address || null,
      addressMatchesRelayer: account ? isSameAddress(CONTRACT_ADDRESS, account.address) : false,
      hasBytecode: !!code,
      blockNumber: blockNumber ? blockNumber.toString() : null,
      isRelayerVerifier: isRelayerVerifier
    })
  } catch (e) {
    res.status(500).json({ error: 'diagnostic_failed', message: e?.message || String(e) })
  }
})

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`))

// Diagnostics: raw tuple read and event fallback for a batch id
app.get('/api/debug/batch-raw/:id', async (req, res) => {
  try {
    const idStr = req.params.id
    if (!/^[0-9]+$/.test(idStr)) return res.status(400).json({ error: 'invalid_id' })
    const id = BigInt(idStr)
    const code = isValidAddress(CONTRACT_ADDRESS) ? await client.getBytecode({ address: CONTRACT_ADDRESS }) : null
    if (!code) return res.status(400).json({ error: 'not_a_contract', address: CONTRACT_ADDRESS })
    let raw = null, fallback = null
    try {
      const b = await client.readContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'batches', args: [id] })
      raw = (b || []).map((v) => (typeof v === 'bigint' ? v.toString() : v))
    } catch (e) {
      // ignore, use fallback
    }
    const logs = await client.getLogs({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, eventName: 'BatchRegistered', fromBlock: 0n, args: { batchId: id } })
    const last = logs[logs.length - 1]
    let createdAt = 0
    if (last?.blockNumber) {
      try { const blk = await client.getBlock({ blockNumber: last.blockNumber }); createdAt = blk?.timestamp ? Number(blk.timestamp) : 0 } catch { }
    }
    if (last) {
      fallback = {
        farmer: last.args?.farmer || null,
        cropType: last.args?.cropType || null,
        quantityKg: last.args?.quantityKg ? last.args.quantityKg.toString() : null,
        basePriceINR: last.args?.basePriceINR ? last.args.basePriceINR.toString() : null,
        harvestDate: last.args?.harvestDate ? Number(last.args.harvestDate) : null,
        metadataCID: last.args?.metadataCID || null,
        createdAt
      }
    }
    res.json({ ok: true, raw, fallback })
  } catch (e) {
    res.status(500).json({ error: 'debug_failed', message: e?.message || String(e) })
  }
})

// One-time setup: owner marks relayer as verifier so webhook/confirm can verify payments
app.post('/api/setup-relayer-as-verifier', async (req, res) => {
  try {
    if (!ownerWallet || !ownerAccount) return res.status(500).json({ error: 'owner_not_configured' })
    if (!account) return res.status(500).json({ error: 'relayer_not_configured' })
    if (!isValidAddress(CONTRACT_ADDRESS)) return res.status(400).json({ error: 'invalid_contract_address', address: CONTRACT_ADDRESS })
    const code = await client.getBytecode({ address: CONTRACT_ADDRESS })
    if (!code) return res.status(400).json({ error: 'not_a_contract' })
    const tx = await ownerWallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'setVerifier', args: [account.address, true] })
    await client.waitForTransactionReceipt({ hash: tx })
    res.json({ ok: true, tx })
  } catch (e) {
    console.error('setup-relayer-as-verifier failed', e)
    res.status(500).json({ error: 'setup_failed', message: e?.message || String(e) })
  }
})

// Fallback: confirm payment and transfer via API when webhook cannot reach local server
app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { sessionId, batchId, toAddress } = req.body || {}
    if (!sessionId || !/^(cs_test|cs_).+/.test(sessionId)) return res.status(400).json({ error: 'invalid_session' })
    if (!batchId || !/^[0-9]+$/.test(String(batchId))) return res.status(400).json({ error: 'invalid_batch_id' })
    if (!wallet || !account) return res.status(500).json({ error: 'relayer_not_configured' })
    if (!isValidAddress(CONTRACT_ADDRESS)) return res.status(400).json({ error: 'invalid_contract_address', address: CONTRACT_ADDRESS })
    const code = await client.getBytecode({ address: CONTRACT_ADDRESS })
    if (!code) return res.status(400).json({ error: 'not_a_contract', address: CONTRACT_ADDRESS })
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (!session || session.payment_status !== 'paid') return res.status(400).json({ error: 'not_paid' })
    const id = BigInt(batchId)
    const role = session.metadata?.role
    // Role-based default destination
    let defaultTo = DEFAULT_ADDRESSES.DISTRIBUTOR
    if (role === 'retailer') defaultTo = DEFAULT_ADDRESSES.RETAILER
    else if (role === 'consumer') defaultTo = DEFAULT_ADDRESSES.CONSUMER
    const finalTo = (toAddress && /^0x[0-9a-fA-F]{40}$/.test(toAddress)) ? toAddress : (session.metadata?.toAddress || defaultTo)
    if (!/^0x[0-9a-fA-F]{40}$/.test(finalTo)) return res.status(400).json({ error: 'invalid_to_address' })
    const tx = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'transferOwnershipByVerifier', args: [id, finalTo] })
    await client.waitForTransactionReceipt({ hash: tx })
    // Optional: set downstream price if provided in metadata (distributor sets price for retailer)
    try {
      if (role === 'distributor') {
        const pInrMeta = session.metadata?.distributorPriceINR
        const pInr = pInrMeta != null && String(pInrMeta).trim() !== '' ? BigInt(String(pInrMeta)) : 0n
        if (pInr > 0n) {
          const setTx = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'setPriceByDistributorInr', args: [id, pInr] })
          await client.waitForTransactionReceipt({ hash: setTx })
        }
      } else if (role === 'retailer') {
        const pInrMeta = session.metadata?.consumerPriceINR
        const pInr = pInrMeta != null && String(pInrMeta).trim() !== '' ? BigInt(String(pInrMeta)) : 0n
        if (pInr > 0n) {
          const setTx = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'setPriceByRetailerInr', args: [id, pInr] })
          await client.waitForTransactionReceipt({ hash: setTx })
        }
      }
    } catch (e) { console.warn('[confirm-payment] optional price set failed', e?.message || e) }
    res.json({ ok: true, tx })
  } catch (e) {
    console.error('confirm-payment failed', e)
    res.status(500).json({ error: 'confirm_failed', message: e?.message || String(e) })
  }
})

// Write: transfer ownership (relayer)
app.post('/api/transfer', async (req, res) => {
  try {
    if (!wallet || !account) return res.status(500).json({ error: 'relayer_not_configured' })
    if (!isValidAddress(CONTRACT_ADDRESS)) return res.status(400).json({ error: 'invalid_contract_address', address: CONTRACT_ADDRESS })
    const { batchId } = req.body || {}
    const toAddress = (req.body?.toAddress && /^0x[0-9a-fA-F]{40}$/.test(req.body.toAddress)) ? req.body.toAddress : DEFAULT_ADDRESSES.DISTRIBUTOR
    if (!batchId || !/^[0-9]+$/.test(String(batchId))) return res.status(400).json({ error: 'invalid_batch_id' })
    if (!isValidAddress(toAddress)) return res.status(400).json({ error: 'invalid_to_address' })
    const code = await client.getBytecode({ address: CONTRACT_ADDRESS })
    if (!code) return res.status(400).json({ error: 'not_a_contract', address: CONTRACT_ADDRESS })
    const tx = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'transferOwnership', args: [BigInt(batchId), toAddress] })
    const receipt = await client.waitForTransactionReceipt({ hash: tx })
    res.json({ ok: true, tx })
  } catch (e) {
    console.error('transfer failed', e)
    res.status(500).json({ error: 'transfer_failed', message: e?.message || String(e) })
  }
})

// Write: add shipment (relayer)
// add-shipment endpoint removed in INR-only model

// Set distributor sale price (accepts priceINR or priceWei)
app.post('/api/set-price-by-distributor', async (req, res) => {
  try {
    if (!wallet || !account) return res.status(500).json({ error: 'relayer_not_configured' })
    if (!isValidAddress(CONTRACT_ADDRESS)) return res.status(400).json({ error: 'invalid_contract_address', address: CONTRACT_ADDRESS })
    const { batchId, priceINR } = req.body || {}
    if (!batchId || !/^[0-9]+$/.test(String(batchId))) return res.status(400).json({ error: 'invalid_batch_id' })
    const code = await client.getBytecode({ address: CONTRACT_ADDRESS })
    if (!code) return res.status(400).json({ error: 'not_a_contract', address: CONTRACT_ADDRESS })
    const inr = BigInt(priceINR ?? 0)
    if (inr <= 0n) return res.status(400).json({ error: 'invalid_price' })
    const tx = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'setPriceByDistributorInr', args: [BigInt(batchId), inr] })
    await client.waitForTransactionReceipt({ hash: tx })
    res.json({ ok: true, tx })
  } catch (e) {
    console.error('set-price-by-distributor failed', e)
    res.status(500).json({ error: 'set_price_failed', message: e?.message || String(e) })
  }
})

// Set retailer sale price (accepts priceINR or priceWei)
app.post('/api/set-price-by-retailer', async (req, res) => {
  try {
    if (!wallet || !account) return res.status(500).json({ error: 'relayer_not_configured' })
    if (!isValidAddress(CONTRACT_ADDRESS)) return res.status(400).json({ error: 'invalid_contract_address', address: CONTRACT_ADDRESS })
    const { batchId, priceINR } = req.body || {}
    if (!batchId || !/^[0-9]+$/.test(String(batchId))) return res.status(400).json({ error: 'invalid_batch_id' })
    const code = await client.getBytecode({ address: CONTRACT_ADDRESS })
    if (!code) return res.status(400).json({ error: 'not_a_contract', address: CONTRACT_ADDRESS })
    const inr = BigInt(priceINR ?? 0)
    if (inr <= 0n) return res.status(400).json({ error: 'invalid_price' })
    const tx = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: AGRI_TRUTH_CHAIN_ABI, functionName: 'setPriceByRetailerInr', args: [BigInt(batchId), inr] })
    await client.waitForTransactionReceipt({ hash: tx })
    res.json({ ok: true, tx })
  } catch (e) {
    console.error('set-price-by-retailer failed', e)
    res.status(500).json({ error: 'set_price_failed', message: e?.message || String(e) })
  }
})
