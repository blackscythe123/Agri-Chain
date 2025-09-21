import { type Abi } from 'viem';

export const AGRI_TRUTH_CHAIN_ADDRESS = process.env.AGRI_TRUTH_CHAIN_ADDRESS || "0x0000000000000000000000000000000000000000";

export const AGRI_TRUTH_CHAIN_ABI = [
    { type: "constructor", stateMutability: "nonpayable", inputs: [{ name: "_owner", type: "address" }] },
    { type: "function", name: "setVerifier", stateMutability: "nonpayable", inputs: [{ name: "account", type: "address" }, { name: "allowed", type: "bool" }], outputs: [] },
    {
        type: "function", name: "registerBatchFor", stateMutability: "nonpayable", inputs: [
            { name: "farmer", type: "address" },
            { name: "cropType", type: "string" },
            { name: "quantityKg", type: "uint256" },
            { name: "basePriceINR", type: "uint256" },
            { name: "harvestDate", type: "uint64" },
            { name: "metadataCID", type: "string" }
        ], outputs: [{ name: "batchId", type: "uint256" }]
    },
    {
        type: "function", name: "registerBatch", stateMutability: "nonpayable", inputs: [
            { name: "cropType", type: "string" },
            { name: "quantityKg", type: "uint256" },
            { name: "basePriceINR", type: "uint256" },
            { name: "harvestDate", type: "uint64" },
            { name: "metadataCID", type: "string" }
        ], outputs: [{ name: "batchId", type: "uint256" }]
    },
    { type: "function", name: "transferOwnership", stateMutability: "nonpayable", inputs: [{ name: "batchId", type: "uint256" }, { name: "to", type: "address" }], outputs: [] },
    { type: "function", name: "transferOwnershipByVerifier", stateMutability: "nonpayable", inputs: [{ name: "batchId", type: "uint256" }, { name: "to", type: "address" }], outputs: [] },
    { type: "function", name: "setMinPriceInr", stateMutability: "nonpayable", inputs: [{ name: "batchId", type: "uint256" }, { name: "minPriceINR", type: "uint256" }], outputs: [] },
    { type: "function", name: "setPriceByDistributorInr", stateMutability: "nonpayable", inputs: [{ name: "batchId", type: "uint256" }, { name: "price", type: "uint256" }], outputs: [] },
    { type: "function", name: "setPriceByRetailerInr", stateMutability: "nonpayable", inputs: [{ name: "batchId", type: "uint256" }, { name: "price", type: "uint256" }], outputs: [] },
    {
        type: "function", name: "batches", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [
            { name: "id", type: "uint256" },
            { name: "currentOwner", type: "address" },
            { name: "farmer", type: "address" },
            { name: "distributor", type: "address" },
            { name: "retailer", type: "address" },
            { name: "consumer", type: "address" },
            { name: "cropType", type: "string" },
            { name: "quantityKg", type: "uint256" },
            { name: "basePriceINR", type: "uint256" },
            { name: "distributorPriceINR", type: "uint256" },
            { name: "retailerPriceINR", type: "uint256" },
            { name: "harvestDate", type: "uint64" },
            { name: "metadataCID", type: "string" }
        ]
    },
    { type: "event", name: "BatchRegistered", inputs: [{ name: "batchId", type: "uint256", indexed: true }, { name: "farmer", type: "address", indexed: true }] },
    { type: "event", name: "OwnershipTransferred", inputs: [{ name: "batchId", type: "uint256", indexed: true }, { name: "from", type: "address", indexed: true }, { name: "to", type: "address", indexed: true }] },
    { type: "event", name: "PriceUpdated", inputs: [{ name: "batchId", type: "uint256", indexed: true }, { name: "price", type: "uint256", indexed: false }, { name: "updatedBy", type: "address", indexed: true }] },
    { type: "event", name: "VerifierStatusChanged", inputs: [{ name: "account", type: "address", indexed: true }, { name: "allowed", type: "bool", indexed: false }] }
] as const satisfies Abi;