## ADDED Requirements

### Requirement: CLI exposes transport tree checkout through a command plugin

The CLI SHALL load `adt flow checkout tr` through the existing dynamic command
plugin system and SHALL delegate behavior to the public `adt-flow` service.

#### Scenario: Checkout transport head

- **GIVEN** the flow command plugin is registered in `adt.config.ts`
- **WHEN** `adt flow checkout tr <TR>` is invoked
- **THEN** the plugin delegates a head checkout in the current working directory
- **THEN** it reports the structured materialization summary

#### Scenario: Checkout transport base

- **GIVEN** the flow command plugin is registered in `adt.config.ts`
- **WHEN** `adt flow checkout tr <TR[,TR...]> --base` is invoked
- **THEN** the plugin delegates a base checkout for the complete transport scope

#### Scenario: Unsupported plan syntax is requested

- **WHEN** a caller looks for a flow plan add/apply command
- **THEN** the CLI exposes no persisted plan command in the MVP

### Requirement: CLI and MCP flow checkout remain equivalent

The CLI command and MCP tool SHALL delegate to the same public `adt-flow`
service and SHALL preserve equivalent arguments, results, and bounded diagnostics.

#### Scenario: MCP checks out a transport boundary

- **GIVEN** the MCP server has an authenticated client, deterministic flow config, and an explicit workspace root
- **WHEN** `flow_checkout_tr` is called with transports and optional `base`
- **THEN** it delegates to the same service operation as `adt flow checkout tr`
- **THEN** it is classified as a workspace-filesystem mutation

#### Scenario: Delivery surfaces use the same fixture

- **GIVEN** CLI and MCP receive the same mocked SAP responses and repository tree
- **WHEN** each checks out the same boundary
- **THEN** changed, moved, removed, unchanged, descriptor, and diagnostic results are equivalent
- **THEN** neither structured response includes source bodies or credentials
