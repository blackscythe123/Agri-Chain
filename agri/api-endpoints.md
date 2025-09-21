# API Endpoints Implementation for AgriChain

Based on the conversation documents, here are the essential API endpoints that need to be implemented:

## 1. Farmer and Verification APIs

### File: `server/src/routes/farmerRoutes.js`

```javascript
import express from 'express';
import { searchFarmerInDatabase, registerNewFarmer } from '../services/farmerService.js';

const router = express.Router();

/**
 * Search farmer by Aadhaar in government databases
 */
router.get('/search', async (req, res) => {
    try {
        const { aadhaar } = req.query;
        
        if (!aadhaar || aadhaar.length < 12) {
            return res.status(400).json({
                success: false,
                message: 'Valid Aadhaar number required'
            });
        }

        // Search in multiple databases
        const farmerData = await searchFarmerInDatabase(aadhaar);
        
        if (farmerData) {
            res.json({
                success: true,
                farmer: {
                    name: farmerData.name,
                    aadhaar: maskAadhaar(aadhaar),
                    location: farmerData.location,
                    landSize: farmerData.landSize,
                    registeredCrops: farmerData.crops,
                    verificationStatus: farmerData.isVerified
                }
            });
        } else {
            res.json({
                success: false,
                message: 'Farmer not found in database'
            });
        }
    } catch (error) {
        console.error('Farmer search error:', error);
        res.status(500).json({
            success: false,
            message: 'Database search failed',
            error: error.message
        });
    }
});

/**
 * Register new farmer if not found in database
 */
router.post('/register', async (req, res) => {
    try {
        const {
            aadhaar,
            name,
            phone,
            village,
            district,
            landSize,
            bankAccount
        } = req.body;

        // Validate required fields
        if (!aadhaar || !name || !village) {
            return res.status(400).json({
                success: false,
                message: 'Aadhaar, name, and village are required'
            });
        }

        const farmerData = await registerNewFarmer({
            aadhaar: maskAadhaar(aadhaar),
            name,
            phone,
            location: `${village}, ${district}`,
            landSize: parseFloat(landSize) || 0,
            bankAccount,
            registrationDate: new Date().toISOString(),
            status: 'pending_verification'
        });

        res.json({
            success: true,
            message: 'Farmer registered successfully',
            farmer: farmerData
        });
    } catch (error) {
        console.error('Farmer registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

// Helper function to mask Aadhaar for privacy
function maskAadhaar(aadhaar) {
    return aadhaar.replace(/\d(?=\d{4})/g, 'X');
}

export default router;
```

### File: `server/src/routes/verificationRoutes.js`

```javascript
import express from 'express';
import { 
    registerVerificationCenter, 
    getVerificationCenters,
    updateVerificationStats 
} from '../services/verificationService.js';

const router = express.Router();

/**
 * Register new verification center
 */
router.post('/centers', async (req, res) => {
    try {
        const {
            centerId,
            location,
            operatorId,
            operatorName,
            coverageVillages,
            equipment
        } = req.body;

        const centerData = await registerVerificationCenter({
            centerId,
            location,
            operatorId,
            operatorName,
            coverageVillages: coverageVillages || [],
            equipment: equipment || [],
            status: 'active',
            createdAt: new Date().toISOString(),
            totalVerifications: 0
        });

        res.json({
            success: true,
            message: 'Verification center registered',
            center: centerData
        });
    } catch (error) {
        console.error('Center registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Center registration failed',
            error: error.message
        });
    }
});

/**
 * Get all verification centers
 */
router.get('/centers', async (req, res) => {
    try {
        const { district, status } = req.query;
        
        const centers = await getVerificationCenters({
            district,
            status: status || 'active'
        });

        res.json({
            success: true,
            centers: centers
        });
    } catch (error) {
        console.error('Centers fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch centers',
            error: error.message
        });
    }
});

/**
 * Verify batch sample at verification center
 */
router.post('/verify-batch', async (req, res) => {
    try {
        const {
            farmerAadhaar,
            estimatedQuantity,
            sampleWeight,
            qualityGrade,
            moistureContent,
            verificationCenterId,
            verifierPhoto,
            testingNotes
        } = req.body;

        // Validate inputs
        if (!farmerAadhaar || !estimatedQuantity || !sampleWeight || !qualityGrade) {
            return res.status(400).json({
                success: false,
                message: 'Missing required verification data'
            });
        }

        // Create verification record
        const verificationData = {
            farmerAadhaar: maskAadhaar(farmerAadhaar),
            estimatedQuantity: parseInt(estimatedQuantity),
            sampleWeight: parseFloat(sampleWeight),
            qualityGrade,
            moistureContent: moistureContent ? parseFloat(moistureContent) : null,
            verificationCenterId,
            timestamp: new Date().toISOString(),
            verifierPhoto,
            testingNotes,
            status: 'verified'
        };

        // This would trigger the batch registration process
        const batchId = await createVerifiedBatch(verificationData);

        // Update center statistics
        await updateVerificationStats(verificationCenterId);

        res.json({
            success: true,
            message: 'Batch verified successfully',
            batchId,
            verificationData
        });
    } catch (error) {
        console.error('Batch verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Batch verification failed',
            error: error.message
        });
    }
});

export default router;
```

