## 1. CTS contracts and ADK lifecycle

- [x] 1.1 Add failing contract tests for PUT change-owner and POST release jobs with no optimistic legacy fallback.
- [x] 1.2 Implement the typed release-job and change-owner contracts without editing generated schemas.
- [x] 1.3 Add failing ADK tests for release-report failure, release no-op read-back, owner no-op read-back, and recursive modifiable-task handling.
- [x] 1.4 Implement verified ADK release and owner-change orchestration and mutate cached state only after postconditions pass.

## 2. CTS delivery parity

- [x] 2.1 Extract structured CTS lifecycle services for command and MCP reuse.
- [x] 2.2 Update CLI and MCP adapters to delegate to the shared services and preserve equivalent bounded failures.
- [x] 2.3 Add focused CLI/MCP parity tests for verified release and reassign results.

## 3. Check execution

- [x] 3.1 Add failing service/command tests for inactive default, source-version option routing, and JSON error exit status.
- [x] 3.2 Implement normalized check execution with shared `hasErrors` and `hasWarnings` derivation.
- [x] 3.3 Replace the conflicting child `--version` option with `--source-version` and document the supported syntax.
- [x] 3.4 Preserve complete JSON output while setting a failing process status for `E` or `A` findings.

## 4. Verification and rollout

- [x] 4.1 Run focused package tests, contract tests, lint, typecheck, build, format, and strict OpenSpec validation.
- [ ] 4.2 Prove release and owner-change behavior against a disposable Workbench request/task and record only non-sensitive identifiers and statuses.
- [ ] 4.3 Publish the protected stable mirror image and rerun the incremental consumer-sandbox transport checkout proof.
