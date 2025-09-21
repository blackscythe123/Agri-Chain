import { Address } from 'viem';

interface FarmerData {
    aadhaar: string;
    name: string;
    address?: Address;
    phone?: string;
    state?: string;
    district?: string;
    landArea?: number;
    crops?: string[];
    status?: 'active' | 'inactive' | 'pending';
    registrationDate?: string;
}

// Database mock - replace with actual database implementation
const farmerDb = new Map<string, FarmerData>();

export async function searchFarmerInDatabase(aadhaar: string): Promise<FarmerData | null> {
    // Mock implementation - replace with actual database query
    return farmerDb.get(aadhaar) || null;
}

export async function registerNewFarmer(farmerData: FarmerData): Promise<FarmerData> {
    // Validate farmer data
    if (!farmerData.aadhaar || !farmerData.name) {
        throw new Error('Missing required farmer data');
    }

    const newFarmer: FarmerData = {
        ...farmerData,
        registrationDate: new Date().toISOString(),
        status: 'active'
    };

    // Mock implementation - replace with actual database insert
    farmerDb.set(farmerData.aadhaar, newFarmer);

    return newFarmer;
}

export async function updateFarmerStatus(aadhaar: string, status: FarmerData['status']): Promise<FarmerData | null> {
    const farmer = farmerDb.get(aadhaar);
    if (!farmer) {
        return null;
    }

    const updatedFarmer: FarmerData = {
        ...farmer,
        status
    };

    farmerDb.set(aadhaar, updatedFarmer);
    return updatedFarmer;
}