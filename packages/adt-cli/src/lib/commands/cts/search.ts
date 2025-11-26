/**
 * adt cts search - Search transports
 * 
 * Uses v2 client services layer with proper search configuration.
 */

import { Command } from 'commander';
import { getAdtClientV2 } from '../../utils/adt-client-v2';

// Tree characters
const T = {
  branch: '├──',
  last: '└──',
  pipe: '│  ',
  space: '   ',
};

// Status icons
const STATUS_ICONS: Record<string, string> = {
  D: '📝', // Modifiable
  R: '🔒', // Released
  L: '🔐', // Locked
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatTransportTree(result: any): void {
  // Handle workbench and customizing categories
  const categories = ['workbench', 'customizing'];
  
  for (const category of categories) {
    const data = result[category];
    if (!data?.target?.length) continue;

    console.log(`\n📦 ${data.category || category.toUpperCase()}`);

    for (const target of data.target) {
      // Modifiable requests
      if (target.modifiable?.request?.length) {
        console.log(`${T.branch} 📂 Modifiable`);
        printRequests(target.modifiable.request, T.pipe);
      }

      // Released requests
      if (target.released?.request?.length) {
        const isLast = !target.modifiable?.request?.length;
        console.log(`${isLast ? T.last : T.branch} 📁 Released`);
        printRequests(target.released.request, isLast ? T.space : T.pipe);
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function printRequests(requests: any[], indent: string): void {
  requests.forEach((req, reqIdx) => {
    const isLastReq = reqIdx === requests.length - 1;
    const reqPrefix = isLastReq ? T.last : T.branch;
    const reqIndent = isLastReq ? T.space : T.pipe;
    const statusIcon = STATUS_ICONS[req.status] || '📄';

    console.log(`${indent}${reqPrefix} ${statusIcon} ${req.number} - ${req.desc || '(no description)'}`);
    console.log(`${indent}${reqIndent}   👤 ${req.owner}`);

    // Print tasks
    if (req.task?.length) {
      req.task.forEach((task: any, taskIdx: number) => {
        const isLastTask = taskIdx === req.task.length - 1;
        const taskPrefix = isLastTask ? T.last : T.branch;
        const taskIndent = isLastTask ? T.space : T.pipe;
        const taskStatusIcon = STATUS_ICONS[task.status] || '📄';

        console.log(`${indent}${reqIndent}${taskPrefix} ${taskStatusIcon} ${task.number} - ${task.desc || '(no description)'}`);

        // Print objects count
        const objCount = task.abap_object?.length || 0;
        if (objCount > 0) {
          console.log(`${indent}${reqIndent}${taskIndent}   📎 ${objCount} object${objCount > 1 ? 's' : ''}`);
        }
      });
    }

    // Print direct objects on request (for released tasks)
    const directObjCount = req.abap_object?.filter((o: any) => o.pgmid !== 'CORR')?.length || 0;
    if (directObjCount > 0 && !req.task?.length) {
      console.log(`${indent}${reqIndent}   📎 ${directObjCount} object${directObjCount > 1 ? 's' : ''}`);
    }
  });
}

export const ctsSearchCommand = new Command('search')
  .description('Search transport requests')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const client = await getAdtClientV2();

      console.log('🔍 Searching transports...');

      // Use transport service - handles config lookup automatically
      const result = await client.services.transports.list();

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        formatTransportTree(result);
      }

      console.log('\n✅ Search complete');
    } catch (error) {
      console.error('❌ Search failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
