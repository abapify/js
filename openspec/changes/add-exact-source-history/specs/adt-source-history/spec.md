## ADDED Requirements

### Requirement: Source versions are discovered from ADT links

The client SHALL list historical source versions by following a versions URI supplied by SAP ADT metadata and SHALL NOT construct a version endpoint from an assumed object URL pattern.

#### Scenario: Version feed is available

- **GIVEN** object metadata contains a source component with a `relations/versions` link
- **WHEN** a consumer lists versions for that link
- **THEN** the request uses the normal ADT adapter and session stack
- **THEN** the Atom entries are returned as normalized immutable version references in SAP feed order

#### Scenario: Unsafe URI is supplied

- **GIVEN** a caller supplies an absolute, cross-origin, or non-ADT URI
- **WHEN** a source-history operation is requested
- **THEN** the operation fails before an HTTP request is sent

### Requirement: Version records preserve provenance

Every normalized version record SHALL preserve its immutable content URI, observed feed ordinal, identifier, available timestamp/author/ETag/content type, and all transport provenance exposed by SAP.

#### Scenario: One version references a transport task

- **GIVEN** an Atom entry links the version to a concrete transport task
- **WHEN** the entry is normalized
- **THEN** that transport identifier is included in the version record
- **THEN** the immutable source link remains unchanged

#### Scenario: Required provenance is missing

- **GIVEN** an Atom entry has no usable immutable source link
- **WHEN** the feed is normalized
- **THEN** the entry is rejected or marked invalid with a typed diagnostic
- **THEN** no mutable current-source URI is substituted

### Requirement: Historical source reads are explicit and immutable

The client SHALL read historical source only from an immutable URI returned by SAP, and listing versions or building a manifest SHALL NOT download source bodies.

#### Scenario: Consumer reads one selected version

- **GIVEN** a normalized version record with an immutable source URI
- **WHEN** the consumer explicitly requests its content
- **THEN** the client returns the plain source through the existing adapter/session stack

#### Scenario: Consumer only lists versions

- **WHEN** the consumer requests version metadata
- **THEN** no immutable source body endpoint is called

### Requirement: Source content is excluded from structured diagnostics

Source-history operations SHALL NOT include ABAP source text or credentials in structured logs, manifest JSON, or thrown diagnostic messages.

#### Scenario: Historical source retrieval fails

- **WHEN** SAP rejects an immutable source request
- **THEN** the diagnostic includes a bounded operation code and safe endpoint identity
- **THEN** it excludes response source content and credentials
