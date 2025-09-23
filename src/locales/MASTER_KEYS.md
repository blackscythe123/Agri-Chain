# i18n Master Keys Reference

This document tracks the canonical translation keys used across the app. When you add a new page or user-facing text, please update this file and all language JSONs in `src/locales/`.

Supported languages:
- English: `en.json`
- Tamil: `ta.json`
- Hindi: `hi.json`
- Odia: `or.json`

## Sections and keys

### nav
- `home`, `farmers`, `distributors`, `retailers`, `consumers`, `admin`
- `howItWorks`, `blockchainGuide`, `fairTrade`, `apiDocs`, `support`
- `privacy`, `terms`, `cookies`, `login`, `verifiers`

### footer
- `resources`, `contact`, `email`, `description`, `platform`, `copyright`

### common
- `loading`, `error`, `close`, `submit`, `cancel`

### hero
- `badge`, `title1`, `title2`, `description`
- `scanButton`, `learnMore`, `trust1`, `trust2`, `trust3`
- `card1Title`, `card1Desc`, `card2Title`, `card2Desc`

### index (Recent Batches)
- `title`, `subtitle`, `search`, `noResults`, `details`
- `batch`, `owner`, `prices`, `farmerPrice`, `distributorPrice`, `retailerPrice`
- `harvest`, `created`, `crop`, `quantity`, `holder`, `unknown`, `boughtBy`
- `prev`, `next`
- status labels: `verified`, `pending`, `unverified`

### login
- `title`, `description`, `emailPassword`, `email`, `password`, `continue`, `testNote`

### verifier (Verifier Dashboard)
- `title` – page title
- `reviewTitle` – section title
- `noBatches` – empty state
- `status` – status label
- `actions.unverified` | `actions.pending` | `actions.verified`
- `errors.alreadyVerified` | `errors.saveFailed` | `errors.loadFailed` | `errors.secretRequired`
- `confirmVerify` – irreversible confirmation message
- `promptSecret` – prompt for a verifier key

## Adding a new page
1. Define a new top-level section in this file (e.g., `retailersPage`) with the keys you need.
2. Add those keys to `en.json` first with clear, concise English.
3. Copy the keys to `ta.json`, `hi.json`, and `or.json` with accurate translations.
4. Replace hardcoded UI strings in components with `t("<section.key>")` calls.
5. Keep keys semantically stable; avoid renaming unless refactoring across all locales.

## Conventions
- Use lowercase camelCase keys.
- Prefer reusing existing `common` keys for buttons and basic labels.
- Avoid embedding variables in sentences where possible; if needed, use interpolation via `t('key', { value })`.

## Quality checklist
- [ ] All new pages have added keys in all locales.
- [ ] No duplicate keys within a locale JSON.
- [ ] JSON validated (trailing commas removed).
- [ ] UI verified visually in at least one non-English language.
