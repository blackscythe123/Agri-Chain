export interface IPFSData {
    hash: string;
    path: string;
    size: number;
}

export interface IPFSBatchData {
    data: any;
    metadata: {
        timestamp: number;
        version: string;
    };
}

export interface IPFSUploadResponse {
    ipfsHash: string;
    size: number;
    timestamp: number;
}