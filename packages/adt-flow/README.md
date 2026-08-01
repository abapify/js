# @abapify/adt-flow

Incremental transport source-tree materialization for ADT. The service checks
out either the exact source boundary immediately before a transport scope or
the newest exact source in that scope.

Register the command and configure the active format in `adt.config.ts`:

```typescript
import { defineConfig } from '@abapify/adt-config';

export default defineConfig({
  commands: ['@abapify/adt-flow/commands/flow'],
  flow: {
    format: { id: 'abapgit', options: { folderLogic: 'prefix' } },
    include: { objectTypes: ['CLAS', 'INTF'] },
    concurrency: { metadata: 4, sources: 4 },
  },
});
```

Then reconcile the current directory to either side of the transport boundary:

```text
adt flow checkout tr DEVK900001 --base
adt flow checkout tr DEVK900001
adt flow checkout tr DEVK900001,DEVK900002 --base
```

```typescript
import { createAdtFlowService } from '@abapify/adt-flow';

const flow = createAdtFlowService({
  format: registeredFormatPlugin,
  buildManifest,
  readSource,
  loadObject,
});

await flow.checkout({
  root: process.cwd(),
  transports: ['DEVK900001'],
  mode: 'base',
  config: {
    format: { id: 'abapgit', options: { folderLogic: 'prefix' } },
    include: { objectTypes: ['CLAS', 'INTF'] },
  },
});
```

The service invokes no Git command. It reconciles format-owned files and
deterministic descriptors under `.adt`, rejects unowned collisions or modified
indexed files before mutation, and rolls back a failed multi-file apply.
Branches, commits, routing, and merge requests remain the caller's concern.

`.adt/tr/<transport>.json` is emitted only for head checkout. Object
descriptors use `.adt/objects/<TYPE>/<unique-name>.<type>.adt.json`. The index
stores hashes and immutable version identities, never source bodies or
credentials. Removing `.adt` only removes the optimization; source selection
continues to come from the supplied SAP manifest operation.

Exactness applies to versioned source components. Metadata files describe the
object metadata available at checkout time; flow does not reconstruct historical
metadata or replicate repository history.
