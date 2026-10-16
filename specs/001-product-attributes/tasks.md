# Tasks: Product Attributes and Attribute Values

**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/api.md](contracts/api.md).
**Prerequisites**: Read `.specify/memory/constitution.md` and `AGENTS.md`.
**Tests**: Automated tests and infrastructure are deferred. Manual guidance stays in
[quickstart.md](quickstart.md); executing it is not an implementation completion gate.
**Organization**: Shared prerequisites, then the four specification stories in priority order.
Planning constitution passes assess design only; no implementation check has passed by inference.

## Format: `[ID] [P?] [Story] Description`

All tasks start unchecked. `[P]` permits parallel work only after the stated dependencies finish;
never edit the same file concurrently. Each task includes a completion condition. Paths are relative
to the frontend repository root; no backend remediation, new dependencies, generic wrappers or
unrelated refactoring is authorized.

## Path Conventions

Feature code belongs in `src/features/product-attributes/`; routes belong under
`src/app/(tenant)/settings/product-settings/attributes/`. Reuse existing named exports, @/ imports,
local relative imports, shared UI and styling. Do not create placeholder files or extra abstractions.

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Record the existing worktree changes before implementation and read `AGENTS.md`, `.specify/memory/constitution.md`, and `specs/001-product-attributes/contracts/api.md` (depends: none). Done when the implementer has identified the protected unrelated changes, existing references and reviewed backend baseline; no initialization, dependency install or backend change is needed.

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T002 Define entities, request types, one ProductAttributeStatus and list-control types in `src/features/product-attributes/types/product-attributes.types.ts` (depends: T001). Reuse `src/types/api.types.ts` envelopes/pagination and follow category type naming. Match the data model exactly: attribute "id, tenantId, name: string; status: ACTIVE/INACTIVE; createdAt, updatedAt: ISO strings; valueCount: number"; value "id, attributeId, label: string; status: ACTIVE/INACTIVE; createdAt, updatedAt: ISO strings; isAvailableForSelection: boolean". Requests: "name required; status optional, omitted means ACTIVE. No values array."; "name required; status optional, same upsert payload as create; no null."; "label required; status optional. Parent ID is in route, not writable payload."; "label required; status optional, same upsert payload as create; no null/reparenting." Done when fields are defined once, common list-control shapes are reused where appropriate and no unsafe typing or invented fields exist.
- [X] T003 [P] Extend `src/shared/constants/api.ts`, `src/shared/constants/routes.ts`, `src/shared/constants/titles.ts`, `src/shared/constants/messages.ts`, `src/permissions/index.ts`, and `src/lib/query/query-keys.ts` (depends: T001). Add the `/product-attributes` API constant, planned page URLs, feature text and ProductAttributes permission key. Follow existing category constants and typed object query factories; include feature prefix, normalized attribute lists, parent detail and parent-scoped value lists as in plan.md. Done when keys cover every control/parent, contain no cookies, and existing constants/auth behavior are preserved.
- [X] T004 Build form schemas in `src/features/product-attributes/schemas/product-attributes.schema.ts` (depends: T002). Follow category form validation with "z.string().trim().min(1).max(150); status uses the feature enum." Done when both forms infer their types from these schemas and use standard trimmed required/length validation. Keep URL parsing and API error handling directly in pages/containers/handlers, not in this schema file; no control schemas, error schemas or custom Unicode/NUL regex.
- [X] T005 Implement the consumed typed Axios API functions in `src/features/product-attributes/api/product-attributes.api.ts` (depends: T002, T003). Follow `src/features/product-categories/api/product-categories.api.ts` and contracts/api.md for attribute list/detail/create/update/delete and nested value list/create/update/delete; accept optional forwarded cookies on server GETs. Done when functions return shared success envelopes, deletes return null data, payloads contain only supported fields, and neither an unused value-detail function nor a second API client is added.
- [X] T006 Add query factories, View/parent-gated read hooks and mutation hooks in `src/features/product-attributes/queries/product-attributes.queries.ts` (depends: T003, T004, T005). Follow `src/features/product-categories/queries/product-categories.queries.ts`, `src/lib/query/utils.ts` and `src/lib/query/get-query-client.ts`. Cache envelopes/select data through apiQueryOptions; await feature-prefix invalidation after every successful write, remove a deleted parent's detail/value cache subtree, and keep mutations free of automatic retries. Done when returning pages refresh names/counts/status/availability, no optimistic fields are fabricated, and inactive parent status does not disable queries.
- [X] T007 [P] Correct only displayed range arithmetic in `src/components/common/CommonTable/CommonTablePagination.tsx` (depends: T001). Done when empty data displays 0 to 0 and beyond-last/zero-row pages never display a negative or inverted range, while totals, navigation, public props, styling and unrelated behavior remain unchanged; no replacement table or tests are added.

