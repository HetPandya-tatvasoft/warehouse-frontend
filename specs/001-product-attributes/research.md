# Research Decisions

Date: 2026-10-15. All decisions use the inspected repository; no external technology selection.

## Backend baseline

**Decision**: Integrate current reviewed backend source, as directed by the owner. Earlier backend
remediation is deferred; do not restore removed code or require old plans to be reinstated.
**Rationale**: Current controllers, DTOs, services, mappers and exception handling provide all agreed
workflows. Frontend integration facts are in [contracts/api.md](contracts/api.md).
**Alternatives considered**: Reconcile old backend documents/code first; rejected by owner direction.
No workflow-blocking discrepancy was found. Generic duplicate responses cannot identify inactivity;
the spec already requires generic handling for ambiguous conflicts, not invented reactivation data.

## Reuse and page composition

**Decision**: Branches supplies table/URL behavior; Categories supplies settings, forms and permissions.
**Rationale**: Both already use the required shared components, Axios, React Query and form validation.
See AGENTS.md for paths; primary code references are branches-container.tsx, category-form-modal.tsx,
category-tree-node.tsx and their page/api/query modules.
**Alternatives considered**: Generic CRUD framework, separate values feature, new dependencies;
all add unnecessary structure. Keep one product-attributes feature with two containers/two forms.

## SSR and cache identity

**Decision**: Direct Branches-style URL parsing with matching server/client defaults; cookie-forwarded prefetch and hydration.
Fetch parent detail before nested values; key nested data by parent and normalized controls.
**Rationale**: Server and client must address identical data; envelopes remain in cache, selectors
unwrap only for hook consumers. Cookie context is request-only, never part of query keys.
**Alternatives considered**: Client-only fetching loses the established SSR pattern; copying Branches'
unchecked assertions permits invalid controls. A new global parser would exceed this feature's needs.

## Mutation consistency

**Decision**: Await feature-prefix invalidation after writes; remove a deleted parent's cache subtree.
**Rationale**: Existing category invalidation is simple and refreshes counts, parent context and
availability across both pages; staleTime alone is insufficient.
**Alternatives considered**: Optimistic updates and a dependency graph add failure paths without a
requirement. Backend timestamps/counts/availability remain authoritative.

## Validation and errors

**Decision**: Standard trimmed 1-150 validation, unknown-body narrowing, existing UI feedback.
Display backend messages directly; no error schema/helper or frontend message mapping. No automatic reactivation or retries.
**Rationale**: Matches the constitution and current API without reproducing backend internals.
**Alternatives considered**: Custom Unicode/NUL regex, duplicate preflight or reactivation-by-name;
rejected as prohibited or unable to establish identity safely.

## Required local correctness changes

**Decision**: Use UIErrorState on list failure and correct only shared pagination range arithmetic.
**Rationale**: The references otherwise display failed queries as empty and can show 0 to -1 or
an out-of-range start. Keep existing composition and clamp/return page after successful responses.
**Alternatives considered**: New table/error abstractions or broad fixes to other modules are unnecessary.

No unresolved research questions or new backend requirements remain. Source verification is not
live API verification. Automated tests remain deferred; manual guidance is separate in quickstart.md.

Owner refinements: create/update share upsert payloads; no shared control parser or error helper.
Native form submission replaces duplicate submit wiring. Existing shared UI defaults are reused.
