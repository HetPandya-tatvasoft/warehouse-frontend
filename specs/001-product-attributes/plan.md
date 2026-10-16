# Implementation Plan: Product Attributes and Attribute Values

**Branch**: `chore/setup-spec-kit` | **Date**: 2026-10-15 | **Spec**: [spec.md](spec.md)

**Input**: `specs/001-product-attributes/spec.md`. Feature identifier: `001-product-attributes`;
setup-plan reports this identifier as BRANCH, but the actual checkout remains `chore/setup-spec-kit`.

## Summary

Add attribute and nested value management to Product Settings using the existing Branches table
and Categories settings/form/action patterns. The owner's reviewed current backend is the
integration authority. Earlier backend remediation is deferred, not a prerequisite or planned work.
All agreed requirements remain intact; source inspection found no workflow blocker.

## Technical Context

**Language/Version**: TypeScript 5, strict; Next.js 16.2.10, React 19.2.4.
**Primary Dependencies**: Existing React Query 5, TanStack Table 8, Axios, React Hook Form 7,
Zod 4/resolvers, shared UI, Sonner, Tailwind 4, lucide-react. No new dependencies.
**Storage**: Existing backend only; React Query cache and URL list controls on the frontend.
**Testing**: Automated tests/infrastructure deferred. Later checks: TypeScript, non-fixing lint, build.
**Target Platform**: Existing authenticated tenant web application, mobile and desktop layouts.
**Project Type**: Next.js App Router frontend; no new service or backend work.
**Performance Goals**: Server-filtered pages; reuse hydrated data without a redundant initial fetch
for identical fresh keys. No new latency/concurrency target is implied.
**Constraints**: Existing auth behavior, permissions, strict types, standard 150-length text validation,
no custom Unicode/NUL regex, scope exclusions and unrelated changes preserved.
**Scale/Scope**: Two pages, two simple forms, existing ten backend handlers; no bulk/assignment features.

## Constitution Check

The results below assess planning/design compliance only. They are not evidence that application
code exists or that TypeScript, lint, build, or implementation review checks have passed.

| Gate | Before research / after design |
| --- | --- |
| Existing structure, named exports, @/ imports, styling | Pass: reference modules below; framework page exports retained. |
| Reuse before additions | Pass: existing UI/data/form infrastructure; only feature-specific files. |
| Strict types and current API | Pass: source-derived types, narrowed URL/error input; no unsafe casts. |
| Scope and baseline | Pass: no backend changes/remediation, new dependencies, tests, or unrelated refactoring. |
| Permissions and states | Pass: View guards, separate action permissions, complete error/pending states. |
| Verification | Pass: required code checks planned; developer-run manual guidance kept separate. |

### Integration and rendering

- Use [contracts/api.md](contracts/api.md); API functions return existing typed envelopes through
  `apiClient`. Server GETs accept an optional cookie header, including parent detail and nested list.
- Follow `src/app/(tenant)/(main)/branches/page.tsx` for awaited searchParams and Categories page for
  settings hydration/guard composition. Use per-request `getQueryClient`, cookie forwarding,
  dehydrate/HydrationBoundary, and the existing client PermissionGuard.
- Read and narrow URL controls directly in server pages and client containers, following Branches.
  Keep matching Branches-style pagination defaults and supported enum checks in both locations;
  do not introduce control schemas or parser helpers. Defaults: 1/10/createdAt/DESC, status omitted.
- Prefetch the attributes list with those controls. For values, fetch parent detail first, then
  prefetch nested values on success. Server cache contains envelopes (selectors apply in hooks).
  Do not dehydrate fabricated empty success data on failure: the guarded client handles retry/error.
  Keep cookies out of keys and serialized props. Authorization remains enforced by the backend.
- Client queries require View; nested values additionally require successful parent retrieval,
  regardless of parent status. Missing parent suppresses management and shows unavailable/back action.

### Query state and mutations

Extend `src/lib/query/query-keys.ts` with a `productAttributes` family:

| Purpose | Key layout |
| --- | --- |
| Feature prefix | [product-attributes] |
| Attribute list | [product-attributes, list, normalized controls] |
| Parent detail | [product-attributes, detail, attributeId] |
| Parent value prefix | [product-attributes, detail, attributeId, values] |
| Value list | [product-attributes, detail, attributeId, values, list, normalized controls] |

