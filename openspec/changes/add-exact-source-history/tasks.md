## 1. Contract and fixture foundation

- [ ] 1.1 Add sanitized Atom version-feed fixtures for a program and composite class; do not copy real source or credentials. Blocked until the exposed TRL ADT credential is rotated; repository rules require fixtures derived from real SAP responses rather than fabricated XML.
- [x] 1.2 Add repository source-history contracts in `adt-contracts` for a link-provided versions URI and immutable source URI.
- [x] 1.3 Reuse the generated `atomFeed` schema and add descriptor tests for path, Accept header, response schema, and URI validation.
- [x] 1.4 Export the additive contract through the repository and root contract trees.

## 2. Normalize source history in `adt-client`

- [x] 2.1 Write failing tests for Atom feed normalization, multiple transport relations, missing content links, and malformed entries.
- [x] 2.2 Implement `SourceHistoryService.listVersions(versionsUri)` with stable `SourceVersionRef` output and preserved feed order.
- [x] 2.3 Implement `SourceHistoryService.readVersionSource(sourceUri)` through the existing adapter/session stack.
- [x] 2.4 Reject absolute/cross-origin and non-ADT URIs; never include source bodies in structured logs or errors.
- [x] 2.5 Export the service, factory, and public types from `adt-client`.

## 3. Build exact manifests in `@abapify/adk`

- [x] 3.1 Write failing tests for single-TR modified source, composite components, new object, deletion, missing history, and unrelated intervening versions.
- [x] 3.2 Reuse `resolveTransportObjects`, preserve each object's concrete request/task attribution, and return the expanded root-plus-task scope used for history matching.
- [x] 3.3 Discover every source component and its versions relation from object metadata without hardcoding class-only paths.
- [x] 3.4 Implement deterministic base/head selection and explicit `exact`, `changeKind`, and diagnostic states.
- [x] 3.5 Add bounded-concurrency metadata/feed retrieval and deterministic manifest ordering.
- [x] 3.6 Export manifest schemas/types and `buildTransportSourceManifest` from ADK.

## 4. Add CLI parity

- [x] 4.1 Add tests for `adt source versions` JSON output and component filtering.
- [x] 4.2 Add tests for explicit immutable source retrieval to stdout/file without incidental logging.
- [x] 4.3 Add tests for `adt cts tr source-manifest` with one and multiple transport inputs.
- [x] 4.4 Implement the commands using the shared client/ADK services and existing connection handling.
- [x] 4.5 Document exactness states and non-zero exit behavior for failed manifests.

## 5. Add MCP parity

- [x] 5.1 Add `list_source_versions` with metadata-only JSON output.
- [x] 5.2 Add explicit `get_source_version` for a single immutable URI.
- [x] 5.3 Add `cts_transport_source_manifest` backed by the same ADK service as the CLI.
- [ ] 5.4 Add parity tests proving CLI and MCP normalize the same fixture to the same manifest. Tool/service parity is covered; exact Atom/base-head fixture parity remains blocked with 1.1 until a sanitized SAP-derived feed exists.
- [x] 5.5 Bound MCP source output and return typed diagnostics without credentials or raw adapter internals.

## 6. Verify and integrate

- [x] 6.1 Validate this OpenSpec change before implementation.
- [ ] 6.2 Run affected package unit tests and contract tests.
- [ ] 6.3 Run targeted Nx builds for `adt-contracts`, `adt-client`, `adk`, `adt-cli`, and `adt-mcp` with `--skipSync` if workspace references are stale.
- [ ] 6.4 Run targeted lint/typecheck and distinguish pre-existing baseline failures from regressions.
- [ ] 6.5 Run `git diff --check` and inspect generated declarations/exports.
- [ ] 6.6 After TRL credentials are rotated, run one read-only smoke test and record only counts, identifiers, statuses, and content hashes.

## 7. Follow up on direct-task parent provenance

- [x] 7.1 Add a failing resolver test proving a directly requested task expands scope with the parent request returned by SAP.
- [x] 7.2 Include the parent request in manifest provenance matching without changing the task's concrete object attribution.
- [x] 7.3 Verify the task fixture remains exact when immutable source versions are attributed only to the parent request.
