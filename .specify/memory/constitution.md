<!--
Sync Impact Report (remove before committing)
Version: unratified scaffold -> 1.0.0 (initial adoption)
Principles added: I. Codebase Consistency; II. Reuse and Agreed Scope;
III. Strict Types and Verified APIs; IV. Established Data and Form Patterns;
V. Permissions and Complete UI States.
Sections added: Delivery Constraints; Review and Verification; Governance.
Sections removed: none. Existing scaffold placeholders replaced.
Deferred placeholders / follow-up TODOs: none.
Templates and commands unchanged; they read the constitution at runtime.
AGENTS.md added with repository reference paths and practical examples, as requested.
-->
# Warehouse Inventory Management Frontend Constitution

## Core Principles

### I. Codebase Consistency

All future planning and implementation MUST follow the existing App Router and feature
organization: feature-local api, queries, types, schemas, and components; existing file naming,
named exports where established, @/ imports, and local relative imports. Next.js route exports
MUST retain framework conventions. Component composition, shared UI usage, Tailwind classes,
theme tokens, and responsive/dark styling MUST follow the closest module. Branches is the
reference for paginated tables; Categories is the reference for settings integration, forms,
and action permissions. Personal style preferences MUST NOT justify changes.

### II. Reuse and Agreed Scope

Before creating components, hooks, utilities, types, or abstractions, contributors MUST inspect
and reuse existing shared building blocks and dependencies when they fit. New abstractions
require a brief explanation of the unmet requirement. Work MUST implement only agreed scope;
unnecessary wrappers, duplicated functionality, speculative features, new dependencies, and
unrelated refactoring are prohibited. When a pattern conflicts with correctness, type safety,
or an agreed requirement, contributors MUST explain the conflict and make the smallest
necessary adjustment instead of copying a defect or redesigning surrounding code.

### III. Strict Types and Verified APIs

TypeScript strictness MUST remain enabled. Explicit or implicit any, @ts-ignore, unsafe type
assertions, and non-null assertions that hide errors are prohibited. Genuinely unknown data
MUST use unknown with proper narrowing. Request, response, sorting, status, and error types
MUST reflect verified backend routes, DTOs, mappers, and error handling; shared API envelopes
and pagination types MUST be reused. Contract discrepancies MUST be reported before relying
on disputed behavior. Contributors MUST NOT invent endpoints, fields, or error codes.

### IV. Established Data and Form Patterns

API functions MUST use the existing Axios client and typed response envelopes. React Query
MUST use the shared query-key factories, apiQueryOptions, and established query/mutation hooks.
Keys MUST distinguish request controls and parent identity where applicable. Successful
mutations MUST invalidate affected lists/details and dependent data using existing cache
invalidation patterns. Forms MUST use React Hook Form, Zod, the existing resolver, and shared
field/modal components. Validation MUST trim text before rejecting empty values and enforcing
the agreed length limit with standard validators; custom Unicode/NUL regex validation is
prohibited. Client validation MUST not replace backend validation. API errors MUST be narrowed
safely and displayed using existing inline errors, error states, and Sonner notifications;
verified conflict codes MUST receive the agreed guidance.

### V. Permissions and Complete UI States

Pages and navigation MUST use existing View permission guards/filtering. Create, rename,
status/reactivation, and delete actions MUST respect their distinct Create/Update/Delete
permissions through existing utilities; one permission MUST NOT imply another. Backend
authorization remains authoritative. Shared loading, pending, empty, validation, and API error
states MUST be composed as appropriate, without presenting failed requests as empty results.
Destructive actions MUST use explicit confirmation describing permanence and affected records;
attribute deletion MUST explain that its values are also deleted. Existing authentication,
cookie handling, token refresh, and unauthorized behavior MUST be preserved.

## Delivery Constraints

Product Attributes and Attribute Values work MUST exclude category assignment, inheritance,
product assignment, and variants unless separately agreed. Automated tests are deferred for
this feature; this is not a repository-wide testing exemption. Manual verification is
developer-run and MUST NOT be claimed without reported evidence. Documentation MUST remain
concise and human-readable, adding detail only when needed. Unrelated worktree changes MUST
be preserved. Concrete reference paths and practical examples belong in AGENTS.md.

## Review and Verification

Every plan MUST identify reference implementations, reusable building blocks, verified API
behavior, and any smallest necessary deviations. Before implementation is reported complete,
contributors MUST review the diff for duplicate functionality, unnecessary additions, unsafe
typing, scope changes, and departures from references. Repository TypeScript checks,
non-fixing lint, and build checks MUST run without weakening configuration; failures and
limitations MUST be reported. Documentation-only constitution updates require content and
scope review, without application builds or automated tests.

## Governance

These principles are mandatory for all future planning and implementation. Amendments MUST
record the reason, changed principles, version, and amendment date and receive owner approval.
Versions follow semantic versioning: major for incompatible principle changes/removals, minor
for new or expanded obligations, patch for clarifications. Plans and implementation reviews
MUST verify compliance; justified local adjustments MUST be documented. AGENTS.md provides
practical guidance and MUST remain aligned without duplicating this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-10-14 | **Last Amended**: 2026-10-14