Use category-style query factories, apiQueryOptions, useQuery/useMutation and typed object keys
without Record casts. Do not add unused value-detail queries solely because a handler exists.
Await invalidation of the feature prefix on each successful write: it covers all list variants,
parent count/name/status and nested availability with the existing simple invalidation approach.
Active queries refetch and inactive ones become stale; do not rely on the 60-second staleTime to
refresh a returning page. Remove deleted parent's cached detail/value subtree to prevent stale
management on revisit; invalidate the remaining family. Do not optimistically manufacture data.
Mutation errors are not automatically retried; explicit user retry only.

### UI, forms, navigation and failures

- Containers compose PageContainer/PageHeader, CommonTable, UIInput/UISelect, UIButton,
  UIModal/ConfirmDialog, UILoader/UIErrorState and existing status styling. Keep two feature forms,
  not a configurable generic CRUD component. Use typed columns and disable unsupported sorting.
- Reuse useUpdateQueryParams, useSyncedState and useDebounce (300ms) for URL controls. Reset page
  on search/filter/sort/page-size changes; use API page minus one for table pageIndex. Keep status
  filters independent of parent inactivity. After deletion, refetch and return to a valid page.
- Forms use useForm/zodResolver, Controller, reset-on-open and the selected row as initial data.
  Validate name/label with z.string().trim().min(1).max(150); infer form types. Create defaults Active;
  create and update share one upsert payload per entity; status actions include the current name/label.
- Use per-form/mutation pending state to disable repeat actions and dialog dismissal. Errors retain
  entered data. Narrow Axios response bodies from unknown; reuse IApiErrorResponse/ApiAxiosError
  where appropriate. Display verified message/errors without inventing structured field mappings.
  Display backend messages directly, with a fallback when unavailable; keep form validation errors inline.
  No error schema, shared error helper or frontend conflict-message mapping. Backend inactive guidance
  leads to user-driven inactive search and an explicit Update action on the retrieved record.
  No automatic reactivation, guessed ID, case-folding match, or hidden candidate query.
- Add ProductAttributes to the existing Page enum; use PermissionGuard and can() for navigation,
  buttons and submit/action checks. View does not imply Create/Update/Delete. Preserve the global
  interceptor's 401 refresh and 403 behavior; avoid a second mutation-403 toast already shown there.
- Add Attributes to Product Settings and PAGE_ROUTES; provide values/back links. The parent name/status
  comes from detail; inactive notice explains selection unavailability without rewriting value status.
- Confirm attribute deletion by name, permanence, all values and advisory count; individual deletion
  identifies value and parent. List failures use UIErrorState/refetch, never a misleading empty table.
  Distinguish initial loading, background fetching, no data, no matches, unavailable and pending states.

## Project Structure

### Documentation (this feature)

`specs/001-product-attributes/`: spec.md, plan.md, research.md, data-model.md,
contracts/api.md, quickstart.md, checklists/requirements.md. No tasks.md generated.

### Source Code (repository root)

Planned additions only; no source files are created by this planning command:

```text
src/app/(tenant)/settings/product-settings/attributes/page.tsx
src/app/(tenant)/settings/product-settings/attributes/[attributeId]/values/page.tsx
src/features/product-attributes/
  api/product-attributes.api.ts
  queries/product-attributes.queries.ts
  types/product-attributes.types.ts
  schemas/product-attributes.schema.ts
  components/product-attributes-container.tsx
  components/attribute-values-container.tsx
  components/attribute-form-modal.tsx
  components/attribute-value-form-modal.tsx
```

**Structure Decision**: Follow `src/features/product-categories` and Branches. Extend existing
permissions/index.ts, config/tenant-navigation.ts, shared/constants/{api,routes,titles,messages}.ts,
and lib/query/query-keys.ts. Handle Axios errors directly in the components; schema files contain form validation only.

## Complexity Tracking

No constitution violations. Necessary local corrections: direct URL narrowing avoids unsafe Branches assertions;
UIErrorState avoids failure-as-empty; fix only
CommonTablePagination's displayed range calculation for zero rows/out-of-range pages. Keep its
public API/styling and all unrelated modules intact. No replacement table, auth rewrite or new state layer.
