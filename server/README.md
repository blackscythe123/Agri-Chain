Agri Truth Chain - Server

Quick setup

- Create server/.env with:
	- PORT=3001
	- API_BASE_URL=http://localhost:3001
	- AGRI_TRUTH_CHAIN_ADDRESS, ARB_SEPOLIA_RPC_URL
	- RELAYER_PRIVATE_KEY, OWNER_PRIVATE_KEY (optional)
	- IPFS_HOST=ipfs.infura.io, IPFS_PROJECT_ID, IPFS_API_SECRET
	- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (optional)

Run locally:

- From server folder run: npm ci && npm run dev
- Server listens on http://localhost:3001

Verifier moderation:

- Verification POST enqueues an item to /api/verifier/queue (stored at server/data/verifier-queue.json)
- List queue: GET /api/verifier/queue
- Decide: POST /api/verifier/queue/:id/decide { decision: approved|rejected|pending }

Stripe testing flow:

- Distributor clicks Pay; on success Stripe redirects to /batch?id=...&paid=1&session_id=...
- BatchDetails may call POST /api/confirm-payment to transfer ownership (optional in INR model)

Diagnostics:

- GET /api/chain-info → verify contract bytecode on address
- GET /api/batches and /api/batch/:id return current state

