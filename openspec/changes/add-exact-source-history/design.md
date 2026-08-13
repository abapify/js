## Context

`@abapify/adt-contracts` defines ADT HTTP shapes, `@abapify/adt-client` owns the shared adapter/session stack, and `@abapify/adk` owns composite object and transport workflows. CLI and MCP are sibling delivery surfaces and are expected to remain behaviorally equivalent.

ADT source history is link-driven. Object metadata describes one or more source components and gives each component a `relations/versions` link. The version feed then supplies immutable content links and transport provenance. The implementation must follow those links; constructing a guessed `/versions/<id>` URL would couple the client to an unverified server detail.

## Goals / Non-Goals

**Goals:**

- Typed retrieval of an Atom source-version feed through the normal ADT adapter/session stack.
- Normalized, immutable version records suitable for SDK, CLI, MCP, ADT, and CI consumers.
- Per-component transport manifests that select the version immediately before the earliest in-scope change and the latest in-scope version.
- Explicit exactness and failure states for new, deleted, renamed, unsupported, and non-contiguous histories.
- Lazy historical source reads: manifest creation does not download every source body.

**Non-goals:**

- Persisting ABAP source or diffs in `adt-cli`.
- Performing Git commits, branches, or merge requests.
- Reconstructing historical object metadata not exposed by SAP.
- Claiming an exact isolated delta when unrelated transport versions intervene.
- Adding semantic ABAP analysis or editor functionality.

## Decisions

### 1. Link-driven contracts and immutable references

**Decision**: add generic repository operations that accept a validated ADT-relative `versionsUri` or immutable `sourceUri`. The contract parses version feeds with the existing generated `atomFeed` schema; source content remains plain text.

**Rationale**: SAP owns the link shape and media type. Following returned links works across object families and avoids duplicating a contract per ABAP object type.

**Guardrail**: reject absolute or cross-origin URIs at the public service boundary. The adapter remains responsible for joining an ADT-relative path to the configured SAP destination.

### 2. Protocol normalization in client, orchestration in ADK

**Decision**: `SourceHistoryService` in `adt-client` converts the generated Atom union into stable records. `buildTransportSourceManifest` in ADK resolves transport objects, object metadata, source components, and version selection.

**Rationale**: Atom parsing is protocol work reusable by any consumer. Traversing transports and composite ABAP objects is business orchestration and belongs above the client according to the existing ADT Client specification.

### 3. Component is the unit of history

**Decision**: every manifest leaf represents one source component, not one repository object. A class can therefore produce definitions, implementations, macros, testclasses, and main leaves, each with independent provenance.

**Rationale**: live TRL metadata proves those sections are independently versioned. Collapsing them to one object version would produce false before/after pairs.

### 3a. Root and task requests expand to the complete CTS provenance scope

**Decision**: resolving a root transport preserves the concrete request or task
that contributed each object and returns the complete in-scope identifier set
(root plus tasks). Resolving a task also preserves the requested task as the
object source while adding the parent request exposed by SAP to the in-scope
identifier set. Version-feed provenance is matched against that expanded set.

**Rationale**: CTS object lists are aggregated under a root request, while source
history can attribute a change either to the child task or to its parent request,
depending on the SAP release and object family. Replacing either concrete
identity, or omitting the parent for a directly requested task, would make an
exact in-scope version appear unrelated.

### 4. Deterministic version selection with an exactness gate

For each component, preserve SAP feed order and record its observed ordinal. Resolve entries whose transport provenance belongs to the requested transport set.

- **Head**: the newest in-scope entry.
- **Base**: the entry immediately older than the oldest in-scope entry.
- **Added**: a head exists and no older entry exists.
- **Deleted**: the CTS object function marks deletion and a recoverable base exists while head is intentionally absent.
- **Ambiguous**: an out-of-scope entry occurs between the selected oldest and newest in-scope entries, provenance is missing, ordering is not deterministic, or rename semantics are suspected.
- **Unsupported/failed**: the object has no usable version relation or SAP rejects history retrieval.

The manifest can retain candidate references for diagnosis, but `exact` is false for ambiguous, unsupported, and failed entries.

**Rationale**: caller array order cannot define ABAP history. The feed and its transport provenance are authoritative. The explicit gate prevents a visually plausible but incorrect delta.

### 5. Manifest contains references, not source bodies

**Decision**: the JSON manifest includes system-independent object identity, component identity, change kind, exactness, immutable base/head references, timestamps, hashes only when separately computed, and diagnostic codes. It excludes credentials and source text.

**Rationale**: callers can lazily fetch only selected files, source stays in SAP/Git worktrees, and logs/artifacts remain bounded.

### 6. CLI and MCP use the same service

**Decision**: CLI commands and MCP tools call the exported client/ADK services rather than implement their own parsing or selection.

Proposed surfaces:

- `adt source versions <object> --type <type> [--component <name>] --json`
- `adt source version get --uri <immutable-uri> [--output <file>|-]`
- `adt cts tr source-manifest <TR[,TR...]> --json`
- MCP: `list_source_versions`, `get_source_version`, `cts_transport_source_manifest`

Source-returning surfaces require an explicit call; the manifest tool never embeds source content.

## Data Shape

```typescript
type SourceVersionRef = {
  id: string;
  ordinal: number;
  sourceUri: string;
  contentType?: string;
  etag?: string;
  updatedAt?: string;
  author?: string;
  transports: string[];
};

type TransportSourceManifestEntry = {
  object: { pgmid: string; type: string; name: string; packageName?: string };
  component: { id: string; sourceUri: string; versionsUri: string };
  sourceTransport: string;
  changeKind:
    | 'added'
    | 'modified'
    | 'deleted'
    | 'unchanged'
    | 'ambiguous'
    | 'unsupported'
    | 'failed';
  exact: boolean;
  base?: SourceVersionRef;
  head?: SourceVersionRef;
  diagnostic?: { code: string; message: string };
};

type TransportSourceManifest = {
  requestedTransports: string[];
  scopeTransports: string[]; // requested roots plus concrete tasks observed
  entries: TransportSourceManifestEntry[];
};
```

Names are illustrative; final exported schemas remain additive and versionable.

## Risks / Trade-offs

- **Feed variation across SAP releases**: preserve raw optional fields and fail closed when required provenance is absent.
- **Deleted objects may no longer expose metadata**: emit `unsupported`/`failed` unless a usable historical relation is available; do not synthesize content.
- **Large transports**: bound concurrency for metadata/feed reads and never download source bodies during manifest construction.
- **Sensitive source**: keep plain source out of structured logs, MCP manifest responses, and fixtures derived from real systems.
- **Generated schema drift**: reuse `atomFeed`; generated files remain untouched.

## Verification Strategy

1. Contract descriptor tests for media types, URI safety, and schemas.
2. Client unit tests for Atom normalization and malformed/missing links.
3. ADK fixture tests for selection rules and composite components.
4. CLI/MCP parity tests over the same fixtures.
5. Targeted build, test, lint, and typecheck for affected projects with existing baseline failures reported separately.
6. After credential rotation, one safe TRL smoke test that records only identities, counts, status codes, and hashes—not source.

## Open Questions

- Which exact Atom relation value identifies the transport on every supported SAP release? Capture sanitized fixture evidence before locking the parser.
- Can deleted objects reliably expose their version feed after deletion in all target landscapes?
- Are historical metadata-only changes reconstructible, or must the manifest explicitly remain source-only?
