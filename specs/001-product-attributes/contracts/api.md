# Frontend Integration Contract

Verified 2026-10-15 against the owner's reviewed backend source. This is a consumer contract;
it neither changes the backend nor requires restoration of older generated decisions.

## Authority and source references

Backend repository: `../../BE/warehouse-inventory-mgmt` relative to the frontend repository root.
The older `specs/001-product-attributes/contracts/api.md` was read for context; current code wins.
Source references below are relative to the backend's `src/`:

- `main.ts`, `app.module.ts`, `modules/settings/settings.module.ts`, and
  `modules/settings/product-settings/product-settings.module.ts` establish routing/registration.
- Under `modules/settings/product-settings/`: `controllers/attributes.controller.ts`,
  `controllers/attribute-values.controller.ts`, both `dto/attribute/` and `dto/attribute-value/`
  directories, `mappers/attribute.mapper.ts`, `mappers/attribute-value.mapper.ts`, both attribute
  services/repositories, `errors/attribute-conflict.util.ts`.
- `common/dto/pagination-query.dto.ts`, `common/types/api-response.interface.ts`,
  `common/utils/api-response.util.ts`, `common/filters/http-exception.filter.ts` define shared behavior.

## HTTP surface

Effective base: `/api/product-attributes`. Add `/product-attributes` to frontend API_ROUTES;
retain the existing configured API base/prefix, cookie credentials and server cookie forwarding.
Do not duplicate `/api` or use the older document's route. All handlers are authenticated and use
ProductAttributes permissions; tenant context comes from authentication, never payload/query overrides.

| Method | Relative route | Permission | Request -> data |
| --- | --- | --- | --- |
| GET | / | VIEW | Attribute controls -> paginated attributes |
| POST | / | CREATE | name, optional status -> attribute (201) |
| GET | /:attributeId | VIEW | ID -> attribute |
| PATCH | /:attributeId | UPDATE | name, optional status (same upsert DTO) -> attribute |
| DELETE | /:attributeId | DELETE | ID -> null |
| GET | /:attributeId/values | VIEW | Value controls -> paginated values |
| POST | /:attributeId/values | CREATE | label, optional status -> value (201) |
| GET | /:attributeId/values/:valueId | VIEW | IDs -> value; not required for row-based forms |
| PATCH | /:attributeId/values/:valueId | UPDATE | label, optional status (same upsert DTO) -> value |
| DELETE | /:attributeId/values/:valueId | DELETE | IDs -> null |

Other successful responses are 200. IDs use ParseUUIDPipe. No bulk, automatic reactivation,
confirmation flags, assignment/reference checks or replacement endpoint is consumed.

## Shapes and listing

Use [data-model.md](../data-model.md) for exact entity/request fields and transitions.
Success: success=true, optional message, data. Paginated data: items, page, pageSize, totalItems,
totalPages. Error: success=false, message:string, optional errors:string[] and errorCode:string.
Neither errors nor value rows embed a reactivation candidate or parent display fields.

List controls: page/pageSize, search, status (ACTIVE/INACTIVE or omitted), sortOrder (ASC/DESC).
Attributes allow sortBy=name/createdAt; values allow only createdAt. Defaults: 1, 10, createdAt,
DESC, both statuses. Search/filtering/counts are server-side; totalPages=0 for no results.
Beyond-last requests retain their page and actual totals. Values filter own status even if parent
is inactive. Name/creation ordering has ID tie-breaking in the same direction. Do not re-sort a page.

## Error consumption

| Verified response | Frontend behavior |
| --- | --- |
| 400 validation message/errors; EMPTY_UPDATE | Preserve form and display safe validation feedback; never send empty PATCH. |
| 400 TENANT_CONTEXT_REQUIRED | Explain context failure; no invented tenant override. |
| 401 / 403 | Existing refresh/unauthorized handling; no authentication changes or duplicate 403 toast. |
| 404 ATTRIBUTE_NOT_FOUND / ATTRIBUTE_VALUE_NOT_FOUND | Unavailable state, back/refresh; no ownership disclosure. |
| 409 ATTRIBUTE_NAME_DUPLICATE_ACTIVE / ATTRIBUTE_VALUE_LABEL_DUPLICATE_ACTIVE | Duplicate feedback; no inactive claim. |
| 409 ATTRIBUTE_NAME_DUPLICATE_INACTIVE / ATTRIBUTE_VALUE_LABEL_DUPLICATE_INACTIVE | Reactivation guidance; View search can locate an actual row; Update needed for explicit reactivation. |
| 409 ATTRIBUTE_NAME_DUPLICATE / ATTRIBUTE_VALUE_LABEL_DUPLICATE | Generic database-fallback duplicate; status unknown, no inferred ID or reactivation. |
| 409 ATTRIBUTE_WRITE_RETRYABLE | Explain concurrent change and allow deliberate retry; no automatic mutation loop. |
| Other/network/500 | Safe message or feature fallback; preserve input and expose retry where appropriate. |

Validate unknown Axios bodies before reading fields. Do not parse prose to infer error codes or
candidate status. No handler is added for an older documented code solely to enforce that document.

## Baseline limits and readiness

No blocking difference from agreed frontend workflows was found. Use current route, current DTO
validation and actual errors. Standard frontend trimmed 1-150 validation stays as agreed; backend
may additionally reject input, which is displayed. Search comparison is backend-owned. valueCount
is advisory; confirmation warns about all values regardless of concurrent count changes.

Earlier backend remediation (route documentation, validation symmetry, conflict requery, comparison/
counting implementation and stronger warning protocols) is deferred by owner decision. It is not a
frontend dependency. No backend edits, restored internals or new business workaround are planned.
This is source verification, not evidence of live API/migration execution.
