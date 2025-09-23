<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# okayy purfectooo now can you guide me step by step from cloning the given repo to setting up existing things + installing and setting up new things + making necessary changes and creating new files in a order so that i can do everything necessary and set up the entire project and run it?

Here is a detailed step-by-step guide—starting from cloning your Agri-Chain repo, through setting up all dependencies and project structure, to implementing new features and running the complete project.

***

### Step 1: Clone the Repository

```bash
git clone https://github.com/blackscythe123/Agri-Chain.git
cd Agri-Chain
```

**If you want to use your fork:**

```bash
git clone https://github.com/VijayaraaghavanKS/Agri-Chain.git
cd Agri-Chain
```


***

### Step 2: Install Existing Project Dependencies

#### Root dependencies (Frontend + project-wide tools):

```bash
npm install
```


#### Backend dependencies:

```bash
cd server
npm install
cd ..
```


***

### Step 3: Install \& Set Up New Dependencies

#### Backend (Node.js):

```bash
cd server
npm install ipfs-http-client multer
cd ..
```


#### Frontend (React):

```bash
npm install jsqr
```


***

### Step 4: Set Up Environment Variables

Copy `.env.example` to `.env` in the backend server:

```bash
cp server/.env.example server/.env
```

Then edit `server/.env` and add the following if not present:

```
IPFS_HOST=ipfs.infura.io
IPFS_PROJECT_ID=your_infura_project_id
IPFS_API_SECRET=your_infura_secret

KRUSHAK_ODISHA_API_URL=https://krushak.odisha.gov.in/api
OSOCA_API_URL=https://osoca.nic.in/api
APEDA_API_URL=https://apeda.gov.in/api

# Ensure these remain set as well:
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PORT=3001
AGRI_TRUTH_CHAIN_ADDRESS= # leave blank until contract is deployed
RELAYER_PRIVATE_KEY=your_funded_sepolia_private_key
```


***

### Step 5: Add/Replace Files for New Features

**A. Smart Contract**

- Add the optimized contract (`AgriTruthChainOptimized.sol`) to `contracts/` ()
- Add the deploy script (`deploy-optimized.js`) to `scripts/`
- Deploy to Arbitrum Sepolia:

```bash
npx hardhat run scripts/deploy-optimized.js --network arbitrum-sepolia
```

- Copy deployed contract address and paste into `server/.env` as `AGRI_TRUTH_CHAIN_ADDRESS`

**B. Backend Files**

Copy and create these from the code files you were provided:

- `server/src/services/ipfsService.js` (IPFS integration)
- `server/src/routes/batchRoutes.js` (register batches with IPFS metadata)
- `server/src/routes/farmerRoutes.js`
- `server/src/routes/verificationRoutes.js`
- `server/src/routes/supplyChainRoutes.js`
- `server/src/routes/consumerRoutes.js`
- `server/src/routes/integrationRoutes.js`
- Update `server/src/index.js` to import and use these new routers

**C. Frontend Files**

Create/replace the following:

- `src/components/VerificationCenterDashboard.jsx`
- `src/components/ConsumerBatchInfo.jsx`
- `src/components/QRScanner.jsx`
- Update your router definitions (e.g., `App.jsx` or `routes/index.jsx`) to include these views

***

### Step 6: Run \& Test the Application

#### Start Backend:

```bash
cd server
npm run dev
```

This should launch the backend on port 3001.

#### Start Frontend:

```bash
npm run dev
```

Frontend should be available on port 8000 (typically http://localhost:8000).

***

### Step 7: Test the Complete Workflow

1. Use the verification dashboard to register a farmer batch via CSC workflow.
2. Verify that data is added on-chain with IPFS storage for metadata.
3. Progress through the supply chain by updating batch status at distributor and retailer checkpoints.
4. Use QR Scanner to fetch full batch info as a consumer.
5. Validate that API integrations, complaint/rating, and sync routines all respond with proper data.

***

### Step 8: Prepare SIH Demo

- Use the provided slide deck for presentations
- Use given Copilot prompts and mermaid diagrams for technical/demo explanations
- Ready test data and sample batch flows for judges to walk through

***

**You now have a stepwise plan—just follow each section as listed. As you proceed, copy/paste the exact code for files and configs from the `-` code files mentioned above. If you get stuck on any step, ask for file-specific guidance or error fixes with exact error logs.**
<span style="display:none">[^1]</span>

<div style="text-align: center">⁂</div>

[^1]: https://github.com/blackscythe123/Agri-Chain

