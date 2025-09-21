import express, { Router, Response } from 'express';
import { searchFarmerInDatabase, registerNewFarmer } from '../services/farmerService.js';
import type { TypedRequest } from '../types/api.js';
import type { Address } from 'viem';

interface FarmerData {
    name: string;
    aadhaar: string;
    state: string;
    district: string;
    village: string;
    landSize?: number;
    crops?: string[];
    certifications?: string[];
    walletAddress?: Address;
}

interface FarmerRegistrationRequest {
    aadhaar: string;
    walletAddress: Address;
    phoneNumber?: string;
    email?: string;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

const router: Router = express.Router();

/**
 * Mask sensitive Aadhaar number
 */
function maskAadhaar(aadhaar: string): string {
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
}

/**
 * Search farmer by Aadhaar in government databases
 */
router.get('/search', async (
    req: TypedRequest<{}> & { query: { aadhaar?: string } },
    res: Response<ApiResponse<FarmerData>>
) => {
    try {
        const { aadhaar } = req.query;

        if (!aadhaar || aadhaar.length !== 12) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Aadhaar number',
                error: 'Aadhaar must be 12 digits'
            });
        }

        // Search in multiple databases
        const farmerData = await searchFarmerInDatabase(aadhaar);

        if (farmerData) {
            res.json({
                success: true,
                message: 'Farmer found',
                data: {
                    ...farmerData,
                    aadhaar: maskAadhaar(aadhaar)
                }
            });
        } else {
            res.json({
                success: false,
                message: 'Farmer not found'
            });
        }
    } catch (error) {
        console.error('Farmer search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching for farmer',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

/**
 * Register new farmer if not found in database
 */
router.post('/register', async (
    req: TypedRequest<FarmerRegistrationRequest>,
    res: Response<ApiResponse<FarmerData>>
) => {
    try {
        const { aadhaar, walletAddress, phoneNumber, email } = req.body;

        if (!aadhaar || !walletAddress) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                error: 'Aadhaar and wallet address are required'
            });
        }

        // Check if farmer already exists
        const existingFarmer = await searchFarmerInDatabase(aadhaar);
        if (existingFarmer?.walletAddress) {
            return res.status(409).json({
                success: false,
                message: 'Farmer already registered',
                error: 'This Aadhaar is already associated with a wallet'
            });
        }

        // Register new farmer
        const registeredFarmer = await registerNewFarmer({
            aadhaar,
            walletAddress,
            phoneNumber,
            email
        });

        res.json({
            success: true,
            message: 'Farmer registered successfully',
            data: {
                ...registeredFarmer,
                aadhaar: maskAadhaar(aadhaar)
            }
        });
    } catch (error) {
        console.error('Farmer registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering farmer',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

export default router;