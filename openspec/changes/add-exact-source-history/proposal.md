## Why

Transport review needs the exact source state introduced by a transport, not only the object's current active or inactive source. SAP ADT object metadata exposes per-source-component `relations/versions` links, and a read-only BHF probe confirmed that those links return Atom feeds whose entries reference immutable historical content and the responsible transport.

The repository currently has no typed way to list those entries, read an immutable historical source, or resolve a transport into a per-component before/after manifest. Callers therefore cannot prove a delta and are forced to compare against mutable current state.

## What Changes

- Add a contract-driven repository source-history endpoint for an ADT versions URI and immutable source URI.
- Add a small `@abapify/adt-client` service that normalizes Atom feed entries without inventing URL shapes or logging source bodies.
- Add `@abapify/adk` orchestration that resolves one or more transports into an immutable, per-object and per-component source manifest.
- Preserve SAP provenance and represent added, modified, deleted, ambiguous, unsupported, and failed components explicitly; never label an ambiguous delta exact.
- Add CLI and MCP parity for listing source versions, reading a selected immutable version, and producing a transport source manifest as JSON.
- Add fixtures and tests for a single-source program, a composite class, a new object, deletion/unavailable history, and non-contiguous in-scope versions.

## Capabilities

### New Capabilities

- `adt-source-history`: typed historical source discovery, immutable source reads, and normalized version provenance.
- `transport-source-manifest`: exact per-component before/after selection for one or more transports with explicit uncertainty states.

### Modified Capabilities

- `adt-cli`: exposes source-history and transport-manifest commands without platform-specific dependencies.

## Impact

- **Affected packages**: `adt-contracts`, `adt-client`, `adk`, `adt-cli`, `adt-mcp`, and test fixtures.
- **Dependency graph**: contracts remain below client; transport/object orchestration remains in ADK; CLI and MCP consume the same ADK service.
- **Compatibility**: additive public APIs and commands only; no existing command semantics change.
- **Security**: credentials and source bodies are never written to logs or manifest JSON. A manifest contains immutable ADT references and provenance, not source text.
- **Rollback**: remove the additive contract/service/commands and their exports. Existing current-source and transport-import paths remain unchanged.

## Preconditions and Evidence

- Observed in BHF: a program version feed returned 29 immutable entries; historical content was verified by hash and length only.
- Observed in BHF: a class exposes independently versioned definitions, implementations, macros, testclasses, and main components.
- Existing generated `atomFeed` schema is sufficient and MUST be reused rather than edited.
- Live regression verification remains conditional on valid rotated BHF credentials. Fixture-based tests and package builds are mandatory regardless.
- Baseline workspace typecheck/lint failures that predate this change are recorded separately; validation MUST distinguish new failures from baseline failures.
