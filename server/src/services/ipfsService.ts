import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import type { IPFSHTTPClient } from 'ipfs-http-client';
import { IPFSData, IPFSBatchData, IPFSUploadResponse } from '../types/ipfs.js';
import { BatchData } from '../types/blockchain.js';

// Create IPFS client
const ipfs: IPFSHTTPClient = create({
    host: process.env.IPFS_HOST || 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: 'Basic ' + Buffer.from(
            `${process.env.IPFS_PROJECT_ID}:${process.env.IPFS_API_SECRET}`
        ).toString('base64')
    }
});

export async function uploadFile(fileBuffer: Buffer, filename: string): Promise<IPFSUploadResponse> {
    try {
        const result = await ipfs.add({
            path: filename,
            content: fileBuffer
        });

        return {
            ipfsHash: result.path,
            size: result.size,
            timestamp: Date.now()
        };
    } catch (error) {
        console.error('File upload to IPFS failed:', error);
        throw new Error(`File upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function uploadBatchData(batchData: BatchData): Promise<IPFSUploadResponse> {
    try {
        const ipfsData: IPFSBatchData = {
            data: batchData,
            metadata: {
                timestamp: Date.now(),
                version: '1.0'
            }
        };

        const result = await ipfs.add(JSON.stringify(ipfsData));

        return {
            ipfsHash: result.path,
            size: result.size,
            timestamp: Date.now()
        };
    } catch (error) {
        console.error('IPFS upload failed:', error);
        throw new Error(`IPFS upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function getBatchData(ipfsHash: string): Promise<IPFSBatchData> {
    try {
        const chunks: Uint8Array[] = [];
        for await (const chunk of ipfs.cat(ipfsHash)) {
            chunks.push(chunk);
        }
        const data = Buffer.concat(chunks).toString();
        return JSON.parse(data);
    } catch (error) {
        console.error('IPFS retrieval failed:', error);
        throw new Error(`IPFS retrieval failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}