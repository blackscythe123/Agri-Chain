import express, { Router, Response } from 'express';
import {
    registerVerificationCenter,
    getVerificationCenters,
    updateVerificationStats,
    getVerificationRecord,
    getVerificationsForBatch
} from '../services/verificationService.js';
import type { TypedRequest } from '../types/api.js';
import type { Address } from 'viem';

interface VerificationCenterRequest {
    centerId: string;
    address: string;
    district: string;
    state: string;
    verifierAddress: Address;
    name: string;
    contactInfo?: {
        email: string;
        phone: string;
    };
}

interface VerificationRequest {
    centerId: string;
    batchId: string;
    verifierAddress: Address;
    result: boolean;
    notes?: string;
    testResults?: Record<string, any>;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

const router: Router = express.Router();

/**
 * Register new verification center
 */
router.post('/centers', async (
    req: TypedRequest<VerificationCenterRequest>,
    res: Response<ApiResponse<any>>
) => {
    try {
        const { centerId, address, district, state, verifierAddress } = req.body;

        if (!centerId || !address || !verifierAddress) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                error: 'Center ID, address, and verifier address are required'
            });
        }

        const result = await registerVerificationCenter(req.body);

        res.json({
            success: true,
            message: 'Verification center registered successfully',
            data: result
        });
    } catch (error) {
        console.error('Center registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering verification center',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

/**
 * Get all verification centers
 */
router.get('/centers', async (
    req: TypedRequest<{}>,
    res: Response<ApiResponse<any>>
) => {
    try {
        const { district, status } = req.query;
        const centers = await getVerificationCenters({
            district: district as string,
            status: status === 'true'
        });

        res.json({
            success: true,
            message: 'Verification centers retrieved successfully',
            data: centers
        });
    } catch (error) {
        console.error('Error retrieving centers:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving verification centers',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

/**
 * Record batch verification
 */
router.post('/verify-batch', async (
    req: TypedRequest<VerificationRequest>,
    res: Response<ApiResponse<any>>
) => {
    try {
        const { centerId, batchId, verifierAddress, result } = req.body;

        if (!centerId || !batchId || !verifierAddress) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                error: 'Center ID, batch ID, and verifier address are required'
            });
        }

        const verificationRecord = await updateVerificationStats(req.body);

        res.json({
            success: true,
            message: 'Batch verification recorded successfully',
            data: verificationRecord
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording batch verification',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

/**
 * Get verification records for a batch
 */
router.get('/batch/:batchId', async (
    req: TypedRequest<{ batchId: string }>,
    res: Response<ApiResponse<any>>
) => {
    try {
        const { batchId } = req.params;
        const records = await getVerificationsForBatch(batchId);

        res.json({
            success: true,
            message: 'Verification records retrieved successfully',
            data: records
        });
    } catch (error) {
        console.error('Error retrieving verification records:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving verification records',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

export default router;