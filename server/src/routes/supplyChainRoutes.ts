import express, { Router, Response } from 'express';
import { updateBlockchainBatch, getBatchDetails } from '../services/blockchainService.js';
import type { TypedRequest } from '../types/api.js';
import type { Hash } from 'viem';
import type { BatchData } from '../types/blockchain.js';

enum SupplyChainStage {
    FARMER_TO_DISTRIBUTOR = 1,
    DISTRIBUTOR_TO_RETAILER = 2,
    RETAILER_TO_CONSUMER = 3
}

interface QuantityUpdateRequest {
    batchId: string;
    stage: keyof typeof SupplyChainStage;
    actualQuantity: number;
    qualityGrade?: number;
    temperature?: number;
    humidity?: number;
    transferNotes?: string;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    txHash?: Hash;
}

const router: Router = express.Router();

function getStageNumber(stage: string): SupplyChainStage | 0 {
    const stageKey = stage.toUpperCase().replace(/-/g, '_') as keyof typeof SupplyChainStage;
    return SupplyChainStage[stageKey] || 0;
}

/**
 * Update delivered quantity when transferring between supply chain stages
 */
router.post('/update-quantity', async (
    req: TypedRequest<QuantityUpdateRequest>,
    res: Response<ApiResponse<{ batchId: string }>>
) => {
    try {
        const {
            batchId,
            stage,
            actualQuantity,
            qualityGrade,
            temperature,
            humidity,
            transferNotes
        } = req.body;

        if (!batchId || !stage || actualQuantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                error: 'Batch ID, stage, and actual quantity are required'
            });
        }

        const stageNumber = getStageNumber(stage);
        if (stageNumber === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid stage',
                error: 'Stage must be one of: farmer_to_distributor, distributor_to_retailer, retailer_to_consumer'
            });
        }

        const txHash = await updateBlockchainBatch({
            id: batchId,
            quantity: actualQuantity,
            qualityGrade: qualityGrade || 0,
            stageData: {
                stage: stageNumber,
                temperature,
                humidity,
                transferNotes,
                timestamp: Date.now()
            }
        } as BatchData);

        res.json({
            success: true,
            message: 'Quantity updated successfully',
            data: { batchId },
            txHash
        });
    } catch (error) {
        console.error('Quantity update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating quantity',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

/**
 * Get supply chain stage details for a batch
 */
router.get('/stage/:batchId', async (
    req: TypedRequest<{ batchId: string }>,
    res: Response<ApiResponse<any>>
) => {
    try {
        const { batchId } = req.params;

        if (!batchId) {
            return res.status(400).json({
                success: false,
                message: 'Missing batch ID',
                error: 'Batch ID is required'
            });
        }

        const batchData = await getBatchDetails(batchId);

        res.json({
            success: true,
            message: 'Stage details retrieved successfully',
            data: {
                batchId,
                currentStage: batchData.stageData?.stage || 0,
                quantity: batchData.quantity,
                lastUpdate: batchData.stageData?.timestamp
                    ? new Date(batchData.stageData.timestamp).toISOString()
                    : new Date().toISOString(),
                qualityGrade: batchData.qualityGrade,
                metadata: batchData.stageData
            }
        });
    } catch (error) {
        console.error('Stage retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving stage details',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

export default router;