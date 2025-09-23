// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AgriTruthChain V2 - Registry with relayer support and verified-payment transfers
contract AgriTruthChain {
    struct Batch {
        uint256 id;
        address currentOwner;
        address farmer;
        address distributor;
        address retailer;
        address consumer;
        string cropType;
        uint256 quantityKg;
    uint256 basePriceINR; // rupees (whole)
        uint64 harvestDate;
        string metadataCID;
        uint256 createdAt;
        bool exists;
    uint256 minPriceINR; // rupees (whole)
    uint256 priceByDistributorINR; // rupees (whole)
    uint256 priceByRetailerINR;    // rupees (whole)
        uint256 boughtByDistributorAt;
        uint256 boughtByRetailerAt;
        uint256 boughtByConsumerAt;
        // On-chain verification fields
        uint8 verificationStatus; // 0 = unverified, 1 = pending, 2 = verified
        address verificationBy;
        uint256 verificationAt;
    }

    uint256 public nextBatchId = 1;
    mapping(uint256 => Batch) public batches;
    // shipments and payments removed

    address public owner;
    mapping(address => bool) public verifiers; // retained for future use

    event BatchRegistered(uint256 indexed batchId, address indexed farmer, string cropType, uint256 quantityKg, uint256 basePriceINR, uint64 harvestDate, string metadataCID);
    event OwnershipTransferred(uint256 indexed batchId, address indexed from, address indexed to);
    event VerifierSet(address indexed verifier, bool allowed);
    // pricing, shipment, payment events removed
    event PricesUpdatedINR(uint256 indexed batchId, uint256 minPriceINR, uint256 priceByDistributorINR, uint256 priceByRetailerINR);
    event VerificationStatusUpdated(uint256 indexed batchId, uint8 status, address indexed by, uint256 at);

    modifier onlyOwner() { require(msg.sender == owner, "not-owner"); _; }

    constructor(address _owner) {
        owner = _owner == address(0) ? msg.sender : _owner;
    }

    function setVerifier(address account, bool allowed) external onlyOwner {
        verifiers[account] = allowed;
        emit VerifierSet(account, allowed);
    }

    // Internal implementation shared by both registration functions
    function _registerBatch(
        address farmer,
        string calldata cropType,
        uint256 quantityKg,
    uint256 basePriceINR,
        uint64 harvestDate,
        string calldata metadataCID
    ) internal returns (uint256 batchId) {
        require(farmer != address(0), "bad-farmer");
        batchId = nextBatchId++;
        batches[batchId] = Batch({
            id: batchId,
            currentOwner: farmer,
            farmer: farmer,
            distributor: address(0),
            retailer: address(0),
            consumer: address(0),
            cropType: cropType,
            quantityKg: quantityKg,
            basePriceINR: basePriceINR,
            harvestDate: harvestDate,   
            metadataCID: metadataCID,
            createdAt: block.timestamp,
            exists: true,
            minPriceINR: 0,
            priceByDistributorINR: 0,
            priceByRetailerINR: 0,
            boughtByDistributorAt: 0,
            boughtByRetailerAt: 0,
            boughtByConsumerAt: 0,
            verificationStatus: 0,
            verificationBy: address(0),
            verificationAt: 0
        });
        batchIds.push(batchId);
        emit BatchRegistered(batchId, farmer, cropType, quantityKg, basePriceINR, harvestDate, metadataCID);
    }

    // Relayer-friendly registration: farmer address is provided explicitly.
    function registerBatchFor(
        address farmer,
        string calldata cropType,
        uint256 quantityKg,
    uint256 basePriceINR,
        uint64 harvestDate,
        string calldata metadataCID
    ) external returns (uint256 batchId) {
    return _registerBatch(farmer, cropType, quantityKg, basePriceINR, harvestDate, metadataCID);
    }

    // Backward-compat simple register (farmer = msg.sender)
    function registerBatch(
        string calldata cropType,
        uint256 quantityKg,
    uint256 basePriceINR,
        uint64 harvestDate,
        string calldata metadataCID
    ) external returns (uint256 batchId) {
    return _registerBatch(msg.sender, cropType, quantityKg, basePriceINR, harvestDate, metadataCID);
    }

    function transferOwnership(uint256 batchId, address to) external {
        Batch storage b = batches[batchId];
        require(b.exists, "batch-not-found");
        require(b.currentOwner == msg.sender, "not-owner");
        _updateOwner(batchId, to);
    }


    function _updateOwner(uint256 batchId, address to) internal {
        Batch storage b = batches[batchId];
        address prev = b.currentOwner;
        b.currentOwner = to;
        // Stage progression and timestamps
        if (b.distributor == address(0) && to != b.farmer) {
            b.distributor = to;
            b.boughtByDistributorAt = block.timestamp;
        } else if (b.retailer == address(0) && to != b.distributor) {
            b.retailer = to;
            b.boughtByRetailerAt = block.timestamp;
        } else if (b.consumer == address(0) && to != b.retailer) {
            b.consumer = to;
            b.boughtByConsumerAt = block.timestamp;
        }
        emit OwnershipTransferred(batchId, prev, to);
    }

    // Verifier/owner can transfer on behalf of current owner (used by webhook/relayer)
    function transferOwnershipByVerifier(uint256 batchId, address to) external {
        require(verifiers[msg.sender] || msg.sender == owner, "not-verifier");
        _updateOwner(batchId, to);
    }

    // Set verification status: only owner contract admin or authorized verifiers
    // status: 0 = unverified, 1 = pending, 2 = verified
    function setVerificationStatus(uint256 batchId, uint8 status) external {
        require(verifiers[msg.sender] || msg.sender == owner, "not-verifier");
        require(status <= 2, "bad-status");
        Batch storage b = batches[batchId];
        require(b.exists, "batch-not-found");
        b.verificationStatus = status;
        b.verificationBy = msg.sender;
        b.verificationAt = block.timestamp;
        emit VerificationStatusUpdated(batchId, status, msg.sender, block.timestamp);
    }

    function getVerification(uint256 batchId) external view returns (uint8 status, address by, uint256 at) {
        Batch storage b = batches[batchId];
        require(b.exists, "batch-not-found");
        return (b.verificationStatus, b.verificationBy, b.verificationAt);
    }


    uint256[] public batchIds;
    function getAllBatchIds() external view returns (uint256[] memory) { return batchIds; }

    // payments, shipments, pricing removed from contract interface

    // INR pricing setters
    function setMinPriceInr(uint256 batchId, uint256 minPriceINR_) external {
        Batch storage b = batches[batchId];
        require(b.exists, "batch-not-found");
        require(b.currentOwner == msg.sender || verifiers[msg.sender] || msg.sender == owner, "not-authorized");
        b.minPriceINR = minPriceINR_;
        emit PricesUpdatedINR(batchId, b.minPriceINR, b.priceByDistributorINR, b.priceByRetailerINR);
    }

    function setPriceByDistributorInr(uint256 batchId, uint256 price) external {
        Batch storage b = batches[batchId];
        require(b.exists, "batch-not-found");
        require(b.distributor == msg.sender || verifiers[msg.sender] || msg.sender == owner, "not-authorized");
        b.priceByDistributorINR = price;
        emit PricesUpdatedINR(batchId, b.minPriceINR, b.priceByDistributorINR, b.priceByRetailerINR);
    }

    function setPriceByRetailerInr(uint256 batchId, uint256 price) external {
        Batch storage b = batches[batchId];
        require(b.exists, "batch-not-found");
        require(b.retailer == msg.sender || verifiers[msg.sender] || msg.sender == owner, "not-authorized");
        b.priceByRetailerINR = price;
        emit PricesUpdatedINR(batchId, b.minPriceINR, b.priceByDistributorINR, b.priceByRetailerINR);
    }
}
