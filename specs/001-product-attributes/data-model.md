# Frontend Data Model

Source baseline: reviewed backend on 2026-10-15. This defines frontend types/state, not new storage.
Reuse IApiSuccessResponse, IApiErrorResponse, IPaginatedResponse and ApiAxiosError from
`src/types/api.types.ts`; do not duplicate envelopes.

## Response entities

| Entity | Verified fields | Relationship |
| --- | --- | --- |
| IProductAttribute | id, tenantId, name: string; status: ACTIVE/INACTIVE; createdAt, updatedAt: ISO strings; valueCount: number | Tenant-owned; zero or more values, all statuses counted. |
| IAttributeValue | id, attributeId, label: string; status: ACTIVE/INACTIVE; createdAt, updatedAt: ISO strings; isAvailableForSelection: boolean | Exactly one parent; no embedded parent name/status. |

Define one ProductAttributeStatus for both entities in the feature types module; do not couple
these types to the category-specific status enum. IDs stay strings from verified responses.
No effective-status property, normalized name, assignment data, or product role is invented.

## Requests and controls

| Type | Fields/rules |
| --- | --- |
| Create attribute | name required; status optional, omitted means ACTIVE. No values array. |
| Update attribute | Same upsert as create: name required, status optional; no null. |
| Create value | label required; status optional. Parent ID is in route, not writable payload. |
| Update value | Same upsert as create: label required, status optional; no null/reparenting. |
| Attribute list | Branches-style page/pageSize defaults using Math.max(1, Number(value) or default); sortBy name/createdAt; sortOrder ASC/DESC; optional trimmed search/status. |
| Value list | Same common controls; sortBy restricted to createdAt; parent ID supplied separately. |

Use the same upsert request type for create/update, per owner direction. Reuse common list-control
shapes with TypeScript utility types where appropriate rather than copying category payloads. Define feature-specific
response fields once; infer form values from the Zod schemas. Reuse common controls between the two
lists, replacing only allowed sort fields. Do not move unrelated feature types into a new global layer.

## Form and transient state

Name/label schemas use standard z.string().trim().min(1).max(150); status uses the feature enum.
Backend validation messages remain authoritative for additional rejected input. Forms hold selected
record/open state, validation/root errors, and pending state; no persisted client catalog or draft store.
List controls live in URL; use the same normalization for server and client, with field defaults for
invalid values. Modal selection resets on open/close and parent changes to avoid editing the wrong row.

## Transitions and derived information

- Create -> ACTIVE by default (or explicit INACTIVE), independently of creating values.
- ACTIVE <-> INACTIVE requires Update. Parent transition changes no child's own status.
- Selection availability is returned by the backend from parent ACTIVE and child ACTIVE; use parent
  detail for the inactive notice, and refetch children after parent changes made in this feature.
- Delete requires confirmation and Delete permission: value -> removed; parent -> parent/all values removed.
  Counts are advisory; no confirmation token or count-equality precondition is sent.
- Duplicate errors preserve inputs and identity. The backend inactive-conflict message offers guidance, then user-driven
  search retrieves the actual candidate before a separate authorized status PATCH. Generic conflicts
  reveal no status or candidate; cancellation and failed writes make no claimed transition.
