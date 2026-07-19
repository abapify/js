## ADDED Requirements

### Requirement: CLI exposes source history without platform dependencies

The CLI SHALL expose machine-readable commands for listing source versions, explicitly reading one immutable source version, and producing a transport source manifest through direct ADT integration.

#### Scenario: List version metadata

- **GIVEN** valid SAP connection configuration and an object/component identity
- **WHEN** `adt source versions` is invoked with JSON output
- **THEN** it prints normalized version metadata and provenance
- **THEN** it does not print source bodies or credentials

#### Scenario: Build a multi-transport manifest

- **GIVEN** a deterministic list of transport identifiers
- **WHEN** `adt cts tr source-manifest` is invoked
- **THEN** it prints the component-granular manifest produced by ADK
- **THEN** ambiguous or failed entries are visible and affect the documented exit status

### Requirement: CLI and MCP source-history behavior is equivalent

CLI commands and MCP tools SHALL use the same client/ADK services and SHALL produce equivalent normalized records for the same SAP responses.

#### Scenario: Shared fixture is consumed

- **GIVEN** CLI and MCP are run against the same sanitized version-feed fixture
- **WHEN** each surface lists versions or builds a manifest
- **THEN** component identities, base/head references, change kinds, exactness, and diagnostic codes match
