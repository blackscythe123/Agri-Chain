# FarmLedge

> **A transparent agricultural supply chain platform**  
> Batches registered on-chain with INR pricing; purchases via Stripe; a verifier account transfers ownership on-chain after payment.

---

## 🚀 Tech Stack

The following technologies power **FarmLedge**, along with their icons and usage:

<details>
<summary>Frontend</summary>

| Technology     | Icon                                                                                                       | Usage                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **React**      | ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)                          | Building interactive UI components and managing state. |
| **Vite**       | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite)                             | Fast dev server & build tool with HMR.                 |
| **TypeScript** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)           | Static typing for safer, scalable code.                |
| **Tailwind CSS** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css)   | Utility-first CSS framework for rapid styling.         |
| **shadcn UI**  | ![shadcn UI](https://img.shields.io/badge/shadcn_UI-000000?style=for-the-badge)                             | Tailwind-based component library for consistent design.|

</details>

<details>
<summary>Backend</summary>

| Technology    | Icon                                                                                                         | Usage                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| **Node.js**   | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js)                      | Server runtime for APIs and blockchain interactions. |
| **Express**   | ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express)                      | Web framework for RESTful endpoints.              |
| **Stripe**    | ![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe)                        | Payment processing and webhook handling.           |
| **Viem**      | ![Viem](https://img.shields.io/badge/Viem-000000?style=for-the-badge)                                        | Ethereum library for Arbitrum Sepolia interactions. |

</details>

<details>
<summary>Smart Contract</summary>

| Technology   | Icon                                                                                                          | Usage                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Solidity** | ![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity)                    | Writing AgriTruthChain smart contract.          |

</details>

<details>
<summary>Utilities & DevOps</summary>

| Technology         | Icon                                                                                                      | Usage                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **npm**            | ![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm)                               | Dependency management and scripts.              |
| **GitHub Actions** | ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions) | CI/CD workflows for automated testing and deployment. |
| **Docker** (opt.)  | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker)                      | Containerization for consistent environments.   |

</details>

---

🎯 Key Features

- **INR-Only On-Chain Pricing**  
  Set farm-gate, distributor, and retailer prices in rupees—all stored on the blockchain.
- **Off-Chain Payments with Stripe**  
  Secure checkout and webhooks trigger ownership transfers.
- **Verifier-Based Transfers**  
  Only approved relayers can call `transferOwnershipByVerifier`.
- **Lean Reads & Fast UI**  
  Recent batches timeline with search, skeleton loaders, and detail modals.
- **Idempotent Webhooks**  
  Automatic duplicate-write protection (handles nonce errors).

� Verifier UX & Workflow (Latest)

- **Themed Verify Modal**  
  Verifiers get a themed dialog to confirm and enter a passkey before marking a batch as Verified.
- **Search & Sorting on Verifier Dashboard**  
  Quickly filter by `ID`, `crop`, or `holder` and sort by `ID`, `quantity`, or `crop` (asc/desc). Verified batches remain hidden.
- **One-way Verification Rules**  
  Verified items cannot be edited; only allowed transitions between `unverified` and `pending` before final verify.
- **i18n Coverage**  
  English, Tamil, Hindi, and Odia across Navigation, Hero, Login, Index, and Verifier flows.

�📦 Prerequisites

- **Node.js** ≥ 18  
- **npm**  
- **Stripe** test account (API keys)  
- **Arbitrum Sepolia** RPC URL + funded relayer private key  
- Deployed **AgriTruthChain** contract address

🔧 Local Setup

```bash
# Clone the repo
git clone https://github.com/blackscythe123/FarmLedge.git
cd FarmLedge

# Install dependencies
npm install
cd server && npm install && cd ..

# Configure environment
cp server/.env.example server/.env
# Populate server/.env:
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# PORT=3001
# AGRI_TRUTH_CHAIN_ADDRESS=0xYourDeployedContract
# RELAYER_PRIVATE_KEY=your_funded_sepolia_private_key
# OWNER_PRIVATE_KEY=optional_owner_key_for_verifier_setup
# ARB_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Start backend & frontend
npm run server:dev     # runs backend on port 3001
npm run dev            # runs frontend on port 8000
```

Open http://localhost:8000 in your browser.

🔑 One-Time Verifier Setup

```bash
curl -X POST http://localhost:3001/api/setup-relayer-as-verifier
```
or if native binary not working 
```bash
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/setup-relayer-as-verifier | ConvertTo-Json -Depth 6
```
Response returns a transaction hash on success.

🔄 Core Flows

1. **Register Batch**  
   POST `/api/register-batch` → writes batch + farmer price on-chain.
2. **Purchase**  
   - Create Stripe session: POST `/create-checkout-session`  
   - On webhook, server calls `transferOwnershipByVerifier` and optionally sets next price.
3. **View Batches**  
   - GET `/api/batches` → list of batches with computed fallbacks & timestamps  
   - GET `/api/batch/:id` → detailed batch info
4. **Price Updates**  
   - Distributor: POST `/api/set-price-by-distributor`  
   - Retailer: POST `/api/set-price-by-retailer`
5. **Fallback**  
   POST `/api/confirm-payment` if webhook fails.

📑 API Endpoints

| Method | Endpoint                             | Description                                 |
| ------ | ------------------------------------ | ------------------------------------------- |
| POST   | `/create-checkout-session`           | Returns Stripe session ID & URL             |
| POST   | `/api/register-batch`                | Register new batch on-chain                 |
| GET    | `/api/batches`                       | List all batches                            |
| GET    | `/api/batch/:id`                     | Get batch details                           |
| POST   | `/api/confirm-payment`               | Manual fallback transfer                    |
| POST   | `/api/set-price-by-distributor`      | Set distributor price                       |
| POST   | `/api/set-price-by-retailer`         | Set retailer price                          |
| POST   | `/api/setup-relayer-as-verifier`     | Mark relayer as verifier (one-time)         |
| GET    | `/api/chain-info`                    | Dev diagnostics                             |

ℹ️ API Documentation Link

The footer "API Documentation" link points to this README’s API section on GitHub:  
https://github.com/blackscythe123/FarmLedge#api-endpoints

🎨 Frontend Highlights

- **Recent Batches Timeline**  
  Paginated view (3 per page), searchable by Batch ID on Index. Status badges (Unverified/Pending/Verified) visible.
- **Verifier Dashboard**  
  Search + sort controls, themed verification modal with passkey, and strict one-way transitions.
- **Footer Resources**  
  Includes a GitHub link to the repo and API Documentation linking back to this README’s API section.

🛠️ Scripts

```jsonc
// package.json (root)
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "server:dev": "node server/src/index.js",
    "server": "node server/src/index.js"
  }
}

// server/package.json
{
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js"
  }
}
```

⚠️ Troubleshooting

- **Webhook Signature Errors**  
  Ensure `STRIPE_WEBHOOK_SECRET` matches your Stripe CLI/webhook config.
- **Contract Address Issues**  
  Verify `AGRI_TRUTH_CHAIN_ADDRESS` points to your deployed contract (not an EOA).
- **Relayer Setup**  
  Confirm `RELAYER_PRIVATE_KEY` has sufficient Sepolia ETH.
- **Pricing Mismatch**  
  Stripe sends amounts in paise; contract stores rupees—convert appropriately.

🔒 Security & Data

- **On-Chain:** Public data (batch IDs, owners, INR prices)  
- **Off-Chain:** Minimal session & role data; Stripe handles payment details  
- **Idempotency:** Webhooks are idempotent to avoid duplicate blockchain writes
