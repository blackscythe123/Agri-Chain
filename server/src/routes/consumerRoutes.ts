import express, { Request, Response } from 'express';
import multer from 'multer';
import { uploadFile } from '../services/ipfsService';
import { Address } from 'viem';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

interface ComplaintData {
    batchId: string;
    consumerName: string;
    phone: string;
    complaintType: 'quality' | 'delivery' | 'authenticity' | 'other';
    description?: string;
    purchaseDate?: string;
    retailerName?: string;
    consumerAddress?: Address;
}

interface FeedbackData {
    batchId: string;
    rating: number;
    comment?: string;
    consumerAddress?: Address;
}

/**
 * Consumer complaint submission
 */
router.post('/complaint', upload.array('photos', 5), async (req: Request<{}, {}, ComplaintData>, res: Response) => {
    try {
        const {
            batchId,
            consumerName,
            phone,
            complaintType,
            description,
            purchaseDate,
            retailerName
        } = req.body;

        if (!batchId || !consumerName || !phone || !complaintType) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                error: 'Batch ID, consumer name, phone, and complaint type are required'
            });
        }

        const photos = req.files as Express.Multer.File[];
        const ipfsHashes: string[] = [];

        // Upload photos to IPFS if any
        if (photos && photos.length > 0) {
            for (const photo of photos) {
                const ipfsHash = await uploadFile(photo.buffer);
                if (ipfsHash) {
                    ipfsHashes.push(ipfsHash);
                }
            }
        }

        // TODO: Save complaint to database with IPFS hashes
        const complaintRecord = {
            batchId,
            consumerName,
            phone,
            complaintType,
            description,
            purchaseDate,
            retailerName,
            photos: ipfsHashes,
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'Complaint submitted successfully',
            data: complaintRecord
        });
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting complaint',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Submit product feedback
 */
router.post('/feedback', async (req: Request<{}, {}, FeedbackData>, res: Response) => {
    try {
        const { batchId, rating, comment, consumerAddress } = req.body;

        if (!batchId || rating === undefined || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input',
                error: 'Batch ID and rating (1-5) are required'
            });
        }

        // TODO: Save feedback to database
        const feedbackRecord = {
            batchId,
            rating,
            comment,
            consumerAddress,
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'Feedback submitted successfully',
            data: feedbackRecord
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting feedback',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;