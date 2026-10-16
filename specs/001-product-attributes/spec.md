# Feature Specification: Product Attributes and Attribute Values

**Feature Branch**: `chore/setup-spec-kit`

**Created**: 2026-10-14

**Status**: Specified; planning uses the owner's reviewed backend baseline (2026-10-15).

**Input**: Manage tenant attributes and their values within the existing Product Settings experience.

## User Scenarios & Testing *(mandatory)*

Acceptance criteria below describe required behavior, not generated test cases. Automated tests
are deferred; manual verification is developer-run.

### User Story 1 - Browse the attribute catalog (Priority: P1)

A user with View permission opens Settings > Product Settings > Attributes to find an attribute
and open its values.

**Why this priority**: Catalog visibility is the entry point for all management journeys.

**Acceptance Scenarios**:

- Rows show name, total value count, own status, and only permitted actions.
- Search, status filtering, page/page-size changes, and name/creation-date sorting reflect the
  complete matching catalog, not just the visible page. Values open in their parent's context.
- Loading, no attributes, no matches, and load failures have distinct, understandable states.

### User Story 2 - Maintain attributes (Priority: P1)

A permitted user creates an attribute, renames it, changes its status, or removes it permanently.

**Why this priority**: Attributes must exist independently before values can be managed.

**Acceptance Scenarios**:

- Creation needs a valid name but no values; the new attribute initially has zero values.
- Rename and status actions require Update permission; Create permission alone cannot reactivate.
- Deletion requires Delete permission and confirmation naming the attribute, explaining permanence
  and removal of all related values. Cancellation changes nothing.
- A rejected write keeps the user's input and displays validation/conflict/error guidance.

### User Story 3 - Maintain an attribute's values (Priority: P2)

A user opens a separate values page to browse and maintain the selected attribute's values.

**Why this priority**: Values become useful once their parent attribute exists.

**Acceptance Scenarios**:

- The page shows the parent name/status and rows with value label, own status, and permitted actions.
  Search, pagination, own-status filtering, and creation-date sorting apply to that parent only.
- Permitted users create, rename, activate/deactivate, or confirm permanent deletion of a value.
  Value deletion identifies both the value and parent and affects only that value.
- An inactive parent remains manageable with a notice that its values are unavailable for selection.
  Parent status changes preserve every individual value status.

### User Story 4 - Resolve conflicts safely (Priority: P2)

A user receives actionable guidance when a name or label is already reserved.

**Why this priority**: Conflict recovery must preserve record identity and permissions.

**Acceptance Scenarios**:

- Active duplicates explain the conflict without suggesting reactivation. Inactive conflicts explain
  that the existing record can be reactivated by a user with Update permission.
- A user with View may find an inactive record through scoped search/filtering. Reactivation uses
  that retrieved record and a separate explicit Update action; no ID is guessed and no creation
  automatically reactivates a record. A user without Update receives guidance only.
- Ambiguous duplicates do not claim a record is inactive. Pending actions cannot be submitted twice;
  successful writes refresh affected catalog, parent, and value information.

### Edge Cases

- Blank/whitespace-only text, excessive length, and backend validation errors remain visible in forms.
- Invalid list controls fall back to supported defaults. Empty results show accurate zero totals;
  a page beyond the last offers navigation back, without displaying an impossible item range.
- If deletion empties the current page, move to the nearest available page or the empty first page.
- Missing/removed/foreign parents or values show an unavailable state without ownership disclosure.
- Revoked permissions, expired sessions, network failures, and concurrent conflicts do not appear as
  successful actions or empty catalogs. Retryable errors allow deliberate retry without a loop.
- Counts may change concurrently; deletion wording always covers all related values, without promising
  a fixed count or introducing a freshness/confirmation capability the backend does not provide.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Provide the Attributes navigation entry and both pages only with ProductAttributes View
  permission, including direct access. Preserve existing authentication/unauthorized behavior.
- **FR-002**: List attribute name, value count across all value statuses, own status, and permitted
  actions. Provide name search, All/Active/Inactive filtering, server-side pagination, and ascending
  or descending name/creation-date sorting.
