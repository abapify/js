---
name: adt-tools
description: Use the adt CLI and adt-mcp API inside the Gas City workspace
---

# adt-tools

This skill documents how Gas City agents use the `adt` CLI and `adt-mcp`
API that are wired into the city as pack commands.

## Setup

Make sure the `adt-cli` rig points at the `abapify/adt-cli` checkout and
the packages are built:

```bash
bunx nx build adt-cli adt-mcp
```

If the rig path is not the repo root, set `ADT_RIG_ROOT` before calling the
commands:

```bash
export ADT_RIG_ROOT=/path/to/adt-cli-checkout
```

## adt CLI

The pack exposes the `adt` binary under the pack command namespace:

```bash
gc adt-cli-gascity adt source get ZCL_EXAMPLE --type CLAS --grep do_something --json
gc adt-cli-gascity adt source get ZCL_EXAMPLE --type CLAS --method DO_SOMETHING
gc adt-cli-gascity adt source put ZCL_EXAMPLE /path/to/source.abap --type CLAS
```

All connection options come from environment variables or `~/.adt/config.json`
just like the normal CLI.

## adt-mcp HTTP API

Start the Streamable HTTP server:

```bash
gc adt-cli-gascity adt-mcp-http --auth-mode none --port 3000
```

Smoke test:

```bash
curl -sf http://127.0.0.1:3000/healthz
```

Call a tool (initialize first, then capture `Mcp-Session-Id`):

```bash
curl -H 'Content-Type: application/json' \
  -X POST http://127.0.0.1:3000/mcp \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"gc","version":"0"}}}'
```

After initialization, call `get_source` or other tools as documented in
`packages/adt-mcp/README.md`.
