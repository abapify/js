## ADDED Requirements

### Requirement: Review checks are available as non-mutating analysis

The server SHALL classify `atc_run` and `run_unit_tests`, including coverage,
as read operations and SHALL advertise and dispatch them for an authenticated
credential containing `server` and `read` authority for the selected
Destination.

#### Scenario: Delegated assistant runs ATC for a transport

- **GIVEN** a delegated assistant has read authority for one Destination
- **WHEN** it lists tools and calls `atc_run` with a transport-request scope
- **THEN** `atc_run` is advertised and the ATC findings are returned without a
  separate approval

#### Scenario: Delegated assistant runs AUnit with coverage

- **GIVEN** a delegated assistant has read authority for one Destination
- **WHEN** it calls `run_unit_tests` with coverage enabled for an object
- **THEN** test and coverage results are returned without a separate approval

#### Scenario: Read authority remains non-mutating

- **WHEN** the same assistant lists or calls a mutation
- **THEN** the operation is absent or denied before SAP mutation

### Requirement: Stricter scoped ATC remains supported

The server SHALL continue to accept an exact object-bound `safe_execute`
credential for `atc_run` or `run_unit_tests` when a workflow chooses that
narrower execution policy.

#### Scenario: Workflow supplies an exact ATC grant

- **WHEN** a valid scoped `safe_execute` credential names `atc_run` and exact
  object keys
- **THEN** catalogue and dispatch enforce the existing scoped policy
