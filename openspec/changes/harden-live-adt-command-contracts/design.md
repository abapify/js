## Context

CTS lifecycle commands currently call generic user-action endpoints and mutate
the in-memory ADK object after any successful HTTP response. Live SAP evidence
showed that these requests can return HTTP 200 without releasing a transport or
changing its owner. The check command also implements response interpretation
inside the Commander action, where the root `--version` option collides with its
source-version option and JSON output bypasses error exit handling.

The repository is contract-first: HTTP descriptors belong in `adt-contracts`,
transport orchestration belongs in ADK, reusable delivery logic belongs in CLI
services, and MCP wraps the same services rather than duplicating behavior.

## Goals / Non-Goals

**Goals:**

- Make release, change-owner, and task-creation success reflect durable SAP
  state.
- Preserve typed contracts and shared CLI/MCP behavior.
- Keep recursive owner changes limited to modifiable tasks.
- Make check source selection unambiguous and CI exit behavior independent of
  output format.

**Non-Goals:**

- Root transport-request creation, deletion, import, branch, or merge workflow
  changes.
- Release scheduling, retries, background polling, or event delivery.
- Changing SAP check semantics or suppressing findings.
- Adding consumer-specific credentials, systems, or workflow identifiers.

## Decisions

### 1. Use the SAP operation that owns each lifecycle transition

Release uses the transport's `newreleasejobs` collection and its typed release
report rather than a generic `useraction=release` body. Change-owner uses PUT on
the transport resource with the typed `changeowner` body rather than POST. Task
creation follows the request's `newtask` relation at `/{request}/tasks` with a
typed target-user body.

The alternative of accepting HTTP 200 from the legacy calls is rejected because
it produced verified no-op responses on a supported SAP system.

### 2. Verify postconditions before mutating local state

The lifecycle service interprets bounded release diagnostics and reads the
transport again. Release succeeds only when read-back status is released;
change-owner succeeds only when read-back owner matches the normalized target.
Task creation succeeds only when parent read-back contains a new modifiable task
owned by the normalized target user. The ADK object updates its cached state
only after verification.

The alternative of trusting only the response payload is rejected because
endpoint response shapes vary and the observed no-op still returned success.

### 3. Keep orchestration shared and delivery adapters thin

ADK owns the SAP lifecycle sequence. CLI service functions return structured
results and are exported for MCP use. Commander actions and MCP tools only map
arguments, render results, and map failures to their transport-specific error
mechanism. Recursive owner change invokes the same verified operation for each
modifiable task and skips released tasks.

### 4. Separate check execution from check rendering

A reusable check service builds the request with `inactive` as the default,
normalizes one-or-many reports/messages, and derives `hasErrors` and
`hasWarnings`. The command exposes `--source-version`; the root `--version`
option remains reserved for CLI version output. Human and JSON rendering consume
the same result, and `E` or `A` messages set a failing process status only after
complete JSON has been written.

## Risks / Trade-offs

- **Additional read-back requests** → Lifecycle commands cost one bounded GET,
  accepted in exchange for eliminating false success.
- **SAP release-report variation** → Parse through typed schemas and fail closed
  on explicit failure or an unverified final state.
- **Existing scripts use `adt check --version`** → The option never reliably
  reached the subcommand because of the root collision; document and test
  `--source-version` as the supported migration.
- **Partial recursive reassignment** → Report the first verified failure and do
  not claim recursive success; already verified earlier changes are not rolled
  back because SAP offers no transaction across transports.

## Migration Plan

1. Add contract and service regression tests that reproduce the no-op and JSON
   exit defects.
2. Introduce typed lifecycle operations and shared services without changing
   command names.
3. Update CLI/MCP adapters and parity tests.
4. Publish an immutable image from the protected stable mirror and prove the
   operations against a disposable Workbench transport/task, including creation of
   a second task for an incremental change.
5. Roll back the image pointer if an unsupported SAP release rejects the typed
   operations; never restore optimistic success as a silent fallback.

## Open Questions

None for the supported SAP systems. Additional SAP releases can add sanitized
release-report fixtures without changing the verified-postcondition contract.
