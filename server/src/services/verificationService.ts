import { Address } from 'viem';

interface VerificationCenter {
    centerId: string;
    verifierAddress: Address;
    name: string;
    district: string;
    registrationDate: string;
    isActive: boolean;
    totalVerifications: number;
    contactInfo?: {
        email: string;
        phone: string;
    };
}

interface VerificationRecord {
    verificationId: string;
    centerId: string;
    batchId: string;
    verifierAddress: Address;
    timestamp: string;
    result: boolean;
    notes?: string;
    testResults?: Record<string, any>;
}

interface VerificationFilter {
    district?: string;
    status?: boolean;
}

// Database mock - replace with actual database implementation
const centersDb = new Map<string, VerificationCenter>();
const verificationRecordsDb = new Map<string, VerificationRecord>();

export async function registerVerificationCenter(centerData: Partial<VerificationCenter>): Promise<VerificationCenter> {
    if (!centerData.centerId || !centerData.verifierAddress) {
        throw new Error('Missing required center data');
    }

    const center: VerificationCenter = {
        ...centerData as VerificationCenter,
        registrationDate: new Date().toISOString(),
        isActive: true,
        totalVerifications: 0
    };

    centersDb.set(centerData.centerId, center);
    return center;
}

export async function getVerificationCenters(filter?: VerificationFilter): Promise<VerificationCenter[]> {
    let centers = Array.from(centersDb.values());

    if (filter?.district) {
        centers = centers.filter(center => center.district === filter.district);
    }

    if (filter?.status !== undefined) {
        centers = centers.filter(center => center.isActive === filter.status);
    }

    return centers;
}

export async function updateVerificationStats(verificationData: Omit<VerificationRecord, 'verificationId' | 'timestamp'>): Promise<VerificationRecord> {
    const center = centersDb.get(verificationData.centerId);
    if (!center) {
        throw new Error('Verification center not found');
    }

    // Update center stats
    center.totalVerifications++;
    centersDb.set(verificationData.centerId, center);

    // Record verification
    const verificationId = `VER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const record: VerificationRecord = {
        verificationId,
        timestamp: new Date().toISOString(),
        ...verificationData
    };

    verificationRecordsDb.set(verificationId, record);
    return record;
}

export async function getVerificationRecord(verificationId: string): Promise<VerificationRecord | undefined> {
    return verificationRecordsDb.get(verificationId);
}

export async function getVerificationsForBatch(batchId: string): Promise<VerificationRecord[]> {
    return Array.from(verificationRecordsDb.values())
        .filter(record => record.batchId === batchId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}