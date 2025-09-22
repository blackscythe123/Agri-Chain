import IPFS from 'ipfs-http-client'

const projectId = process.env.IPFS_PROJECT_ID
const projectSecret = process.env.IPFS_API_SECRET
const host = process.env.IPFS_HOST || 'ipfs.infura.io'

let client
if (projectId && projectSecret) {
    const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')
    client = IPFS.create({ host, protocol: 'https', port: 5001, headers: { authorization: auth } })
} else {
    console.warn('IPFS credentials not set, using fallback meta:')
    client = null
}

// Upload batch metadata to IPFS (or fallback)
export async function uploadToIPFS(data) {
    if (!client) {
        console.log('IPFS fallback active, returning meta placeholder')
        return 'meta:' + Buffer.from(JSON.stringify(data)).toString('base64')
    }
    const { cid } = await client.add(JSON.stringify(data))
    return cid.toString()
}

// Example function for writing to blockchain
export async function registerBatchOnChain(batchId, ipfsHash) {
    // your smart contract call here (Arbitrum Sepolia)
    // return a dummy object for now
    return { txHash: '0xDUMMY_TX_HASH', batchId, ipfsHash }
}
