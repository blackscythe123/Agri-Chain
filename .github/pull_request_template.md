## Title
Fix/TS conversion + sync docs -> Merge into main

## Description
- Syncs API endpoints with docs
- Adds IPFS integration
- Adds VerificationCenterDashboard, ConsumerBatchInfo, VerifierDashboard
- Adds verifier moderation APIs and persistence
- CI builds frontend and smoke-tests server

## How to test locally
1. cd server && npm ci && create .env (see server/README.md) && npm run dev
2. npm run dev (frontend) or npm run build
3. Open /api-docs, /verification, /verifier

## Checklist
- [ ] Builds without TypeScript errors
- [ ] Endpoints match api-endpoints.md
- [ ] IPFS & smart contract integration tested
- [ ] Farmer/Distributor/Verifier flows tested
- [ ] Unit + E2E tests pass
- [ ] CI workflow green