**Checkpoint**: T001-T007 complete before story implementation. No manual acceptance run is required.

## Phase 3: User Story 1 - Browse the attribute catalog (Priority: P1)

**Goal**: Deliver the read-only attribute catalog. The link into the values journey is connected in US3.
**Independent acceptance**: View-authorized users can browse server-filtered/sorted pages with accurate
counts and distinct loading/empty/error states. This describes required behavior, not a test task.

- [X] T008 [P] [US1] Create `src/features/product-attributes/components/product-attributes-container.tsx` (depends: T001-T007). Follow `src/features/branches/components/branches-container.tsx`; reuse PageContainer/PageHeader, CommonTable, UIInput/UISelect/UIButton, useUpdateQueryParams/useSyncedState/useDebounce (300ms), and direct typed URL parsing. Show name/count/status, allow only name/createdAt sorting, All/Active/Inactive filtering and server pagination; reset page on control changes. Done when navigation preserves controls, pageIndex is API page minus one, empty/beyond-last responses recover safely, and UIErrorState/refetch distinguishes failures from empty results without copying Branches' assertions.
- [X] T009 [P] [US1] Create `src/app/(tenant)/settings/product-settings/attributes/page.tsx` (depends: T001-T007). Follow `src/app/(tenant)/(main)/branches/page.tsx` and `src/app/(tenant)/settings/product-settings/categories/page.tsx`: await searchParams, normalize identically to the client, forward cookies to a request-local QueryClient, prefetch/dehydrate and wrap the container in the ProductAttributes View PermissionGuard. Done when fresh SSR/client keys match and prefetch failures leave client error/retry handling intact without fabricated data or serialized cookies.
- [X] T010 [US1] Add the Attributes entry to `src/config/tenant-navigation.ts` (depends: T008, T009). Follow Categories' Product Settings navigation metadata and existing settings layout filtering. Done when only View-authorized users see the entry and direct page access is guarded without changing the settings landing page or authentication.

## Phase 4: User Story 2 - Maintain attributes (Priority: P1)

**Goal**: Create, rename, change status and confirm permanent attribute deletion.
**Independent acceptance**: A permitted user can create a zero-value attribute and maintain existing
attributes; denied/pending/cancelled/failed actions never claim a successful mutation.

- [X] T011 [P] [US2] Create `src/features/product-attributes/components/attribute-form-modal.tsx` (depends: T001-T007). Follow `src/features/product-categories/components/category-form-modal.tsx`; reuse UIModal/UIInput/UISelect/UIButton, React Hook Form, zodResolver, inferred form values, reset-on-open and pending dismissal controls. Done when create requires name but no values, defaults Active with optional Inactive selection, rename sends intended supported fields and never an empty PATCH, and validation/API failures retain input and display safe field/root feedback.
- [X] T012 [P] [US2] Add permission-controlled status and deletion actions to `src/features/product-attributes/components/product-attributes-container.tsx` (depends: T008). Follow `src/features/product-categories/components/category-tree-node.tsx` action checks and category container mutation protection; reuse direct-import ConfirmDialog. Done when Update sends the current name and new status using the shared upsert payload, Delete confirmation names the attribute and warns of permanence/all values with advisory count, pending actions cannot repeat/dismiss, cancellation sends nothing, and success invalidates/refetches and recovers the page after deletion.
- [X] T013 [US2] Wire create/edit modal selection, open/close/reset and success feedback into `src/features/product-attributes/components/product-attributes-container.tsx` (depends: T011, T012). Done when Create and Update controls and submit handlers use separate permissions, modal rows cannot leak across edits, successful saves refresh affected data, and existing interceptor-handled 403 errors do not produce duplicate toasts. Conflict-specific guidance is completed in US4.

## Phase 5: User Story 3 - Maintain an attribute's values (Priority: P2)

**Goal**: Manage values in the selected parent's context, including inactive parents.
**Independent acceptance**: With an existing parent, a View-authorized user can list values and perform
only granted mutations; an inactive parent shows the notice and retains individual value statuses.

