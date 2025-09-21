import { Request } from 'express';
import { BatchData } from './blockchain';

export interface TypedRequest<T> extends Request {
    body: T;
}

export interface RegisterBatchRequest {
    farmerAddress: string;
    batchData: Omit<BatchData, 'farmerAddress' | 'ipfsHash'>;
}

export interface VerifyBatchRequest {
    batchId: string;
    verifierAddress: string;
    isVerified: boolean;
}

export interface PaymentConfirmationRequest {
    batchId: string;
    sessionId: string;
    buyerAddress: string;
}