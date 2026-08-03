## ADDED Requirements

### Requirement: Check source version is explicit and non-conflicting

The check command SHALL use inactive source by default and SHALL expose source
selection through an option that does not conflict with the root CLI version
flag.

#### Scenario: Source version is omitted

- **WHEN** a caller runs `adt check` without a source-version option
- **THEN** every checked object requests the inactive source version

#### Scenario: Source version is selected

- **WHEN** a caller runs `adt check --source-version <value>`
- **THEN** the selected source version is sent for every checked object
- **THEN** the root CLI version action is not invoked

### Requirement: Check findings determine exit status independently of rendering

The check command SHALL derive error status from normalized SAP reports and
SHALL use the same result for human and JSON output.

#### Scenario: JSON contains an error finding

- **GIVEN** SAP returns a check message with severity `E` or `A`
- **WHEN** JSON output is requested
- **THEN** the command writes one complete valid JSON result
- **THEN** the process status is non-zero

#### Scenario: JSON contains no error finding

- **GIVEN** SAP returns only informational or warning messages
- **WHEN** JSON output is requested
- **THEN** the command writes one complete valid JSON result
- **THEN** warnings are represented without forcing an error status

#### Scenario: SAP returns one report or one message object

- **WHEN** SAP encodes a report or message as a singleton rather than an array
- **THEN** the service normalizes it without losing severity or content
