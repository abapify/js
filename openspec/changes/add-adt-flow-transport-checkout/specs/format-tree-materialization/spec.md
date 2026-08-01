## ADDED Requirements

### Requirement: Format plugins can materialize a desired object tree

A format plugin that supports flow checkout SHALL expose a pure materialization
capability that converts an object, object type, explicit source components,
package path, and format options into a deterministic set of repository-relative
files.

#### Scenario: Historical source override is supplied

- **GIVEN** a consumer supplies explicit content for a versioned source component
- **WHEN** the format materializer serializes the object
- **THEN** the corresponding source artifact contains the supplied content
- **THEN** the materializer does not fetch mutable source through the object model

#### Scenario: Desired tree is calculated

- **WHEN** a format materializer runs successfully
- **THEN** it returns relative paths, contents, encodings, and semantic roles
- **THEN** it performs no filesystem write, deletion, ADT request, or Git operation

### Requirement: Format paths and ownership are deterministic

The same normalized input and format options SHALL produce the same desired
paths and contents, and every output path SHALL belong to exactly one canonical
object identity.

#### Scenario: Same object is materialized twice

- **GIVEN** identical object metadata, source contents, package path, and options
- **WHEN** the format materializer runs twice
- **THEN** both ordered output sets are byte-for-byte equivalent

#### Scenario: Format emits an unsafe or duplicate path

- **GIVEN** a format adapter emits a path that escapes the repository or duplicates another output path
- **WHEN** the consumer validates the desired tree
- **THEN** materialization is rejected before filesystem mutation

### Requirement: abapGit implements tree materialization in the MVP

The abapGit plugin SHALL implement pure desired-tree materialization by reusing
its registered object handlers, schemas, and folder logic.

#### Scenario: Class has multiple source components

- **GIVEN** explicit main and include sources for a class
- **WHEN** abapGit materialization runs
- **THEN** it emits the standard class XML and matching abapGit source files
- **THEN** each source file is associated with its source-component identity

#### Scenario: Object type is unsupported

- **GIVEN** an object type has no registered abapGit handler
- **WHEN** materialization is requested
- **THEN** the adapter returns a typed unsupported-format diagnostic
- **THEN** it emits no partial desired tree

### Requirement: Materialization is additive to legacy format behavior

Adding the pure materialization capability SHALL NOT change existing
filesystem import or Git-to-SAP export behavior.

#### Scenario: Existing importer is used

- **WHEN** an existing caller invokes the legacy format import API
- **THEN** its public inputs, outputs, and filesystem semantics remain compatible

#### Scenario: Future format implements the capability

- **GIVEN** another format plugin implements desired-tree materialization
- **WHEN** it is selected by a future flow configuration
- **THEN** flow reconciliation can consume it without importing that concrete format package
