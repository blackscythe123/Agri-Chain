import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createPublicClient, createWalletClient, decodeEventLog, http, Address, PublicClient, WalletClient, Account } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import { AGRI_TRUTH_CHAIN_ABI, AGRI_TRUTH_CHAIN_ADDRESS } from './contract.js';

// Import route files
import farmerRoutes from './routes/farmerRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import supplyChainRoutes from './routes/supplyChainRoutes.js';
import consumerRoutes from './routes/consumerRoutes.js';
import verifierRoutes from './routes/verifierRoutes.js';
import batchRoutes from './routes/batchRoutes.js';

// Default EOAs for testing when inputs are missing
const DEFAULT_ADDRESSES: Record<string, Address> = {
    FARMER: '0x1111111111111111111111111111111111111111',
    DISTRIBUTOR: '0x2222222222222222222222222222222222222222',
    RETAILER: '0x3333333333333333333333333333333333333333',
    CONSUMER: '0x4444444444444444444444444444444444444444',
} as const;

// In-memory idempotency guards for Stripe sessions to avoid duplicate writes
const processedSessions = new Set<string>();
const processingSessions = new Set<string>();

// Load env from server/.env explicitly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
const port = process.env.PORT || 3001;
const rpcUrl = process.env.ARB_SEPOLIA_RPC_URL;
const transport = rpcUrl ? http(rpcUrl) : http();
const client: PublicClient = createPublicClient({ chain: arbitrumSepolia, transport });

const relayerKey = process.env.RELAYER_PRIVATE_KEY;
const account: Account | undefined = relayerKey
    ? privateKeyToAccount(relayerKey.startsWith('0x') ? relayerKey : ('0x' + relayerKey))
    : undefined;

const wallet: WalletClient | undefined = account
    ? createWalletClient({ account, chain: arbitrumSepolia, transport })
    : undefined;

const ownerKey = process.env.OWNER_PRIVATE_KEY;
const ownerAccount: Account | undefined = ownerKey
    ? privateKeyToAccount(ownerKey.startsWith('0x') ? ownerKey : ('0x' + ownerKey))
    : undefined;

const ownerWallet: WalletClient | undefined = ownerAccount
    ? createWalletClient({ account: ownerAccount, chain: arbitrumSepolia, transport })
    : undefined;

const CONTRACT_ADDRESS = process.env.AGRI_TRUTH_CHAIN_ADDRESS || AGRI_TRUTH_CHAIN_ADDRESS;

const isValidAddress = (addr: unknown): addr is Address =>
    typeof addr === 'string' && /^0x[0-9a-fA-F]{40}$/.test(addr);

const isSameAddress = (a: Address | undefined, b: Address | undefined): boolean =>
    (a && b) ? a.toLowerCase() === b.toLowerCase() : false;

// Configure middleware
app.use(cors({
    origin: 'http://localhost:8000',
    credentials: true
}));
app.use(bodyParser.json());

// Define a type for our enhanced Express request
declare global {
    namespace Express {
        interface Request {
            client?: typeof client;
            wallet?: typeof wallet;
            ownerWallet?: typeof ownerWallet;
        }
    }
}

// Middleware to inject blockchain clients
app.use((req, _, next) => {
    req.client = client;
    req.wallet = wallet;
    req.ownerWallet = ownerWallet;
    next();
});

// CORS middleware
app.use((_, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Mount routes
app.use('/api/batches', batchRoutes);
app.use('/api', farmerRoutes);
app.use('/api', verificationRoutes);
app.use('/api', supplyChainRoutes);
app.use('/api', consumerRoutes);
app.use('/api/verifier', verifierRoutes);

// Error handling middleware
app.use((err: Error, _: Request, res: Response) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});