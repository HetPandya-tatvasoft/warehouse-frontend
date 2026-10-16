# Validation and Local Run Guide

For later implementation; no checks or manual acceptance runs are claimed by this planning deliverable.

## Prerequisites and run

Use existing pnpm installation/dependencies and repository environment configuration; do not replace
local secrets or auth configuration. Run the reviewed backend separately with its normal database setup.
A tenant user needs manually assigned ProductAttributes grants; use existing role administration.
Confirm the existing NEXT_PUBLIC_API_URL / internal rewrite configuration reaches the API from browser
and SSR, as for current modules. No feature-specific configuration or dependency is required.

From the frontend repository root: `pnpm dev`. Open
`/settings/product-settings/attributes` and an actual row's `/:attributeId/values` nested page.
The full values URL is `/settings/product-settings/attributes/{attributeId}/values`.

## Required completion checks

Run after implementation, without weakening configuration:

- `pnpm exec tsc --noEmit`
- `pnpm lint` (no fixing flag)
- `pnpm build`

Review the diff against Branches/Categories for duplicated functionality, unnecessary additions,
unsafe typing and unrelated changes. Record outcomes/limitations; do not add automated tests or infrastructure.

## Developer-run manual verification (separate)

Use [spec acceptance criteria](spec.md) as the behavior guide and [API contract](contracts/api.md)
for supported operations. Cover both pages' server listing controls, navigation/hydration, each
permitted mutation, refreshed parent/count data, inactive-parent notice and unchanged child statuses.
Check validation/conflict guidance, cancellation/permanent deletion, pending protection, restricted
permission combinations, unavailable records and loading/empty/error feedback at mobile/desktop widths.

Use real retrieved IDs and existing records to exercise reactivation; generic conflicts must remain
generic. Confirm neither dialog cancellation nor a denied action changes data. No manual result or
concurrency guarantee is inferred from source review; the developer records actual observations.
