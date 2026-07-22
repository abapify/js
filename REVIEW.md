# Review Policy

These rules must always be observed when reviewing or contributing to `abapify/adt-cli`. They are the source of truth for what makes a PR merge-ready.

## Non-negotiable quality gates

- `bunx nx build` succeeds for the affected packages and for the full workspace when touched.
- `bunx nx test` passes for the affected packages; new behavior is covered by a unit/integration test or the PR explains why it cannot be tested without an SAP system.
- `bunx nx typecheck` produces no TypeScript errors.
- `bunx nx lint` produces no errors and auto-fixes are applied.
- `bunx nx format:write` is run before every commit; `bunx nx format:check` passes before push.
- No secrets, credentials, tokens, or `.env` files are committed.
- No `any` type or reflection-based lazy attribute access without a documented reason and a TODO linking to a cleanup issue.

## Dependencies and CI

- Keep `bun.lock` tracked and prevent private registry URLs through repository registry configuration or CI validation. The workspace uses Bun workspaces and `workspace:*` protocol.
- `package.json` workspace declarations, `nx.json`, and `bun.lock` must remain consistent.
- GitHub Actions workflow versions must be pinned to real, current release tags.
- OIDC trusted publishing is used for npm releases; no `NPM_TOKEN` secret is committed.

## Agent-facing artifacts

- The root `AGENTS.md` and `.agents/repo-guide.md` are updated when build/test conventions or repository layout change.
- The root `REVIEW.md` (this file) is updated when the review policy changes.
- `.agents/rules/` are the single source of truth for agent behavior. `.cursor/` is a thin native wrapper with Cursor-specific `.mdc` rules and command frontmatter that point to `.agents/`. `.windsurf/` is a deprecated redirect-stub layer.
- `website/docs/` is a 1-to-1 projection of code where possible. Run `bun .agents/skills/docs-sync/scripts/check-structure.ts` before declaring docs work complete; run `bun .agents/skills/docs-sync/scripts/generate-stubs.ts --write` to materialise missing stubs.

## Code and design

### Schema → Contract → Client flow

The type pipeline is intentional and must not be short-circuited:

```text
SAP XSD files
  → ts-xsd (parse + type inference)
  → adt-schemas (schema literals as TypeScript exports)
  → adt-contracts (specific endpoint descriptors wrapping schemas)
  → adt-client (executes contracts, full type inference at call site)
```

- Fix XSD or the generator; do not hand-edit schema literals in `packages/*/src/schemas/generated/**` or `packages/adt-schemas/.xsd/sap/**`.
- Contracts in `adt-contracts` must reference schemas exported from `adt-schemas`.
- `adt-client` consumes contracts; it does not re-declare endpoint shapes.

### MCP ↔ CLI parity

- Every CLI subcommand must have a matching MCP tool, and every MCP tool must have a matching CLI subcommand, except HTTP-transport lifecycle tools (`sap_connect` / `sap_disconnect`).
- MCP tool handlers delegate to CLI service functions exported from `packages/adt-cli/src/index.ts`.
- New features add the CLI command **and** the MCP tool in the same change, plus a parity test in `packages/adt-cli/tests/e2e/parity.*.test.ts`.
- `adt-cli` must never depend on `adt-mcp` (forbidden cycle). `adt-mcp` → `adt-cli` is required.

### Generated and downloaded artifacts

| Pattern                               | Lifecycle           | Rule                                                   |
| ------------------------------------- | ------------------- | ------------------------------------------------------ |
| `packages/*/src/schemas/generated/**` | Codegen output      | Never edit — fix the generator or XSD source           |
| `packages/adt-schemas/.xsd/sap/**`    | Downloaded from SAP | Never edit — create custom extension in `.xsd/custom/` |
| `packages/adt-schemas/.xsd/custom/**` | Hand-maintained     | Safe to edit                                           |
| `packages/*/dist/**`                  | Build output        | Never edit                                             |

If an edit keeps "reverting", something is regenerating the file. Stop and check Nx targets before force-writing.

## Merge readiness

A PR is merge-ready only when:

1. The scope and implementation match the PR title and description.
2. All local quality gates pass (`build`, `test`, `typecheck`, `lint`, `format:check`).
3. All required CI checks are green on the current HEAD.
4. All SAST/security annotations are triaged (fixed, suppressed with reason, or out-of-scope with a linked issue).
5. All review threads are resolved with either a code change or a documented decision in the thread.
6. This `REVIEW.md` is respected; if the PR changes the policy, `REVIEW.md` itself is updated in the same PR.