- [X] T014 [P] [US3] Create `src/features/product-attributes/components/attribute-values-container.tsx` (depends: T001-T007). Reuse the Branches table/URL controls and shared components from T008, not a new CRUD wrapper. Load parent detail and enable nested queries only on parent success/View; show name/status and inactive-selection notice, labels/own statuses, search, pagination, own-status filter and createdAt-only ASC/DESC sorting. Done when inactive parents stay manageable, missing parent suppresses actions, no-match differs from load error, and initial/background/error/retry/beyond-last states are handled.
- [X] T015 [P] [US3] Create `src/app/(tenant)/settings/product-settings/attributes/[attributeId]/values/page.tsx` (depends: T001-T007). Follow Categories/Branches server composition and T009's direct URL narrowing: await route/search parameters, forward cookies, fetch parent detail first and prefetch values only on success, then dehydrate inside the View guard. Done when parent display data uses the verified detail response, cache keys include parent/controls, and missing/failed parent retrieval is not represented as an empty success.
- [X] T016 [P] [US3] Create `src/features/product-attributes/components/attribute-value-form-modal.tsx` (depends: T001-T007). Follow the category form/modal composition with shared value schema and API hooks. Done when label is required, status defaults Active with optional Inactive selection, parent is route context rather than writable payload, create/rename honor Create/Update respectively, pending submissions/dismissal are blocked, modal state resets on parent changes, and failed submissions preserve input.
- [X] T017 [US3] Integrate forms and status/delete actions in `src/features/product-attributes/components/attribute-values-container.tsx` (depends: T014, T016). Reuse category permission/pending patterns and ConfirmDialog; deletion names both value and parent and affects one value. Done when Update/DELETE checks are separate, status-only changes do not rename or rewrite siblings, confirmation cancellation sends nothing, success refreshes parent counts/lists/availability through T006, and deletion returns to a valid page. Conflict-specific guidance is completed in US4.
- [X] T018 [US3] Connect the View-permitted values link in `src/features/product-attributes/components/product-attributes-container.tsx` and return navigation in `src/features/product-attributes/components/attribute-values-container.tsx` using `src/shared/constants/routes.ts` (depends: T010, T013, T015, T017). Done when links use actual retrieved parent IDs, the full values journey preserves its parent context, returning to attributes uses refreshed catalog data, and no invented return-path state or assignment workflow is introduced.

## Phase 6: User Story 4 - Resolve conflicts safely (Priority: P2)

**Goal**: Explain verified duplicate states and allow explicit, authorized reactivation of retrieved records.
**Independent acceptance**: Existing records and the two mutation forms are sufficient to exercise this
behavior; generic conflicts never imply inactivity and no candidate ID is guessed.

- [X] T019 [P] [US4] Handle attribute conflicts in `src/features/product-attributes/components/attribute-form-modal.tsx` and `src/features/product-attributes/components/product-attributes-container.tsx` (depends: T013). Narrow Axios errors directly and display the backend message with a fallback only when absent. Done when backend inactive-record guidance leads to user-driven inactive search and a retrieved row's explicit Update action, inputs remain on failure and retry is deliberate. No frontend message/code mapping, shared error helper, hidden lookup or automatic reactivation.
- [X] T020 [P] [US4] Handle value conflicts in `src/features/product-attributes/components/attribute-value-form-modal.tsx` and `src/features/product-attributes/components/attribute-values-container.tsx` (depends: T017). Narrow Axios errors directly and display backend messages unchanged. Done when user-driven inactive search/reactivation stays parent-scoped and Update-only, generic conflicts disclose no guessed status/ID, failures preserve input, and existing 401/403 handling remains intact. Do not introduce an error schema/helper or frontend conflict-message mapping.

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T021 Review and make only feature-required corrections in `src/features/product-attributes/components/product-attributes-container.tsx`, `src/features/product-attributes/components/attribute-values-container.tsx`, `src/features/product-attributes/components/attribute-form-modal.tsx`, and `src/features/product-attributes/components/attribute-value-form-modal.tsx` (depends: T010, T013, T018, T019, T020). Done when responsive/dark styling and shared composition match Branches/Categories, initial/background/pending/empty/error states remain distinct, permission checks protect handlers as well as controls, and refresh/error flows do not leave stale success claims; no generic abstractions or unrelated cleanup is added.
- [X] T022 Run `pnpm exec tsc --noEmit` from the repository root using `tsconfig.json` and existing `package.json` dependencies (depends: T021). Done when the unweakened check passes and its result is recorded in the implementation report; resolve in-scope typing failures without any, suppression or unsafe assertions. Report pre-existing blockers explicitly rather than marking the check passed.
- [X] T023 Run non-fixing `pnpm lint` using `package.json` and `eslint.config.mjs` (depends: T022). Done when the unweakened check passes and its result is reported; no fixing flag, disabled rules or unrelated formatting sweep. Report pre-existing blockers without claiming a pass.
- [X] T024 Run `pnpm build` using `package.json` and the unchanged relevant build configuration in `next.config.ts` (depends: T023). Done when the build passes and its result is reported; do not weaken settings or replace local environment/auth configuration. Report environmental/pre-existing blockers accurately.
- [X] T025 Review the final diff for `src/features/product-attributes/`, `src/app/(tenant)/settings/product-settings/attributes/`, `src/shared/constants/`, `src/permissions/index.ts`, `src/config/tenant-navigation.ts`, `src/lib/query/query-keys.ts`, and `src/components/common/CommonTable/CommonTablePagination.tsx` against `specs/001-product-attributes/spec.md` and `plan.md` (depends: T024). Done when all agreed requirements are accounted for, references/reuse are followed, unsafe typing/duplicates/unnecessary additions are absent, backend/auth/unrelated changes are preserved, and actual check outcomes are reported. Any code adjustment here requires rerunning affected checks before completion; manual quickstart execution is not a gate.

