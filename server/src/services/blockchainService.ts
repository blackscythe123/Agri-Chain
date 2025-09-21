import { createWalletClient, http, createPublicClient, Address, Hash } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import { AGRI_TRUTH_CHAIN_ABI, AGRI_TRUTH_CHAIN_ADDRESS } from '../contract.js';
import { BatchData, BlockchainBatch, PaymentVerification } from '../types/blockchain.js';

// Initialize wallet client
const relayerKey = process.env.RELAYER_PRIVATE_KEY;
let account;

if (process.env.NODE_ENV === 'development' && !relayerKey) {
    // Use a dummy key for development
    account = privateKeyToAccount('0x1234567890123456789012345678901234567890123456789012345678901234');
} else if (relayerKey) {
    // Clean and validate the key for production
    const cleanKey = relayerKey.replace('0x', '').trim();
    if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
        throw new Error('Invalid private key format. Expected 32 bytes hex string (with or without 0x prefix)');
    }
    // Ensure 0x prefix for viem
    const formattedKey = `0x${cleanKey}`;
    account = privateKeyToAccount(formattedKey);
} else {
    throw new Error('RELAYER_PRIVATE_KEY is required in production environment');
}

const walletClient = createWalletClient({
    account,
    chain: arbitrumSepolia,
    transport: http(process.env.ARB_SEPOLIA_RPC_URL)
});

const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(process.env.ARB_SEPOLIA_RPC_URL)
});

export async function updateBlockchainBatch(batchData: BatchData): Promise<Hash> {
    try {
        const { hash } = await walletClient.writeContract({
            address: AGRI_TRUTH_CHAIN_ADDRESS,
            abi: AGRI_TRUTH_CHAIN_ABI,
            functionName: 'updateBatch',
            args: [
                batchData.id,
                batchData.farmerAddress,
                batchData.ipfsHash || '',
                BigInt(batchData.quantity),
                batchData.qualityGrade || 0
            ]
        });
        return hash;
    } catch (error) {
        console.error('Error updating blockchain batch:', error);
        throw error;
    }
}

export async function getBatchDetails(batchId: string): Promise<BlockchainBatch> {
    try {
        const data = await publicClient.readContract({
            address: AGRI_TRUTH_CHAIN_ADDRESS,
            abi: AGRI_TRUTH_CHAIN_ABI,
            functionName: 'getBatch',
            args: [batchId]
        });
        return transformBatchData(data);
    } catch (error) {
        console.error('Error getting batch details:', error);
        throw error;
    }
}

export async function verifyBatch(batchId: string, verifierAddress: Address): Promise<Hash> {
    try {
        const { hash } = await walletClient.writeContract({
            address: AGRI_TRUTH_CHAIN_ADDRESS,
            abi: AGRI_TRUTH_CHAIN_ABI,
            functionName: 'verifyBatch',
            args: [batchId, true]
        });
        return hash;
    } catch (error) {
        console.error('Error verifying batch:', error);
        throw error;
    }
}

export async function logPayment(
    batchId: string,
    payer: Address,
    payee: Address,
    amount: bigint
): Promise<Hash> {
    try {
        const { hash } = await walletClient.writeContract({
            address: AGRI_TRUTH_CHAIN_ADDRESS,
            abi: AGRI_TRUTH_CHAIN_ABI,
            functionName: 'logPayment',
            args: [batchId, payer, payee, amount]
        });
        return hash;
    } catch (error) {
        console.error('Error logging payment:', error);
        throw error;
    }
}

function transformBatchData(data: any): BlockchainBatch {
    return {
        id: data.id,
        farmerAddress: data.farmerAddress,
        currentOwner: data.currentOwner,
        productName: data.productName,
        quantity: Number(data.quantity),
        price: Number(data.price),
        date: new Date(Number(data.timestamp) * 1000).toISOString(),
        location: data.location,
        isVerified: data.isVerified,
        ipfsHash: data.ipfsHash,
        transferHistory: data.transfers.map((t: any) => ({
            from: t.from,
            to: t.to,
            timestamp: Number(t.timestamp),
            price: Number(t.price)
        }))
    };
}