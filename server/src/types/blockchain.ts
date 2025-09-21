import { Address } from 'viem';

export enum SupplyChainStage {
    FARMER_TO_DISTRIBUTOR = 1,
    DISTRIBUTOR_TO_RETAILER = 2,
    RETAILER_TO_CONSUMER = 3
}

export interface StageData {
    stage: SupplyChainStage;
    temperature?: number;
    humidity?: number;
    transferNotes?: string;
    timestamp: number;
}

export interface BatchData {
    id: string;
    farmerAddress: Address;
    productName: string;
    quantity: number;
    price: number;
    date: string;
    location: string;
    certifications?: string[];
    ipfsHash?: string;
    qualityGrade?: number;
    stageData?: StageData;
}

export interface BlockchainBatch extends BatchData {
    currentOwner: Address;
    isVerified: boolean;
    transferHistory: Transfer[];
}

export interface Transfer {
    from: Address;
    to: Address;
    timestamp: number;
    price: number;
}

export interface PaymentVerification {
    batchId: string;
    payer: Address;
    payee: Address;
    amount: number;
    timestamp: number;
}