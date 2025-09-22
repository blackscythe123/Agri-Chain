import { create } from 'ipfs-http-client'

const hasCreds = !!(process.env.IPFS_PROJECT_ID && process.env.IPFS_API_SECRET)
const ipfs = hasCreds ? create({
    host: process.env.IPFS_HOST || 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: `Basic ${Buffer.from(`${process.env.IPFS_PROJECT_ID}:${process.env.IPFS_API_SECRET}`).toString('base64')}`
    }
}) : null

export async function uploadBatchData(batchData) {
    const jsonData = JSON.stringify(batchData)
    if (!ipfs) {
        // Fallback: no IPFS creds; return inline meta so the system still works
        return `meta:${jsonData}`
    }
    const result = await ipfs.add(jsonData, { pin: true })
    return result.path
}

export async function getBatchData(ipfsHash) {
    if (!ipfs || (typeof ipfsHash === 'string' && ipfsHash.startsWith('meta:'))) {
        try { return JSON.parse(String(ipfsHash).slice(5)) } catch { return null }
    }
    const stream = ipfs.cat(ipfsHash)
    let data = ''
    for await (const chunk of stream) data += new TextDecoder().decode(chunk)
    return JSON.parse(data)
}

export async function uploadFile(fileBuffer, filename) {
    if (!ipfs) return `meta:file:${filename}`
    const result = await ipfs.add({ path: filename, content: fileBuffer }, { pin: true })
    return result.path
}

export async function getFile(ipfsHash) {
    if (!ipfs) return Buffer.from('')
    const stream = ipfs.cat(ipfsHash)
    const chunks = []
    for await (const chunk of stream) chunks.push(chunk)
    return Buffer.concat(chunks)
}


