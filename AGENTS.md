# Repository Guidance

Read `.specify/memory/constitution.md` before planning or implementation. It contains the
mandatory standards; this file supplies reference paths and practical examples.

## Reference modules

- Paginated tables: `src/features/branches/components/branches-container.tsx` demonstrates
  CommonTable with server pagination/sorting, URL controls, status filtering, and action buttons.
  Reset page to 1 when search, status, sort, or page size changes.
- Settings integration: `src/app/(tenant)/settings/product-settings/categories/page.tsx`
  demonstrates cookie-forwarded server prefetch, hydration, and the View PermissionGuard.
  Use `src/app/(tenant)/settings/layout.tsx` and `src/config/tenant-navigation.ts` for navigation.
- Forms: `src/features/product-categories/components/category-form-modal.tsx` and
  `src/features/product-categories/schemas/product-categories.schema.ts` demonstrate
  useForm, zodResolver, Controller, field errors, reset-on-open, and pending modal controls.
  For new name/label schemas, use standard `z.string().trim().min(1).max(150)` validation;
  the category schema currently checks length before submit-time trimming.
- Actions: `src/features/product-categories/components/category-tree-node.tsx` demonstrates
  permission-filtered menus; `product-categories-container.tsx` demonstrates status mutations,
  confirmation, and UIErrorState. Its tree/client search does not represent paginated listing.

## Shared building blocks

- UI: `src/components/common` supplies PageContainer, PageHeader, CommonTable, UIInput,
  UISelect, UIButton, UIModal, ConfirmDialog, UILoader, UIErrorState, and Unauthorized.
  Follow existing barrel/direct exports; ConfirmDialog currently uses a direct file import.
- URL/search state: `src/shared/hooks/use-update-query-params.ts`, `use-synced-state.ts`,
  and `use-debounce.ts`. CommonTable uses zero-based pageIndex; the API uses one-based page.
- API reference: `src/features/product-categories/api/product-categories.api.ts` and
  `queries/product-categories.queries.ts`. Infrastructure: `src/lib/api/axios-instance.ts`,
  `src/lib/query/utils.ts`, `query-keys.ts`, and `get-query-client.ts`.
- Types: `src/types/api.types.ts` supplies success/error envelopes, IPaginatedResponse,
  and ApiAxiosError. Query-key list factories accept typed objects directly; the reference
  module's Record<string, unknown> casts are unnecessary. Narrow URL enums/numbers and unknown
  error bodies instead of copying unchecked assertions or untyped response.data access.
- Permissions: `src/permissions/index.ts`, `PermissionGuard.tsx`, and `use-permissions.ts`.
  Routes/messages/titles live in `src/shared/constants`; preserve the authentication behavior
  in `src/lib/api/auth-interceptor.ts` and `src/providers/query-provider.tsx`.
- Styling: match reference Tailwind/theme classes and use `cn` from `src/lib/utils.ts`.

## Product Attributes API reference

Contract: `D:/Tatvasoft/WarehouseInventoryManagement/BE/warehouse-inventory-mgmt/specs/001-product-attributes/contracts/api.md`.
Backend source: the sibling BE repository's `src/modules/settings/product-settings/` directory.
Verify its controllers, DTOs, mappers, services, and `errors/attribute-conflict.util.ts` together
with `src/main.ts` before defining the frontend API. Per the owner's 2026-10-15 decision, current
reviewed backend code is authoritative; older discrepancy remediation is deferred. Do not restore
removed code or enforce outdated backend plans. Flag only limitations that block an agreed workflow.
Current frontend integration notes: `specs/001-product-attributes/contracts/api.md`.

## Completion checks

Use the repository's pnpm tooling after implementation:

- TypeScript: `pnpm exec tsc --noEmit` (no dedicated typecheck script exists).
- Non-fixing lint: `pnpm lint`.
- Build: `pnpm build`.

Review the diff and report check outcomes. Automated tests remain deferred for Product
Attributes/Values; manual verification is developer-run. For table pagination, check empty
and beyond-last pages: CommonTablePagination's existing range calculation needs care.
