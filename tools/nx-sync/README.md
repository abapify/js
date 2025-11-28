# nx-sync plugin

Custom Nx plugin that keeps nested Nx workspaces in sync whenever the root
workspace executes `nx sync`.

The `nested` sync generator looks for nested `nx.json` files that are not
ignored by `.nxignore`. If any of those workspaces are out of sync, the
generator reports them during `nx sync --check` and automatically runs
`nx sync` inside each nested workspace when the root workspace is synced.
