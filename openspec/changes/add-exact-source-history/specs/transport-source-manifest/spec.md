## ADDED Requirements

### Requirement: Transport manifests are component-granular

The ADK SHALL resolve a transport request or ordered transport set into one manifest entry per source component and SHALL preserve the CTS object and source-transport identity for every entry.

#### Scenario: Composite class has independent history

- **GIVEN** a class exposes definitions, implementations, macros, testclasses, and main version relations
- **WHEN** a transport source manifest is built
- **THEN** each available component has a separate manifest entry
- **THEN** base/head selection is performed independently for every component

#### Scenario: Root request contains task-owned changes

- **GIVEN** a requested root transport contains objects contributed by child tasks
- **WHEN** a transport source manifest is built
- **THEN** each object preserves its concrete request or task source identity
- **THEN** history matching uses the expanded scope containing the root and its tasks

#### Scenario: Direct task history is attributed to its parent request

- **GIVEN** a directly requested task exposes its parent request in CTS metadata
- **GIVEN** SAP source history attributes the task's immutable versions to that parent request
- **WHEN** a transport source manifest is built for the task
- **THEN** the object preserves the requested task as its concrete source identity
- **THEN** history matching uses a scope containing both the task and its parent request

### Requirement: Exact base and head selection is deterministic

For a component with contiguous in-scope history, the manifest SHALL select the newest in-scope version as head and the version immediately older than the oldest in-scope version as base.

#### Scenario: One transport modifies an existing component

- **GIVEN** a component feed contains an in-scope version followed by an older out-of-scope version
- **WHEN** the manifest is built
- **THEN** the in-scope version is selected as head
- **THEN** the immediately older version is selected as base
- **THEN** the entry is `modified` and exact

#### Scenario: In-scope version has no predecessor

- **GIVEN** the oldest version of a component belongs to the requested transport set
- **WHEN** the manifest is built
- **THEN** the component is `added`
- **THEN** head is present and base is absent

### Requirement: Ambiguity fails closed

The manifest SHALL NOT claim exactness when provenance is insufficient or an unrelated version occurs between the oldest and newest selected in-scope versions.

#### Scenario: Unrelated transport intervenes

- **GIVEN** an out-of-scope version occurs between two in-scope versions of the same component
- **WHEN** the manifest is built
- **THEN** the entry is `ambiguous` and `exact` is false
- **THEN** a typed diagnostic identifies intervening history without embedding source text

#### Scenario: Object history is unavailable

- **GIVEN** an object exposes no usable versions relation or SAP rejects the history request
- **WHEN** the manifest is built
- **THEN** the entry is `unsupported` or `failed`
- **THEN** no mutable current source is silently used as a historical substitute

### Requirement: Deletions and renames are explicit

CTS deletion markers SHALL be represented as deleted only when a recoverable base is available. Rename-like or otherwise unprovable transitions SHALL remain ambiguous or unsupported.

#### Scenario: Deleted component has historical base

- **GIVEN** CTS marks an object deleted and a historical source version is recoverable
- **WHEN** the manifest is built
- **THEN** the entry is `deleted`
- **THEN** base is present and head is absent

#### Scenario: Rename cannot be proven

- **GIVEN** CTS/object metadata suggests a rename but does not link old and new identities
- **WHEN** the manifest is built
- **THEN** the manifest does not infer a rename
- **THEN** affected entries are marked ambiguous or unsupported

### Requirement: Manifest construction is metadata-only and bounded

Manifest construction SHALL fetch object metadata and version feeds with bounded concurrency and SHALL return immutable references without source bodies.

#### Scenario: Large transport is resolved

- **GIVEN** a transport contains many objects and components
- **WHEN** the manifest is built
- **THEN** metadata/feed requests respect the configured concurrency bound
- **THEN** output order is deterministic
- **THEN** no historical source body is downloaded
