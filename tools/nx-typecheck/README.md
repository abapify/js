# nx-typecheck plugin

Adds an automatic `typecheck` target to projects that contain a matching
TypeScript config file. The command defaults to `npx tsc -p tsconfig.json`, but
can be switched to `tsgo` or pointed at a different config file via the plugin
options in `nx.json`.
