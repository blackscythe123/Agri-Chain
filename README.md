
# Agri Truth Chain

A transparent agricultural supply chain platform. Batches are registered on-chain with INR pricing; purchases use Stripe; a verifier account transfers ownership on-chain after payment. 
## Stack

- Frontend: Vite + React + TypeScript, Tailwind + shadcn UI
- Server: Node + Express, Stripe, viem (Arbitrum Sepolia)
- Smart Contract: AgriTruthChain (INR-only, verifier-based transfer)

## What we built (summary)

- INR-only pricing on-chain: base (for storage), farmer/min, distributor, retailer.
- No on-chain payments or shipments; reads are lean and fast.
- Stripe Checkout handles payment; server webhook confirms and calls `transferOwnershipByVerifier(batchId, to)`.
- Idempotent webhooks to avoid duplicate writes (nonce-too-low fixes).
- Home shows “Recent Batches” timeline with search, skeleton loaders, and details modal.
- Resource pages (How It Works, Blockchain Guide, Fair Trade, API Docs, Support) include small diagrams and data snippets.
- UI shows prices as: ₹ Farmer → ₹ Dist → ₹ Retail (base is not displayed).

## Prerequisites

- Node.js 18+ and npm
- Stripe test account (API keys)
- Arbitrum Sepolia RPC URL and a funded test private key for the relayer
- Deployed AgriTruthChain contract address

## Local setup (Windows PowerShell)

1) Install dependencies

```powershell
# from repo root
npm i
cd server; npm i; cd ..
```

2) Configure server environment

Copy `server/.env.example` to `server/.env` and fill these values:

```dotenv
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PORT=3001
AGRI_TRUTH_CHAIN_ADDRESS=0xYourDeployedContract
RELAYER_PRIVATE_KEY=your_funded_sepolia_private_key
OWNER_PRIVATE_KEY=optional_owner_key_for_verifier_setup
ARB_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
```

Notes
- RELAYER_PRIVATE_KEY: used by the server to write on-chain (register batches, transfer ownership, set prices).
- OWNER_PRIVATE_KEY: only needed once to mark the relayer as a verifier via the setup endpoint.
- AGRI_TRUTH_CHAIN_ADDRESS: must be the deployed contract (not an EOA).

3) Start the backend (port 3001)

```powershell
npm run server:dev
```

4) Start the frontend (port 8000; proxies /api to the server)

```powershell
npm run dev
```

Open http://localhost:8000

## One‑time verifier setup

After deploying the contract and configuring `OWNER_PRIVATE_KEY` and `RELAYER_PRIVATE_KEY`, mark the relayer as a verifier so webhooks can transfer ownership:

```powershell
# with server running
# call from a tool like curl/Postman or browser (GET is fine in browser, but this endpoint expects POST)
# Example PowerShell Invoke-RestMethod:
Invoke-RestMethod -Uri http://localhost:3001/api/setup-relayer-as-verifier -Method Post
```

Response includes a tx hash if successful.

## Key flows

- Register batch: server writes to contract; sets min (farmer) price when provided.
- Purchase: Stripe Checkout completes; webhook verifies and calls `transferOwnershipByVerifier` to the next role; optional price set for downstream role.
- Read batches: `/api/batches` returns tuples plus computed fallbacks and timestamps. UI pages use skeleton loaders and show current holder.

## API (server)

- POST `/create-checkout-session` → { id, url }
- POST `/api/register-batch` → { ok, batchId, tx }
- GET `/api/batches` → { batches: [...] }
- GET `/api/batch/:id` → { batch }
- POST `/api/confirm-payment` → fallback transfer if webhook unreachable
- POST `/api/set-price-by-distributor` → set INR price
- POST `/api/set-price-by-retailer` → set INR price
- POST `/api/setup-relayer-as-verifier` → owner marks relayer as verifier
- GET `/api/chain-info` → diagnostics (dev only)

All prices are INR; Stripe amounts are in paise (x100).

## Frontend highlights

- Recent Batches timeline: 3 per page, search by id, owner role badges, dialog with prices and addresses.
- Resource pages with diagrams and live data (How It Works, Blockchain Guide, Fair Trade, API Docs, Support).
- Farmer/Distributor/Retailer/Consumer pages wired to the server endpoints; prices shown as Farmer→Dist→Retail.

## Troubleshooting

- Webhook signature error: ensure `STRIPE_WEBHOOK_SECRET` matches your Stripe CLI/webhook config.
- not_a_contract / address_matches_relayer: set a correct `AGRI_TRUTH_CHAIN_ADDRESS` that points to the deployed contract, not an EOA.
- Relayer not configured: set `RELAYER_PRIVATE_KEY`; it must have Arbitrum Sepolia test ETH.
- Amounts incorrect: remember frontend sends INR paise to Stripe (minor units), while contract stores INR as integers (rupees).

## Scripts

```json
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
```

```json
// server/package.json
{
	"scripts": {
		"dev": "node --watch src/index.js",
		"start": "node src/index.js"
	}
}
```

## Security & data

- On-chain data is public (batch ids, owner, INR prices).
- Off-chain we store minimal session/role data; Stripe handles payment details.
- Webhooks are idempotent to prevent duplicate on-chain writes.

## License

MIT (or your preferred license)