- **FR-003**: Open a values page from an attribute and provide return navigation. Show parent name/status,
  value labels/statuses, permitted actions, label search, server-side pagination, All/Active/Inactive
  own-status filtering, and ascending/descending creation-date sorting only.
- **FR-004**: Reset to the first page when search, filter, sorting, or page size changes. Clearing search
  restores unfiltered results within the selected status. Keep list controls synchronized with navigation.
- **FR-005**: Create attributes independently and values under their existing parent with Create permission.
  Default new records to Active and allow the existing form convention to select Inactive.
- **FR-006**: Permit rename, activation, deactivation, and explicit reactivation only with Update permission;
  status-only changes must not rename records or alter child statuses.
- **FR-007**: Keep values manageable under inactive parents. Explain unavailability for selection;
  availability requires both parent and value to be Active, without providing an assignment workflow.
- **FR-008**: Follow existing form/modal conventions. Trim names/labels, reject empty text, and enforce
  the agreed maximum of 150 using standard validation. Add no custom Unicode/NUL regex validation;
  display additional backend validation failures without assuming identical validation rules.
- **FR-009**: Require Delete permission and explicit permanent-deletion confirmation. Attribute confirmation
  names the attribute and warns that all values are deleted; value confirmation names value and parent.
  Cancellation sends no mutation. Show the latest displayed value count as advisory, not guaranteed.
- **FR-010**: Handle active/inactive duplicate conflicts and generic conflicts. Names are reserved within
  the tenant; labels within the parent, including inactive records. Offer reactivation guidance only
  for verified inactive conflicts; actual reactivation requires a retrieved record and Update permission.
- **FR-011**: Show loading, empty/no-match, validation, API error, and pending states. Preserve form input
  after failure; prevent repeated pending actions and dismissal of pending mutation dialogs.
- **FR-012**: After successful writes, show success feedback and refresh affected lists/details, parent
  name/status, value count, and selection availability. Failures must not produce success feedback.
- **FR-013**: Match existing responsive styling and permission-aware controls. Follow the constitution and
  AGENTS.md reference modules; no new dependencies or unrelated authentication/refactoring changes.

### Key Entities *(include if feature involves data)*

- **Attribute**: A tenant-owned named catalog entry with Active/Inactive status, creation/update times,
  and a count of all related values. It can exist without values.
- **Attribute Value**: A labeled entry belonging to one attribute, with its own Active/Inactive status
  and creation/update times. Selection availability depends on both statuses, not a separate stored status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete all attribute and value management actions permitted to them from these
  two pages, including creating an attribute with zero values, without leaving Product Settings.
- **SC-002**: Every displayed page, total, filter, and supported sort reflects the matching parent/tenant
  catalog; successful changes appear without a manual browser reload.
- **SC-003**: Every destructive action requires confirmation, every cancellation leaves records unchanged,
  and every pending action accepts at most one submission until completion.
- **SC-004**: No action grants capabilities from another permission; no conflict automatically reactivates
  a record; changing parent status changes zero individual value statuses.
- **SC-005**: Both pages remain usable at mobile and desktop widths with visible feedback for loading,
  empty results, invalid input, and failures; users can distinguish failure from absence of records.

## Assumptions

- Defaults: first page, 10 rows, newest first, both statuses. Page-size choices follow the existing table.
- Existing tenant/session context and manually assigned ProductAttributes permissions are prerequisites.
  Backend permission checks remain authoritative; administrator names provide no implied grants.
- Integration uses only currently verified backend capabilities. The [quality review and integration
  findings](checklists/requirements.md#integration-verification-2026-10-15) reflect the owner's reviewed
  current code as authoritative. Earlier backend remediation is deferred; requirements are unchanged.
  Source review is not live API verification.
- Category assignment/inheritance, product assignments, static/dynamic attributes, variants, bulk operations,
  and replacement/reassignment workflows are excluded. Backend files are not changed by this feature.
- This deliverable is specification only. Planning, tasks, code, generated test cases, and automated test
  infrastructure are excluded; later implementation retains TypeScript, non-fixing lint, and build checks.