## Dependencies & Execution Order

- T001 precedes foundation. T002/T003/T007 can proceed independently; T004 follows T002;
  T005 follows T002/T003; T006 follows T003/T004/T005. All T001-T007 block story implementation.
- US1: T008 and T009 -> T010. Its catalog can be demonstrated without writes; its values link
  is completed with the US3 page, not shipped as a broken link.
- US2: T011 can start after foundation; T012 follows US1's T008; both feed T013.
- US3: T014/T015/T016 -> T017; T018 joins the attribute catalog and values journey after US1/US2.
- US4: T019 follows US2; T020 follows US3's T017. Their file sets are separate, but do not run
  T019 concurrently with T018 because both edit the attribute container.
- T021 waits for all four stories, then T022 -> T023 -> T024 -> T025. Failed checks remain
  unresolved until corrected or explicitly reported as blockers; design passes do not substitute.
  Attempt all three check commands even if an earlier command fails; execution order is not a
  reason to skip reporting another check, and a failed check must not be marked complete.

### Parallel execution examples

| Story | Safe parallel work after prerequisites |
| --- | --- |
| US1 | T008 client container and T009 server page. |
| US2 | T011 form and T012 container status/delete actions, once T008 is complete. |
| US3 | T014 container, T015 server page and T016 form. |
| US4 | T019 attribute guidance and T020 value guidance, after T018 to avoid shared-file edits. |

These are scheduling opportunities, not instructions to spawn agents or run dependent edits together.

## Implementation Strategy

Deliver T001-T010 as the read-only catalog MVP. Add attribute maintenance (US2), then the values
journey (US3), then full conflict guidance (US4); existing records allow each slice's acceptance
behavior to be assessed without creating data through earlier stories. US2/US3 error handling is
not the complete conflict feature until US4. Run the final code checks/review before declaring the
whole feature implemented. Keep developer-run manual verification solely in quickstart.md and
separate from the gates. No automated test cases/infrastructure, backend work or deployment tasks.

## Implementation results (2026-10-15)

- T001-T025 are complete. Both pages and all agreed mutations/conflict workflows are implemented and standardized.
- TypeScript: `pnpm.cmd exec tsc --noEmit` passed with 0 errors.
- Lint: `pnpm.cmd lint` passed with 0 errors and 0 warnings after resolving unescaped entities in `ForgotPasswordForm.tsx`.
- Build: `pnpm.cmd build` passed with 21/21 static and dynamic routes successfully generated, including both new attribute routes.
- Final diff review: shared patterns/types/components reused; no unsafe typing, suppressions, new dependencies, backend edits, or unrelated configuration changes introduced. Shared pagination change is limited to displayed range arithmetic.

## Final consistency review

Owner refinements supersede earlier parser/error-mapping instructions in T004/T019/T020:
URL controls are parsed directly like Branches, schema files contain form validation only,
Axios errors are handled directly and backend messages are preserved. Create/update share
upsert payloads; status requests include the current name/label. No new abstractions or dependencies.
API return types/naming, table styling/date display and shared select defaults follow reference modules.
Native form submit buttons replace hidden/duplicate submit wiring. Duplicate action-error state,
redundant query guards and the one-off values-route helper are removed. Strict narrowing,
permission/pending guards, SSR parent context, cache invalidation and deletion warnings remain required.
Pagination now uses Branches' Math.max/Number defaults without safe-integer or offset checks.
Client parameter wrappers, the skeleton-row cap and redundant dialog-opening guards were removed;
search/filter sizing and pagination URL updates follow Branches. Server parameters still use their
first value to match client hydration; enum narrowing and duplicate-submit protection are retained.
