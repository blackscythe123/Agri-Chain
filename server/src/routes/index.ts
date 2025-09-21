import express from 'express';
import farmerRoutes from './farmerRoutes.js';
import verificationRoutes from './verificationRoutes.js';
import supplyChainRoutes from './supplyChainRoutes.js';
import consumerRoutes from './consumerRoutes.js';
import batchRoutes from './batchRoutes.js';

const router = express.Router();

router.use('/farmers', farmerRoutes);
router.use('/verification', verificationRoutes);
router.use('/supply-chain', supplyChainRoutes);
router.use('/consumer', consumerRoutes);
router.use('/batch', batchRoutes);

export default router;