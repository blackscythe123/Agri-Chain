import express, { Router, Request, Response } from 'express';
import { uploadBatchData, getBatchData } from '../services/ipfsService.js';
import { updateBlockchainBatch, getBatchDetails } from '../services/blockchainService.js';
import type { TypedRequest } from '../types/api.js';
import type { BatchData, BlockchainBatch } from '../types/blockchain.js';
import type { Address, Hash } from 'viem';

interface RegisterBatchBody {
    farmerAddress: Address;
    batchData: Omit<BatchData, 'farmerAddress' | 'ipfsHash'>;
}

interface BatchRegistrationResponse {
    success: boolean;
    batchId?: string;
    ipfsHash?: string;
    txHash?: Hash;
    error?: string;
}

interface BatchDetailsResponse {
    success: boolean;
    batchId?: string;
    ipfsHash?: string;
    chainData?: BlockchainBatch;
    error?: string;
}

const router: Router = express.Router();

// Get all batches
router.get('/', async (_req: Request, res: Response) => {
    try {
        // Mock data for development
        const mockBatches = [
            {
                id: "1",
                farmerAddress: "0x1234...5678",
                cropType: "Tomatoes",
                quantityKg: 100,
                basePriceINR: 50,
                currentOwner: "0x1234...5678",
                harvestDate: new Date("2025-09-01").getTime(),
                status: "Active"
            },
            {
                id: "2",
                farmerAddress: "0x5678...9012",
                cropType: "Potatoes",
                quantityKg: 200,
                basePriceINR: 30,
                currentOwner: "0x5678...9012",
                harvestDate: new Date("2025-09-15").getTime(),
                status: "Pending Verification"
            }
        ];

        res.json({
            success: true,
            batches: mockBatches
        });
    } catch (error) {
        console.error('Failed to fetch batches:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

router.post('/register', async (req: TypedRequest<RegisterBatchBody>, res: Response<BatchRegistrationResponse>) => {
    try {
        const { farmerAddress, batchData } = req.body;

        if (!farmerAddress || !batchData) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: farmerAddress or batchData'
            });
        }

        // Add required fields to match BatchData type
        const fullBatchData: BatchData = {
            ...batchData,
            farmerAddress,
            id: batchData.id || `BATCH-${Date.now()}`
        };

        // Upload to IPFS first
        const { ipfsHash } = await uploadBatchData(fullBatchData);

        // Update blockchain with IPFS hash
        const txHash = await updateBlockchainBatch({
            ...fullBatchData,
            ipfsHash
        });

        res.json({
            success: true,
            batchId: batchData.id,
            ipfsHash,
            txHash
        });
    } catch (error) {
        console.error('Batch registration failed:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

router.get('/:batchId', async (req: Request<{ batchId: string }>, res: Response<BatchDetailsResponse>) => {
    try {
        const { batchId } = req.params;

        if (!batchId) {
            return res.status(400).json({
                success: false,
                error: 'Batch ID is required'
            });
        }

        // Get blockchain data first
        const chainData = await getBatchDetails(batchId);

        // Then get IPFS data if available
        const ipfsData = chainData.ipfsHash ? await getBatchData(chainData.ipfsHash) : null;

        res.json({
            success: true,
            batchId,
            ipfsHash: chainData.ipfsHash,
            chainData: {
                ...chainData,
                ...ipfsData?.data
            }
        });
    } catch (error) {
        console.error('Batch retrieval failed:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

export default router;