## 2. Supply Chain Tracking APIs

### File: `server/src/routes/supplyChainRoutes.js`

```javascript
import express from 'express';
import { updateBlockchainBatch, getBatchFromChain } from '../services/blockchainService.js';

const router = express.Router();

/**
 * Update delivered quantity when transferring between supply chain stages
 */
router.post('/update-quantity', async (req, res) => {
    try {
        const {
            batchId,
            actualQuantity,
            stage,
            receivingParty,
            conditionOnArrival,
            storageConditions,
            notes
        } = req.body;

        // Validate stage transition
        const validStages = ['farmer_to_distributor', 'distributor_to_retailer', 'retailer_to_consumer'];
        if (!validStages.includes(stage)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid supply chain stage'
            });
        }

        // Update blockchain
        const updateData = {
            batchId,
            actualQuantity: parseInt(actualQuantity),
            stage: getStageNumber(stage),
            timestamp: new Date().toISOString(),
            verifier: req.body.verifierAddress // From authentication
        };

        const txHash = await updateBlockchainBatch(updateData);

        // Store additional metadata in database
        const supplyChainRecord = {
            batchId,
            stage,
            actualQuantity: parseInt(actualQuantity),
            receivingParty,
            conditionOnArrival,
            storageConditions,
            notes,
            timestamp: new Date().toISOString(),
            transactionHash: txHash
        };

        // Save to database for detailed tracking
        await saveSupplyChainRecord(supplyChainRecord);

        res.json({
            success: true,
            message: 'Quantity updated successfully',
            transactionHash: txHash,
            supplyChainRecord
        });
    } catch (error) {
        console.error('Quantity update error:', error);
        res.status(500).json({
            success: false,
            message: 'Quantity update failed',
            error: error.message
        });
    }
});

/**
 * Distributor receiving verification
 */
router.post('/distributor/receive', async (req, res) => {
    try {
        const {
            batchId,
            expectedQuantity,
            actualQuantity,
            conditionOnArrival,
            temperatureLog,
            qualityGrade,
            storageConditions,
            photos
        } = req.body;

        // Calculate quantity variance
        const quantityVariance = ((actualQuantity - expectedQuantity) / expectedQuantity) * 100;
        
        // Flag significant discrepancies
        if (Math.abs(quantityVariance) > 10) {
            // Require explanation for >10% variance
            return res.status(400).json({
                success: false,
                message: `Quantity variance ${quantityVariance.toFixed(1)}% requires explanation`,
                requiresExplanation: true
            });
        }

        const distributorVerification = {
            batchId,
            stage: 'distributor_receiving',
            expectedQuantity: parseInt(expectedQuantity),
            actualQuantity: parseInt(actualQuantity),
            quantityVariance,
            conditionOnArrival,
            temperatureLog: temperatureLog ? parseFloat(temperatureLog) : null,
            qualityGrade,
            storageConditions,
            photos: photos || [],
            timestamp: new Date().toISOString(),
            verifiedBy: req.body.distributorId
        };

        // Update blockchain with actual received quantity
        await updateBlockchainBatch({
            batchId,
            actualQuantity: parseInt(actualQuantity),
            stage: 1, // Distributor stage
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Distributor verification completed',
            verification: distributorVerification
        });
    } catch (error) {
        console.error('Distributor verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Distributor verification failed',
            error: error.message
        });
    }
});

/**
 * Retailer inventory management
 */
router.post('/retailer/inventory', async (req, res) => {
    try {
        const {
            batchId,
            receivedQuantity,
            displayLocation,
            shelfLife,
            displayConditions,
            sellByDate
        } = req.body;

        const retailerInventory = {
            batchId,
            stage: 'retailer_inventory',
            receivedQuantity: parseInt(receivedQuantity),
            displayLocation,
            shelfLife: parseInt(shelfLife),
            displayConditions,
            sellByDate: new Date(sellByDate).toISOString(),
            status: 'available',
            timestamp: new Date().toISOString(),
            retailerId: req.body.retailerId
        };

        // Update blockchain
        await updateBlockchainBatch({
            batchId,
            actualQuantity: parseInt(receivedQuantity),
            stage: 2, // Retailer stage
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Retailer inventory updated',
            inventory: retailerInventory
        });
    } catch (error) {
        console.error('Retailer inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'Retailer inventory update failed',
            error: error.message
        });
    }
});

// Helper functions
function getStageNumber(stage) {
    const stageMap = {
        'farmer_to_distributor': 1,
        'distributor_to_retailer': 2,
        'retailer_to_consumer': 3
    };
    return stageMap[stage] || 0;
}

export default router;
```

