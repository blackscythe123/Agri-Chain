const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying AgriTruthChainOptimized contract...");

    // Get the contract factory
    const AgriTruthChainOptimized = await ethers.getContractFactory("AgriTruthChainOptimized");

    // Deploy the contract
    const contract = await AgriTruthChainOptimized.deploy();
    await contract.deployed();

    console.log("AgriTruthChainOptimized deployed to:", contract.address);

    // Add initial verification centers (example)
    const tx1 = await contract.addVerificationCenter(
        "CSC-CUTTACK-001",
        "0x742d35Cc6269C73C0f84F8Ed8d14c2E4B0E8f8F0" // Replace with actual verifier address
    );
    await tx1.wait();

    const tx2 = await contract.addVerificationCenter(
        "CSC-BHUBANESWAR-001",
        "0x8ba1f109551bD432803012645Hac136c4c108138" // Replace with actual verifier address
    );
    await tx2.wait();

    console.log("Initial verification centers added");

    // Save contract address to environment file
    const fs = require('fs');
    const envPath = './server/.env';
    let envContent = '';

    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update or add contract address
    if (envContent.includes('AGRI_TRUTH_CHAIN_ADDRESS=')) {
        envContent = envContent.replace(
            /AGRI_TRUTH_CHAIN_ADDRESS=.*/,
            `AGRI_TRUTH_CHAIN_ADDRESS=${contract.address}`
        );
    } else {
        envContent += `\nAGRI_TRUTH_CHAIN_ADDRESS=${contract.address}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log("Contract address saved to .env file");

    return contract.address;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });