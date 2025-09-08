Agri Truth Chain - Server

Quick setup

- Copy .env.example to .env and fill values:
	- STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET (from Stripe test mode)
	- AGRI_TRUTH_CHAIN_ADDRESS (deployed V2 contract on Arbitrum Sepolia)
	- ARB_SEPOLIA_RPC_URL (public RPC is okay for tests)
	- RELAYER_PRIVATE_KEY (funded test key on Arbitrum Sepolia)
	- OWNER_PRIVATE_KEY (optional; only to run verifier setup once)

Run locally (PowerShell):

- From repo root or server folder run: npm run server:dev
- Server listens on http://localhost:3001

One-time after deploy:

- Ensure RELAYER_PRIVATE_KEY has ETH for gas on Arbitrum Sepolia
- POST http://localhost:3001/api/setup-relayer-as-verifier once to allow the relayer to verify payments

Stripe testing flow:

- Distributor clicks Pay; on success Stripe redirects to /batch?id=...&paid=1&session_id=...
- BatchDetails calls POST /api/confirm-payment to:
	- logPayment(payer, payee=currentOwner)
	- verifyPayment(true)
	- finalizeTransferAfterVerifiedPayment(batchId, to)
- Then GET /api/batch/:id shows currentOwner updated and payment listed

Diagnostics:

- GET /api/chain-info → hasBytecode should be true; relayer address shown; isRelayerVerifier true after setup
- GET /api/batches and /api/batch/:id return enriched fields including currentHolderRole, dates, prices