## 3. Consumer Feedback and Complaint APIs

### File: `server/src/routes/consumerRoutes.js`

```javascript
import express from 'express';
import multer from 'multer';
import { uploadFile } from '../services/ipfsService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * Consumer complaint submission
 */
router.post('/complaint', upload.array('photos', 5), async (req, res) => {
    try {
        const {
            batchId,
            consumerPhone,
            issueType,
            description,
            location,
            purchaseDate
        } = req.body;

        // Validate batch exists
        const batch = await getBatchFromChain(batchId);
        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        // Upload complaint photos to IPFS
        let photoHashes = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const photoHash = await uploadFile(file.buffer, file.originalname);
                photoHashes.push({
                    filename: file.originalname,
                    ipfsHash: photoHash,
                    size: file.size
                });
            }
        }

        const complaint = {
            id: generateComplaintId(),
            batchId,
            consumerPhone: maskPhone(consumerPhone),
            issueType,
            description,
            location,
            purchaseDate: new Date(purchaseDate).toISOString(),
            photos: photoHashes,
            status: 'submitted',
            timestamp: new Date().toISOString(),
            resolution: null
        };

        // Save complaint to database
        await saveComplaint(complaint);

        // Notify relevant parties
        await notifySupplyChainParties(batchId, complaint);

        res.json({
            success: true,
            message: 'Complaint submitted successfully',
            complaintId: complaint.id,
            expectedResolution: '48 hours'
        });
    } catch (error) {
        console.error('Complaint submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Complaint submission failed',
            error: error.message
        });
    }
});

/**
 * Consumer rating submission
 */
router.post('/rating', async (req, res) => {
    try {
        const {
            batchId,
            rating,
            review,
            categories
        } = req.body;

        // Validate rating (1-5 stars)
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const ratingData = {
            id: generateRatingId(),
            batchId,
            rating: parseInt(rating),
            review: review || '',
            categories: categories || {}, // Quality, freshness, packaging etc.
            timestamp: new Date().toISOString(),
            verified: true // Since they have the batch ID
        };

        // Save rating
        await saveRating(ratingData);

        // Update aggregate rating for batch
        await updateBatchRating(batchId);

        res.json({
            success: true,
            message: 'Rating submitted successfully',
            rating: ratingData
        });
    } catch (error) {
        console.error('Rating submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Rating submission failed',
            error: error.message
        });
    }
});

/**
 * Get batch ratings and reviews
 */
router.get('/batch/:batchId/ratings', async (req, res) => {
    try {
        const { batchId } = req.params;
        
        const ratings = await getBatchRatings(batchId);
        const averageRating = await getBatchAverageRating(batchId);
        const totalRatings = ratings.length;

        res.json({
            success: true,
            data: {
                batchId,
                averageRating: averageRating || 0,
                totalRatings,
                ratings: ratings.map(r => ({
                    rating: r.rating,
                    review: r.review,
                    categories: r.categories,
                    timestamp: r.timestamp
                }))
            }
        });
    } catch (error) {
        console.error('Ratings fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch ratings',
            error: error.message
        });
    }
});

// Helper functions
function generateComplaintId() {
    return `COMPLAINT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateRatingId() {
    return `RATING-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function maskPhone(phone) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

export default router;
```

## 4. Integration with Government APIs

### File: `server/src/routes/integrationRoutes.js`

```javascript
import express from 'express';
import { 
    syncWithKrushakOdisha,
    verifyWithOSOCA,
    checkAPEDACompliance 
} from '../services/governmentIntegration.js';

const router = express.Router();

/**
 * Sync farmer data with Krushak Odisha database
 */
router.post('/krushak-sync', async (req, res) => {
    try {
        const { aadhaar } = req.body;
        
        const farmerData = await syncWithKrushakOdisha(aadhaar);
        
        if (farmerData) {
            res.json({
                success: true,
                message: 'Farmer data synchronized',
                data: {
                    name: farmerData.name,
                    landRecords: farmerData.landRecords,
                    cropsRegistered: farmerData.cropsRegistered,
                    schemesBenefited: farmerData.schemesBenefited,
                    lastUpdated: farmerData.lastUpdated
                }
            });
        } else {
            res.json({
                success: false,
                message: 'Farmer not found in Krushak Odisha'
            });
        }
    } catch (error) {
        console.error('Krushak sync error:', error);
        res.status(500).json({
            success: false,
            message: 'Synchronization failed',
            error: error.message
        });
    }
});

/**
 * Verify organic certification with OSOCA
 */
router.post('/osoca-verify', async (req, res) => {
    try {
        const { farmerAadhaar, cropType, landSurveyNumber } = req.body;
        
        const certificationData = await verifyWithOSOCA({
            farmerAadhaar,
            cropType,
            landSurveyNumber
        });
        
        res.json({
            success: true,
            message: 'OSOCA verification completed',
            certification: {
                isOrganic: certificationData.isOrganic,
                certificationNumber: certificationData.certNumber,
                validUntil: certificationData.validUntil,
                certifyingBody: certificationData.certifyingBody,
                scope: certificationData.scope
            }
        });
    } catch (error) {
        console.error('OSOCA verification error:', error);
        res.status(500).json({
            success: false,
            message: 'OSOCA verification failed',
            error: error.message
        });
    }
});

/**
 * Check APEDA export compliance
 */
router.post('/apeda-compliance', async (req, res) => {
    try {
        const { batchId, cropType, destinationCountry } = req.body;
        
        const complianceCheck = await checkAPEDACompliance({
            batchId,
            cropType,
            destinationCountry
        });
        
        res.json({
            success: true,
            message: 'APEDA compliance check completed',
            compliance: {
                isCompliant: complianceCheck.isCompliant,
                requirements: complianceCheck.requirements,
                documentation: complianceCheck.requiredDocs,
                traceabilityScore: complianceCheck.traceabilityScore
            }
        });
    } catch (error) {
        console.error('APEDA compliance error:', error);
        res.status(500).json({
            success: false,
            message: 'APEDA compliance check failed',
            error: error.message
        });
    }
});

export default router;
```

## 5. Main Server Integration

### Update your `server/src/index.js`:

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import route files
import batchRoutes from './routes/batchRoutes.js';
import farmerRoutes from './routes/farmerRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import supplyChainRoutes from './routes/supplyChainRoutes.js';
import consumerRoutes from './routes/consumerRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', batchRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/supply-chain', supplyChainRoutes);
app.use('/api/consumer', consumerRoutes);
app.use('/api/integration', integrationRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`AgriChain server running on port ${PORT}`);
});
```

## Installation Instructions

1. **Install new dependencies:**
```bash
cd server
npm install multer
```

2. **Update your environment variables** in `server/.env`:
```bash
# Government API configurations
KRUSHAK_ODISHA_API_URL=https://krushak.odisha.gov.in/api
OSOCA_API_URL=https://osoca.nic.in/api
APEDA_API_URL=https://apeda.gov.in/api

# Add any required API keys
GOVERNMENT_API_KEY=your_api_key_here
```

3. **Test the APIs:**
```bash
# Test farmer search
curl -X GET "http://localhost:3001/api/farmers/search?aadhaar=1234567890"

# Test batch verification
curl -X POST http://localhost:3001/api/verification/verify-batch \
  -H "Content-Type: application/json" \
  -d '{"farmerAadhaar":"1234567890","estimatedQuantity":"50","qualityGrade":"A"}'
```

These APIs provide complete functionality for:
- Farmer registration and search
- Verification center operations
- Supply chain tracking at all stages
- Consumer feedback and complaints
- Government database integration
- Quality and quantity verification workflows