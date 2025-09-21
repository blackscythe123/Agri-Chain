import { createContext, useContext, useEffect, useState } from 'react';

type VerificationStatus = 'pending' | 'verified' | 'rejected';

interface BatchData {
    id: string;
    farmerAddress: string;
    cropType: string;
    quantity: number;
    price: number;
    qualityGrade: string;
    verificationStatus: VerificationStatus;
    ipfsHash?: string;
    timestamp: number;
}

interface VerificationContextType {
    batches: BatchData[];
    pendingVerifications: BatchData[];
    addBatch: (batch: BatchData) => void;
    updateBatchStatus: (batchId: string, status: VerificationStatus) => void;
    getBatchById: (batchId: string) => BatchData | undefined;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export function VerificationProvider({ children }: { children: React.ReactNode }) {
    const [batches, setBatches] = useState<BatchData[]>([]);

    useEffect(() => {
        // Load initial data
        const fetchBatches = async () => {
            try {
                const response = await fetch('/api/verification/batches');
                const data = await response.json();
                setBatches(data.batches);
            } catch (error) {
                console.error('Failed to fetch batches:', error);
            }
        };
        fetchBatches();
    }, []);

    const addBatch = async (batch: BatchData) => {
        try {
            const response = await fetch('/api/verification/register-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(batch)
            });
            const data = await response.json();
            setBatches(prev => [...prev, { ...batch, id: data.batchId }]);
        } catch (error) {
            console.error('Failed to add batch:', error);
        }
    };

    const updateBatchStatus = async (batchId: string, status: VerificationStatus) => {
        try {
            await fetch(`/api/verification/update-status/${batchId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            setBatches(prev => prev.map(b =>
                b.id === batchId ? { ...b, verificationStatus: status } : b
            ));
        } catch (error) {
            console.error('Failed to update batch status:', error);
        }
    };

    const getBatchById = (batchId: string) => batches.find(b => b.id === batchId);

    const pendingVerifications = batches.filter(b => b.verificationStatus === 'pending');

    return (
        <VerificationContext.Provider value={{
            batches,
            pendingVerifications,
            addBatch,
            updateBatchStatus,
            getBatchById
        }}>
            {children}
        </VerificationContext.Provider>
    );
}

export function useVerification() {
    const context = useContext(VerificationContext);
    if (context === undefined) {
        throw new Error('useVerification must be used within a VerificationProvider');
    }
    return context;
}