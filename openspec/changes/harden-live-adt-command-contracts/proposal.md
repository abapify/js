## Why

Live SAP verification showed that a successful HTTP response does not prove a
CTS lifecycle action occurred: the legacy release and change-owner requests can
return success while leaving the transport unchanged. The check command also
has a global-option collision and can emit error findings as JSON while exiting
successfully, which makes CI automation unreliable.

## What Changes

- Use SAP's release-job endpoint for transport/task release, interpret its
  release report, and confirm the resulting released state before reporting
  success.
- Use the typed transport update operation for change-owner and confirm the
  resulting owner before reporting success; preserve optional recursion over
  modifiable child tasks.
- Share CTS lifecycle behavior across SDK, CLI, and MCP surfaces instead of
  duplicating optimistic command logic.
- Replace the check subcommand's conflicting source `--version` option with a
  non-conflicting `--source-version` option and default it to `inactive`.
- Preserve valid JSON output for check results while returning a failing process
  status when SAP reports error or abort messages.

## Capabilities

### New Capabilities

- `cts-transport-lifecycle`: Verified release and owner-change operations with typed SAP contracts, read-back, and CLI/MCP parity.
- `adt-check-execution`: Deterministic source-version selection and machine-readable error exit behavior for ADT checks.

### Modified Capabilities

None.

## Impact

- Affected packages: `adt-contracts`, `adk`, `adt-cli`, `adt-fixtures`, and
  `adt-mcp`.
- Public behavior changes from optimistic lifecycle success to verified success
  or a bounded error; existing command names remain stable.
- `adt check --version` is replaced by `adt check --source-version` because the
  former is consumed by the root CLI version flag before the subcommand runs.
- No new dependency, credential, mutable-source fallback, or consumer-specific
  workflow is introduced.
- Rollback restores the former command/contract implementations, but would also
  restore the observed false-success behavior and is therefore suitable only as
  an emergency compatibility measure.
