// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AgriTruthChainOptimized {
    // Optimized struct with gas-efficient packing
    struct BatchCore {
        bytes32 ipfsHash;           // 32 bytes - pointer to IPFS data
        address farmer;             // 20 bytes - farmer wallet address
        uint64 estimatedQuantity;   // 8 bytes - estimated quantity in kg
        uint64 actualQuantity;      // 8 bytes - actual delivered quantity
        uint32 timestamp;           // 4 bytes - harvest timestamp
        uint8 qualityGrade;         // 1 byte - 1=A, 2=B, 3=C
        uint8 stage;                // 1 byte - 0=farm, 1=distributor, 2=retailer, 3=consumer
        bool quantityVerified;      // 1 byte - verification status
        bool isOrganic;            // 1 byte - organic certification
    }

    struct VerificationCenter {
        string centerId;           // CSC center ID
        address verifierAddress;   // Verification officer wallet
        bool isActive;             // Center status
        uint256 totalVerifications; // Track performance
    }

    struct QualityRecord {
        uint8 grade;               // Quality grade at each stage
        uint32 timestamp;          // When quality was checked
        address verifier;          // Who verified the quality
    }

    // State variables
    mapping(bytes32 => BatchCore) public batches;
    mapping(string => VerificationCenter) public verificationCenters;
    mapping(bytes32 => mapping(uint8 => QualityRecord)) public qualityHistory;
    mapping(address => bool) public authorizedVerifiers;
    
    address public owner;
    uint256 public totalBatches;

    // Events
    event BatchRegistered(bytes32 indexed batchId, address indexed farmer, bytes32 ipfsHash);
    event QuantityUpdated(bytes32 indexed batchId, uint64 actualQuantity, uint8 stage);
    event QualityUpdated(bytes32 indexed batchId, uint8 stage, uint8 grade);
    event VerifierAdded(address indexed verifier, string centerId);
    event QualityAlert(bytes32 indexed batchId, uint8 stage, uint8 grade);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyAuthorizedVerifier() {
        require(authorizedVerifiers[msg.sender], "Not an authorized verifier");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Register new batch with verification center
    function registerBatch(
        bytes32 batchId,
        bytes32 _ipfsHash,
        uint64 _estimatedQuantity,
        uint8 _qualityGrade,
        bool _isOrganic,
        string memory _verificationCenterId
    ) external onlyAuthorizedVerifier {
        require(batches[batchId].farmer == address(0), "Batch already exists");
        
        // Get farmer address from verification center records
        address farmerAddress = msg.sender; // In real implementation, map from center data
        
        batches[batchId] = BatchCore({
            ipfsHash: _ipfsHash,
            farmer: farmerAddress,
            estimatedQuantity: _estimatedQuantity,
            actualQuantity: 0, // Will be updated during supply chain
            timestamp: uint32(block.timestamp),
            qualityGrade: _qualityGrade,
            stage: 0, // Starting at farm level
            quantityVerified: true, // Verified by center
            isOrganic: _isOrganic
        });

        // Record initial quality
        qualityHistory[batchId] = QualityRecord({
            grade: _qualityGrade,
            timestamp: uint32(block.timestamp),
            verifier: msg.sender
        });

        totalBatches++;
        emit BatchRegistered(batchId, farmerAddress, _ipfsHash);
    }

    // Update actual quantity during supply chain transfers
    function updateDeliveredQuantity(
        bytes32 batchId,
        uint64 actualQuantity,
        uint8 newStage
    ) external onlyAuthorizedVerifier {
        require(batches[batchId].farmer != address(0), "Batch does not exist");
        require(newStage > batches[batchId].stage, "Invalid stage transition");
        
        batches[batchId].actualQuantity = actualQuantity;
        batches[batchId].stage = newStage;
        
        emit QuantityUpdated(batchId, actualQuantity, newStage);
    }

    // Update quality status at each supply chain stage
    function updateQualityStatus(
        bytes32 batchId,
        uint8 stage,
        uint8 qualityGrade
    ) external onlyAuthorizedVerifier {
        require(batches[batchId].farmer != address(0), "Batch does not exist");
        
        // Record quality at this stage
        qualityHistory[batchId][stage] = QualityRecord({
            grade: qualityGrade,
            timestamp: uint32(block.timestamp),
            verifier: msg.sender
        });

        // Update current quality grade
        batches[batchId].qualityGrade = qualityGrade;

        // Trigger alert for significant quality degradation
        if (stage > 0 && qualityGrade > qualityHistory[batchId][stage-1].grade + 1) {
            emit QualityAlert(batchId, stage, qualityGrade);
        }

        emit QualityUpdated(batchId, stage, qualityGrade);
    }

    // Add verification center
    function addVerificationCenter(
        string memory centerId,
        address verifierAddress
    ) external onlyOwner {
        verificationCenters[centerId] = VerificationCenter({
            centerId: centerId,
            verifierAddress: verifierAddress,
            isActive: true,
            totalVerifications: 0
        });

        authorizedVerifiers[verifierAddress] = true;
        emit VerifierAdded(verifierAddress, centerId);
    }

    // Get batch details (view function)
    function getBatchDetails(bytes32 batchId) external view returns (
        bytes32 ipfsHash,
        address farmer,
        uint64 estimatedQuantity,
        uint64 actualQuantity,
        uint32 timestamp,
        uint8 qualityGrade,
        uint8 stage,
        bool quantityVerified,
        bool isOrganic
    ) {
        BatchCore memory batch = batches[batchId];
        return (
            batch.ipfsHash,
            batch.farmer,
            batch.estimatedQuantity,
            batch.actualQuantity,
            batch.timestamp,
            batch.qualityGrade,
            batch.stage,
            batch.quantityVerified,
            batch.isOrganic
        );
    }

    // Get quality history for a batch
    function getQualityHistory(bytes32 batchId, uint8 stage) external view returns (
        uint8 grade,
        uint32 timestamp,
        address verifier
    ) {
        QualityRecord memory record = qualityHistory[batchId][stage];
        return (record.grade, record.timestamp, record.verifier);
    }

    // Emergency functions
    function deactivateVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = false;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}
