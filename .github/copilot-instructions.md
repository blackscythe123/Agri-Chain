# Copilot Instructions for Agri-Chain

## Project Overview
- **Agri-Chain** is a full-stack platform for transparent agricultural supply chains.
- Batches are registered and tracked on-chain (Arbitrum Sepolia) with INR pricing; purchases are made via Stripe; a verifier account finalizes on-chain ownership transfer after payment.

## Architecture
- **Frontend** (`/src`): React + Vite + TypeScript, styled with Tailwind and shadcn UI. Key UI logic in `/src/components`, `/src/pages`, and `/src/lib`.
- **Backend** (`/server`): Node.js + Express. Handles REST APIs, Stripe payment flows, and blockchain interactions via Viem.
- **Smart Contracts** (`/contracts`): Solidity contract `AgriTruthChain.sol` deployed to Arbitrum Sepolia.
- **Cross-component flow**: Frontend triggers payments and contract calls via backend APIs; backend relays to blockchain and Stripe.

## Developer Workflows
- **Frontend dev**: `npm run dev` (from root) starts Vite dev server.
- **Backend dev**: `npm run server:dev` (from root or `/server`) starts Express server on port 3001.
- **Environment setup**: Copy `/server/.env.example` to `/server/.env` and fill required keys (see `/server/README.md`).
- **Smart contract**: Edit in `/contracts/AgriTruthChain.sol`. Deployment and ABI sync are manual; keep `/src/lib/contracts.ts` updated.

## Key Patterns & Conventions
- **API endpoints**: All backend routes are under `/api/` (see `/server/src`).
- **Payment flow**: Stripe session → `/api/confirm-payment` → contract transfer (see `/src/pages/BatchDetails.tsx`).
- **Role-based logic**: Stakeholder roles (farmer, distributor, retailer, consumer) are central; see `/src/components/StakeholderDashboard.tsx` and `/src/pages/profiles/`.
- **State management**: Uses React context for auth (`/src/context/AuthContext.tsx`).
- **UI**: Prefer shadcn UI components in `/src/components/ui/` for consistency.
- **Testing/dev data**: Use `/src/lib/mockChain.ts` and `/server/scripts/add_shipments.js` for local testing.

## Integration & External Dependencies
- **Blockchain**: Uses Viem for contract calls; contract address and RPC URL are set in backend `.env`.
- **Payments**: Stripe integration in backend; secrets in `.env`.
- **CI/CD**: GitHub Actions for test/deploy (see `.github/workflows/` if present).

## Examples
- To add a new stakeholder role, update contract, backend role logic, and relevant frontend dashboard/profile components.
- To debug payment/transfer, use `/api/chain-info` and `/api/batch/:id` endpoints for diagnostics.

---
For more, see `/README.md` (project), `/server/README.md` (backend), and `/contracts/AgriTruthChain.sol` (contract logic).
